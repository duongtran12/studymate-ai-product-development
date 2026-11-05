package com.tritagon.studymate.quiz;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("quizzes")
public record Quiz(
		@Id Long id,
		Long courseId,
		String title,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt) {
}
