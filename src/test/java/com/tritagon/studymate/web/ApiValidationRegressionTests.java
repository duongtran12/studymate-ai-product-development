package com.tritagon.studymate.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiValidationRegressionTests {

	private static final long OWNER_ID = 31;
	private static final long OTHER_USER_ID = 32;
	private static final long COURSE_ID = 3101;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JdbcTemplate jdbc;

	@DynamicPropertySource
	static void dataSourceProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", () -> "jdbc:h2:mem:api-validation;MODE=PostgreSQL;"
				+ "DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;"
				+ "DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
	}

	@BeforeEach
	void setUp() {
		jdbc.update("DELETE FROM documents");
		jdbc.update("DELETE FROM courses");
		jdbc.update("DELETE FROM users");
		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OWNER_ID, "owner@example.com", "hash", "Owner");
		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OTHER_USER_ID, "other@example.com", "hash", "Other");
		jdbc.update("INSERT INTO courses (id, owner_id, name) VALUES (?, ?, ?)", COURSE_ID, OWNER_ID, "Private course");
	}

	@Test
	void missingOrInvalidCurrentUserHeaderReturnsConsistentProblemDetails() throws Exception {
		mockMvc.perform(get("/api/v1/courses"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.code").value("REQUEST_REJECTED"))
				.andExpect(jsonPath("$.path").value("/api/v1/courses"));

		mockMvc.perform(get("/api/v1/courses").header("X-User-Id", "not-a-number"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("REQUEST_REJECTED"));
	}

	@Test
	void malformedJsonAndForeignResourcesReturnSafeProblemDetails() throws Exception {
		mockMvc.perform(post("/api/v1/courses")
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
				.andExpect(jsonPath("$.detail").value("The request data is missing or invalid."));

		mockMvc.perform(get("/api/v1/courses/{courseId}", COURSE_ID).header("X-User-Id", OTHER_USER_ID))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
				.andExpect(jsonPath("$.path").value("/api/v1/courses/3101"));
	}

	@Test
	void unsupportedUploadReturnsAValidationProblemInsteadOfStoringTheFile() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "notes.txt", "text/plain", "notes".getBytes());
		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart(
					"/api/v1/courses/{courseId}/documents", COURSE_ID)
				.header("X-User-Id", OWNER_ID)
				.file(file))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("REQUEST_REJECTED"));

		Integer documents = jdbc.queryForObject("SELECT COUNT(*) FROM documents", Integer.class);
		org.assertj.core.api.Assertions.assertThat(documents).isZero();
	}
}
