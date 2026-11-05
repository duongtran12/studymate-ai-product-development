package com.tritagon.studymate.quiz;

import java.time.OffsetDateTime;
import java.util.List;

public record QuizResponse(Long id, Long courseId, String title, List<QuizQuestionResponse> questions, List<Long> documentIds,
		OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
