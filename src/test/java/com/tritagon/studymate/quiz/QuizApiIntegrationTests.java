package com.tritagon.studymate.quiz;

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
class QuizApiIntegrationTests {

	private static final long OWNER_ID = 301L;
	private static final long OTHER_USER_ID = 302L;
	private static final long COURSE_ID = 401L;
	private static final long OTHER_COURSE_ID = 402L;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JdbcTemplate jdbc;

	@DynamicPropertySource
	static void dataSourceProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", () -> "jdbc:h2:mem:quiz-api;MODE=PostgreSQL;"
				+ "DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;"
				+ "DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
	}

	@BeforeEach
	void setUp() {
		jdbc.update("DELETE FROM quiz_attempt_answers");
		jdbc.update("DELETE FROM quiz_attempts");
		jdbc.update("DELETE FROM quiz_questions");
		jdbc.update("DELETE FROM quizzes");
		jdbc.update("DELETE FROM courses");
		jdbc.update("DELETE FROM users");
		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OWNER_ID, "quiz-owner@example.com", "hash", "Quiz Owner");
		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OTHER_USER_ID, "quiz-other@example.com", "hash", "Quiz Other");
		jdbc.update("INSERT INTO courses (id, owner_id, name, code) VALUES (?, ?, ?, ?)",
				COURSE_ID, OWNER_ID, "Software Testing", "ST302");
		jdbc.update("INSERT INTO courses (id, owner_id, name, code) VALUES (?, ?, ?, ?)",
				OTHER_COURSE_ID, OTHER_USER_ID, "Private Course", "PRI302");
	}

	@Test
	void ownerCanCreateReadAndSubmitQuiz() throws Exception {
		MvcResult createResult = createQuiz(COURSE_ID, OWNER_ID)
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", org.hamcrest.Matchers.matchesPattern("/api/v1/quizzes/\\d+")))
				.andExpect(jsonPath("$.title").value("Ôn tập kiểm thử"))
				.andExpect(jsonPath("$.questions.length()").value(2))
				.andExpect(jsonPath("$.questions[0].options[1]").value("Unit test"))
				.andReturn();
		long quizId = responseId(createResult);
		long firstQuestionId = responseQuestionId(createResult, 0);
		long secondQuestionId = responseQuestionId(createResult, 1);

		mockMvc.perform(get("/api/v1/quizzes/{quizId}", quizId).header("X-User-Id", OWNER_ID))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.questions[0].questionText").value("Kiểm thử đơn vị kiểm tra gì?"));

		mockMvc.perform(post("/api/v1/quizzes/{quizId}/attempts", quizId)
				.header("X-User-Id", OWNER_ID).contentType(MediaType.APPLICATION_JSON).content("""
					{"answers":[
					 {"questionId":%d,"answerText":"Unit test"},
					 {"questionId":%d,"answerText":"Sai"}
					]}
					""".formatted(firstQuestionId, secondQuestionId)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("SUBMITTED"))
				.andExpect(jsonPath("$.correctCount").value(1))
				.andExpect(jsonPath("$.questionCount").value(2))
				.andExpect(jsonPath("$.score").value(50.00));
	}

	@Test
	void rejectsForeignCourseAndInvalidQuizPayload() throws Exception {
		createQuiz(COURSE_ID, OTHER_USER_ID).andExpect(status().isNotFound());
		mockMvc.perform(post("/api/v1/courses/{courseId}/quizzes", COURSE_ID)
				.header("X-User-Id", OWNER_ID).contentType(MediaType.APPLICATION_JSON)
				.content("{\"title\":\"  \",\"questions\":[]}"))
				.andExpect(status().isBadRequest());
	}

	private org.springframework.test.web.servlet.ResultActions createQuiz(long courseId, long userId) throws Exception {
		return mockMvc.perform(post("/api/v1/courses/{courseId}/quizzes", courseId)
				.header("X-User-Id", userId).contentType(MediaType.APPLICATION_JSON).content("""
					{"title":"Ôn tập kiểm thử","questions":[
					 {"questionText":"Kiểm thử đơn vị kiểm tra gì?","options":["Giao diện","Unit test"],"answerText":"Unit test","explanation":"Kiểm thử đơn vị cô lập một phần nhỏ."},
					 {"questionText":"Tích hợp kiểm tra gì?","options":["Nhiều thành phần","Chỉ CSS"],"answerText":"Nhiều thành phần","explanation":"Kiểm tra sự phối hợp."}
					]}
					"""));
	}

	private long responseId(MvcResult result) throws Exception {
		return ((Number) com.jayway.jsonpath.JsonPath.read(
				result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.id")).longValue();
	}

	private long responseQuestionId(MvcResult result, int position) throws Exception {
		return ((Number) com.jayway.jsonpath.JsonPath.read(
				result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.questions[" + position + "].id")).longValue();
	}
}
