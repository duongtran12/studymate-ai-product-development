package com.tritagon.studymate.quiz;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("quiz_attempts")
public record QuizAttempt(
		@Id Long id,
		Long quizId,
		Long userId,
		String status,
		BigDecimal score,
		OffsetDateTime submittedAt,
		OffsetDateTime createdAt) {
}
