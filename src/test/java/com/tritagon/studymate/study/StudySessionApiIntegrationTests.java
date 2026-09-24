package com.tritagon.studymate.study;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudySessionApiIntegrationTests {

	private static final long OWNER_ID = 101;
	private static final long OTHER_USER_ID = 202;
	private static final long COURSE_ID = 1001;
	private static final long OTHER_COURSE_ID = 1002;
	private static final long DOCUMENT_ID = 2001;
	private static final long OTHER_DOCUMENT_ID = 2002;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JdbcTemplate jdbc;

	@DynamicPropertySource
	static void dataSourceProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", () -> "jdbc:h2:mem:study-session-api;MODE=PostgreSQL;"
				+ "DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;"
				+ "DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
	}

	@BeforeEach
	void setUp() {
		jdbc.update("DELETE FROM study_session_documents");
		jdbc.update("DELETE FROM chat_messages");
		jdbc.update("DELETE FROM study_sessions");
		jdbc.update("DELETE FROM documents");
		jdbc.update("DELETE FROM courses");
		jdbc.update("DELETE FROM users");

		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OWNER_ID, "owner@example.com", "hash", "Owner");
		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OTHER_USER_ID, "other@example.com", "hash", "Other");
		jdbc.update("INSERT INTO courses (id, owner_id, name, code) VALUES (?, ?, ?, ?)",
				COURSE_ID, OWNER_ID, "Software Architecture", "SWA301");
		jdbc.update("INSERT INTO courses (id, owner_id, name, code) VALUES (?, ?, ?, ?)",
				OTHER_COURSE_ID, OTHER_USER_ID, "Private Course", "PRI101");
		jdbc.update("""
				INSERT INTO documents
				(id, course_id, file_name, storage_path, content_type, file_size_bytes, processing_status)
				VALUES (?, ?, ?, ?, ?, ?, ?)
				""", DOCUMENT_ID, COURSE_ID, "chapter-05.pdf", "owner/chapter-05.pdf",
				"application/pdf", 1024, "UPLOADED");
		jdbc.update("""
				INSERT INTO documents
				(id, course_id, file_name, storage_path, content_type, file_size_bytes, processing_status)
				VALUES (?, ?, ?, ?, ?, ?, ?)
				""", OTHER_DOCUMENT_ID, OTHER_COURSE_ID, "private.pdf", "other/private.pdf",
				"application/pdf", 512, "UPLOADED");
	}

	@Test
	void ownerCanCreateAskAndReadGroundedSession() throws Exception {
		MvcResult createResult = createSession("""
				{"courseId":1001,"title":"Chapter 5 review","documentIds":[2001,2001]}
				""")
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", org.hamcrest.Matchers.matchesPattern(
						"/api/v1/study-sessions/\\d+")))
				.andExpect(jsonPath("$.courseId").value(COURSE_ID))
				.andExpect(jsonPath("$.documentIds.length()").value(1))
				.andExpect(jsonPath("$.documentIds[0]").value(DOCUMENT_ID))
				.andReturn();
		long sessionId = responseId(createResult);

		mockMvc.perform(post("/api/v1/study-sessions/{sessionId}/messages", sessionId)
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"question\":\"Dependency injection là gì?\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.userMessage.role").value("USER"))
				.andExpect(jsonPath("$.userMessage.content").value("Dependency injection là gì?"))
				.andExpect(jsonPath("$.assistantMessage.role").value("ASSISTANT"))
				.andExpect(jsonPath("$.assistantMessage.groundingStatus").value("SUPPORTED"))
				.andExpect(jsonPath("$.assistantMessage.citations.length()").value(1))
				.andExpect(jsonPath("$.assistantMessage.citations[0].documentId").value(DOCUMENT_ID))
				.andExpect(jsonPath("$.assistantMessage.citations[0].documentName").value("chapter-05.pdf"));

		mockMvc.perform(get("/api/v1/study-sessions/{sessionId}/messages", sessionId)
				.header("X-User-Id", OWNER_ID))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].role").value("USER"))
				.andExpect(jsonPath("$[1].role").value("ASSISTANT"));

		mockMvc.perform(get("/api/v1/study-sessions").param("courseId", String.valueOf(COURSE_ID))
				.header("X-User-Id", OWNER_ID))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].id").value(sessionId));

		assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM study_session_documents", Integer.class)).isEqualTo(1);
		assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM chat_messages", Integer.class)).isEqualTo(2);
	}

	@Test
	void sessionWithoutDocumentsClearlyReportsInsufficientContext() throws Exception {
		long sessionId = responseId(createSession("""
				{"courseId":1001,"title":"No sources yet","documentIds":[]}
				""").andExpect(status().isCreated()).andReturn());

		mockMvc.perform(post("/api/v1/study-sessions/{sessionId}/messages", sessionId)
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"question\":\"Hãy giải thích nội dung này.\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.assistantMessage.groundingStatus").value("INSUFFICIENT_CONTEXT"))
				.andExpect(jsonPath("$.assistantMessage.content").value(
						"Chưa đủ căn cứ từ tài liệu đã chọn để trả lời câu hỏi này."))
				.andExpect(jsonPath("$.assistantMessage.citations.length()").value(0));
	}

	@Test
	void rejectsForeignDocumentsAndCrossUserSessionAccess() throws Exception {
		createSession("""
				{"courseId":1001,"title":"Invalid scope","documentIds":[2002]}
				""").andExpect(status().isNotFound());

		long sessionId = responseId(createSession("""
				{"courseId":1001,"title":"Owner only","documentIds":[2001]}
				""").andExpect(status().isCreated()).andReturn());

		mockMvc.perform(get("/api/v1/study-sessions/{sessionId}", sessionId)
				.header("X-User-Id", OTHER_USER_ID))
				.andExpect(status().isNotFound());
		mockMvc.perform(get("/api/v1/study-sessions/{sessionId}/messages", sessionId)
				.header("X-User-Id", OTHER_USER_ID))
				.andExpect(status().isNotFound());
		mockMvc.perform(post("/api/v1/study-sessions/{sessionId}/messages", sessionId)
				.header("X-User-Id", OTHER_USER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"question\":\"Can I read this?\"}"))
				.andExpect(status().isNotFound());

		assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM chat_messages", Integer.class)).isZero();
	}

	@Test
	void validatesRequiredSessionAndQuestionFields() throws Exception {
		createSession("{\"courseId\":1001,\"title\":\"  \",\"documentIds\":[]}")
				.andExpect(status().isBadRequest());

		long sessionId = responseId(createSession("""
				{"courseId":1001,"title":"Validation","documentIds":[]}
				""").andExpect(status().isCreated()).andReturn());
		mockMvc.perform(post("/api/v1/study-sessions/{sessionId}/messages", sessionId)
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"question\":\"   \"}"))
				.andExpect(status().isBadRequest());

		assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM chat_messages", Integer.class)).isZero();
	}

	private org.springframework.test.web.servlet.ResultActions createSession(String body) throws Exception {
		return mockMvc.perform(post("/api/v1/study-sessions")
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content(body));
	}

	private long responseId(MvcResult result) throws Exception {
		return ((Number) com.jayway.jsonpath.JsonPath.read(
				result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.id")).longValue();
	}
}
