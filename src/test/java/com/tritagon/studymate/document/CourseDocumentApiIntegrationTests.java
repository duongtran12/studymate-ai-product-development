package com.tritagon.studymate.document;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CourseDocumentApiIntegrationTests {

	private static final Path STORAGE_ROOT = Path.of("target", "document-api-test-storage").toAbsolutePath().normalize();
	private static final long OWNER_ID = 101;
	private static final long OTHER_USER_ID = 202;
	private static final long COURSE_ID = 1001;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JdbcTemplate jdbc;

	@DynamicPropertySource
	static void storageProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", () -> "jdbc:h2:mem:document-api;MODE=PostgreSQL;"
				+ "DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;"
				+ "DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
		registry.add("studymate.storage.local-root", STORAGE_ROOT::toString);
	}

	@BeforeEach
	void setUp() throws IOException {
		jdbc.update("DELETE FROM documents");
		jdbc.update("DELETE FROM courses");
		jdbc.update("DELETE FROM users");
		clearStorage();

		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OWNER_ID, "owner@example.com", "hash", "Owner");
		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OTHER_USER_ID, "other@example.com", "hash", "Other");
		jdbc.update("INSERT INTO courses (id, owner_id, name, code) VALUES (?, ?, ?, ?)",
				COURSE_ID, OWNER_ID, "Software Architecture", "SWA301");
	}

	@AfterAll
	static void cleanUpStorage() throws IOException {
		clearStorage();
	}

	@Test
	void ownerCanUploadListGetAndDeleteDocument() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"C:\\fakepath\\chapter-05.pdf",
				"application/pdf",
				"sample-pdf-content".getBytes());

		MvcResult uploadResult = mockMvc.perform(multipart("/api/v1/courses/{courseId}/documents", COURSE_ID)
				.file(file)
				.header("X-User-Id", OWNER_ID))
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", org.hamcrest.Matchers.matchesPattern(
						"/api/v1/courses/" + COURSE_ID + "/documents/\\d+")))
				.andExpect(jsonPath("$.courseId").value(COURSE_ID))
				.andExpect(jsonPath("$.fileName").value("chapter-05.pdf"))
				.andExpect(jsonPath("$.contentType").value("application/pdf"))
				.andExpect(jsonPath("$.processingStatus").value("UPLOADED"))
				.andExpect(jsonPath("$.storagePath").doesNotExist())
				.andReturn();

		long documentId = ((Number) com.jayway.jsonpath.JsonPath.read(
				uploadResult.getResponse().getContentAsString(), "$.id")).longValue();
		String storagePath = jdbc.queryForObject(
				"SELECT storage_path FROM documents WHERE id = ?", String.class, documentId);
		Path storedFile = STORAGE_ROOT.resolve(storagePath).normalize();
		assertThat(storedFile).startsWith(STORAGE_ROOT);
		assertThat(storedFile).exists();

		mockMvc.perform(get("/api/v1/courses/{courseId}/documents", COURSE_ID)
				.header("X-User-Id", OWNER_ID))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].id").value(documentId));

		mockMvc.perform(get("/api/v1/courses/{courseId}/documents/{documentId}", COURSE_ID, documentId)
				.header("X-User-Id", OWNER_ID))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.fileName").value("chapter-05.pdf"));

		mockMvc.perform(delete("/api/v1/courses/{courseId}/documents/{documentId}", COURSE_ID, documentId)
				.header("X-User-Id", OWNER_ID))
				.andExpect(status().isNoContent());

		assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM documents", Integer.class)).isZero();
		assertThat(storedFile).doesNotExist();
	}

	@Test
	void rejectsUnsupportedUploadWithoutCreatingMetadataOrFile() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
				"file", "notes.txt", "text/plain", "not-a-document".getBytes());

		mockMvc.perform(multipart("/api/v1/courses/{courseId}/documents", COURSE_ID)
				.file(file)
				.header("X-User-Id", OWNER_ID))
				.andExpect(status().isBadRequest());

		assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM documents", Integer.class)).isZero();
		assertThat(Files.exists(STORAGE_ROOT)).isFalse();
	}

	@Test
	void otherUserCannotAccessDocumentsFromCourseTheyDoNotOwn() throws Exception {
		MockMultipartFile ownerFile = new MockMultipartFile(
				"file", "private.pdf", "application/pdf", "private-content".getBytes());
		MvcResult uploadResult = mockMvc.perform(multipart("/api/v1/courses/{courseId}/documents", COURSE_ID)
				.file(ownerFile)
				.header("X-User-Id", OWNER_ID))
				.andExpect(status().isCreated())
				.andReturn();
		long documentId = ((Number) com.jayway.jsonpath.JsonPath.read(
				uploadResult.getResponse().getContentAsString(), "$.id")).longValue();
		String storagePath = jdbc.queryForObject(
				"SELECT storage_path FROM documents WHERE id = ?", String.class, documentId);

		mockMvc.perform(get("/api/v1/courses/{courseId}/documents", COURSE_ID)
				.header("X-User-Id", OTHER_USER_ID))
				.andExpect(status().isNotFound());
		mockMvc.perform(get("/api/v1/courses/{courseId}/documents/{documentId}", COURSE_ID, documentId)
				.header("X-User-Id", OTHER_USER_ID))
				.andExpect(status().isNotFound());
		mockMvc.perform(delete("/api/v1/courses/{courseId}/documents/{documentId}", COURSE_ID, documentId)
				.header("X-User-Id", OTHER_USER_ID))
				.andExpect(status().isNotFound());
		mockMvc.perform(multipart("/api/v1/courses/{courseId}/documents", COURSE_ID)
				.file(new MockMultipartFile("file", "foreign.pdf", "application/pdf", "content".getBytes()))
				.header("X-User-Id", OTHER_USER_ID))
				.andExpect(status().isNotFound());

		assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM documents", Integer.class)).isEqualTo(1);
		assertThat(STORAGE_ROOT.resolve(storagePath)).exists();
	}

	private static void clearStorage() throws IOException {
		if (!Files.exists(STORAGE_ROOT)) return;
		try (var paths = Files.walk(STORAGE_ROOT)) {
			for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) {
				Files.deleteIfExists(path);
			}
		}
	}
}
