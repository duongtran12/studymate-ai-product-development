package com.tritagon.studymate.journey;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.AfterAll;
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
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CoreLearningJourneyIntegrationTests {

	private static final Path STORAGE_ROOT = Path.of("target", "core-journey-test-storage").toAbsolutePath().normalize();

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JdbcTemplate jdbc;

	@DynamicPropertySource
	static void properties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", () -> "jdbc:h2:mem:core-journey;MODE=PostgreSQL;"
				+ "DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
		registry.add("studymate.storage.local-root", STORAGE_ROOT::toString);
	}

	@BeforeEach
	void setUp() throws IOException {
		for (String table : new String[] { "quiz_attempt_answers", "quiz_attempts", "quiz_document_sources", "quiz_questions",
				"quizzes", "chat_messages", "study_session_documents", "study_sessions", "document_chunks", "documents",
				"course_learning_goals", "courses", "auth_sessions", "users" }) {
			jdbc.update("DELETE FROM " + table);
		}
		clearStorage();
	}

	@AfterAll
	static void cleanUp() throws IOException {
		clearStorage();
	}

	@Test
	void learnerCanRegisterUploadStudyAndCompleteQuiz() throws Exception {
		String token = text(register("journey@example.com", "Journey Learner"), "$.token");
		String authorization = "Bearer " + token;
		long courseId = id(mockMvc.perform(post("/api/v1/courses").header("Authorization", authorization)
				.contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Software Testing\",\"code\":\"SWT301\"}"))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.name").value("Software Testing")).andReturn());

		MockMultipartFile file = new MockMultipartFile("file", "unit-testing.docx",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				docx("Unit testing checks one isolated part of an application."));
		long documentId = id(mockMvc.perform(multipart("/api/v1/courses/{courseId}/documents", courseId).file(file)
				.header("Authorization", authorization)).andExpect(status().isCreated())
				.andExpect(jsonPath("$.processingStatus").value("READY")).andReturn());

		long sessionId = id(mockMvc.perform(post("/api/v1/study-sessions").header("Authorization", authorization)
				.contentType(MediaType.APPLICATION_JSON).content("{\"courseId\":%d,\"title\":\"Ôn unit test\",\"documentIds\":[%d]}".formatted(courseId, documentId)))
				.andExpect(status().isCreated()).andReturn());
		mockMvc.perform(post("/api/v1/study-sessions/{sessionId}/messages", sessionId).header("Authorization", authorization)
				.contentType(MediaType.APPLICATION_JSON).content("{\"question\":\"Unit testing kiểm tra điều gì?\"}"))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.assistantMessage.groundingStatus").value("SUPPORTED"));

		MvcResult quiz = mockMvc.perform(post("/api/v1/courses/{courseId}/quizzes", courseId).header("Authorization", authorization)
				.contentType(MediaType.APPLICATION_JSON).content("""
					{"title":"Ôn unit testing","documentIds":[%d],"questions":[
					 {"questionText":"Unit testing kiểm tra gì?","options":["Một phần cô lập","Toàn bộ hệ thống"],"answerText":"Một phần cô lập","explanation":"Unit test tập trung vào đơn vị nhỏ."}
					]}""".formatted(documentId)))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.documentIds[0]").value(documentId)).andReturn();
		long quizId = id(quiz);
		long questionId = number(quiz, "$.questions[0].id");

		mockMvc.perform(post("/api/v1/quizzes/{quizId}/attempts", quizId).header("Authorization", authorization)
				.contentType(MediaType.APPLICATION_JSON).content("{\"answers\":[{\"questionId\":%d,\"answerText\":\"Một phần cô lập\"}]}".formatted(questionId)))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.score").value(100.00))
				.andExpect(jsonPath("$.feedback[0].correct").value(true));

		mockMvc.perform(get("/api/v1/quizzes/{quizId}/attempts", quizId).header("Authorization", authorization))
				.andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
	}

	private MvcResult register(String email, String displayName) throws Exception {
		return mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"%s\",\"password\":\"safe-password\",\"displayName\":\"%s\"}".formatted(email, displayName)))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.token").isNotEmpty()).andReturn();
	}

	private long id(MvcResult result) throws Exception { return number(result, "$.id"); }
	private long number(MvcResult result, String path) throws Exception { return ((Number) com.jayway.jsonpath.JsonPath.read(result.getResponse().getContentAsString(), path)).longValue(); }
	private String text(MvcResult result, String path) throws Exception { return com.jayway.jsonpath.JsonPath.read(result.getResponse().getContentAsString(), path); }

	private static byte[] docx(String content) throws IOException {
		try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
			document.createParagraph().createRun().setText(content);
			document.write(output);
			return output.toByteArray();
		}
	}

	private static void clearStorage() throws IOException {
		if (!Files.exists(STORAGE_ROOT)) return;
		try (var paths = Files.walk(STORAGE_ROOT)) {
			paths.sorted(Comparator.reverseOrder()).forEach(path -> {
				try { Files.deleteIfExists(path); } catch (IOException exception) { throw new IllegalStateException(exception); }
			});
		}
	}
}
