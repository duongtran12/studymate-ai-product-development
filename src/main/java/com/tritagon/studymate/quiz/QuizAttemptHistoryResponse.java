package com.tritagon.studymate.quiz;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record QuizAttemptHistoryResponse(Long id, String status, BigDecimal score, OffsetDateTime submittedAt) {

	static QuizAttemptHistoryResponse from(QuizAttempt attempt) {
		return new QuizAttemptHistoryResponse(attempt.id(), attempt.status(), attempt.score(), attempt.submittedAt());
	}
}
