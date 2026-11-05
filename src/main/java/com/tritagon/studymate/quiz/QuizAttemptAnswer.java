package com.tritagon.studymate.quiz;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("quiz_attempt_answers")
public record QuizAttemptAnswer(
		@Id Long id,
		Long attemptId,
		Long questionId,
		String answerText,
		Boolean correct,
		OffsetDateTime createdAt) {
}
