package com.tritagon.studymate.quiz;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record QuizAttemptResponse(Long id, Long quizId, String status, BigDecimal score, int correctCount,
		int questionCount, OffsetDateTime submittedAt, List<QuizAnswerFeedbackResponse> feedback) {
}
