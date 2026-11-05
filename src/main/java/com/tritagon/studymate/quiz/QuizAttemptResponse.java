package com.tritagon.studymate.quiz;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record QuizAttemptResponse(Long id, Long quizId, String status, BigDecimal score, int correctCount,
		int questionCount, OffsetDateTime submittedAt) {
}
