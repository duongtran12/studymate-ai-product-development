package com.tritagon.studymate.study;

import java.util.List;
import java.util.Objects;

public record GroundedAnswerRequest(String question, Long courseId, List<Long> documentIds) {

	public GroundedAnswerRequest {
		if (question == null || question.isBlank()) {
			throw new IllegalArgumentException("Grounded answer question must not be blank.");
		}
		Objects.requireNonNull(courseId, "Course ID is required for a grounded answer.");
		documentIds = documentIds == null ? List.of() : List.copyOf(documentIds);
	}
}
