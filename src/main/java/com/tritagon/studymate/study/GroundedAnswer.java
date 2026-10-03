package com.tritagon.studymate.study;

import java.util.List;
import java.util.Objects;

public record GroundedAnswer(String content, GroundingStatus status, List<CitationResponse> citations) {

	public GroundedAnswer {
		if (content == null || content.isBlank()) {
			throw new IllegalArgumentException("Grounded answer content must not be blank.");
		}
		Objects.requireNonNull(status, "Grounding status is required.");
		citations = citations == null ? List.of() : List.copyOf(citations);
		if (status == GroundingStatus.SUPPORTED && citations.isEmpty()) {
			throw new IllegalArgumentException("A supported grounded answer must include at least one citation.");
		}
		if (status == GroundingStatus.INSUFFICIENT_CONTEXT && !citations.isEmpty()) {
			throw new IllegalArgumentException("An insufficient-context answer must not include citations.");
		}
	}
}
