package com.tritagon.studymate.study;

import java.time.OffsetDateTime;
import java.util.List;

public record ChatMessageResponse(
		Long id,
		Long sessionId,
		String role,
		String content,
		String groundingStatus,
		List<CitationResponse> citations,
		OffsetDateTime createdAt) {
}
