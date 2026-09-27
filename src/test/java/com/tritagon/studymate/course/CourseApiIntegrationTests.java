package com.tritagon.studymate.course;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class CourseApiIntegrationTests {

	private static final long OWNER_ID = 11;
	private static final long OTHER_USER_ID = 22;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JdbcTemplate jdbc;

	@DynamicPropertySource
	static void dataSourceProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", () -> "jdbc:h2:mem:course-api;MODE=PostgreSQL;"
				+ "DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;"
				+ "DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
	}

	@BeforeEach
	void setUp() {
		jdbc.update("DELETE FROM courses");
		jdbc.update("DELETE FROM users");
		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OWNER_ID, "owner@example.com", "hash", "Owner");
		jdbc.update("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
				OTHER_USER_ID, "other@example.com", "hash", "Other");
	}

	@Test
	void ownerCanCreateListUpdateAndDeleteCourse() throws Exception {
		MvcResult createResult = mockMvc.perform(post("/api/v1/courses")
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Software Architecture\",\"code\":\"SWA301\",\"description\":\"System design\"}"))
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", org.hamcrest.Matchers.matchesPattern("/api/v1/courses/\\d+")))
				.andExpect(jsonPath("$.name").value("Software Architecture"))
				.andExpect(jsonPath("$.code").value("SWA301"))
				.andReturn();
		long courseId = responseId(createResult);

		mockMvc.perform(get("/api/v1/courses").header("X-User-Id", OWNER_ID))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].id").value(courseId));

		mockMvc.perform(put("/api/v1/courses/{courseId}", courseId)
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Software Architecture Updated\",\"code\":\"SWA302\",\"description\":\"Updated\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Software Architecture Updated"));

		mockMvc.perform(delete("/api/v1/courses/{courseId}", courseId).header("X-User-Id", OWNER_ID))
				.andExpect(status().isNoContent());
		mockMvc.perform(get("/api/v1/courses/{courseId}", courseId).header("X-User-Id", OWNER_ID))
				.andExpect(status().isNotFound());
	}

	@Test
	void courseIsHiddenFromAnotherUserAndInputIsValidated() throws Exception {
		long courseId = responseId(mockMvc.perform(post("/api/v1/courses")
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Private course\"}"))
				.andExpect(status().isCreated())
				.andReturn());

		mockMvc.perform(get("/api/v1/courses/{courseId}", courseId).header("X-User-Id", OTHER_USER_ID))
				.andExpect(status().isNotFound());
		mockMvc.perform(post("/api/v1/courses")
				.header("X-User-Id", OWNER_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"   \"}"))
				.andExpect(status().isBadRequest());
	}

	private long responseId(MvcResult result) throws Exception {
		return ((Number) com.jayway.jsonpath.JsonPath.read(
				result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.id")).longValue();
	}
}
