package com.tritagon.studymate.study;

import java.time.OffsetDateTime;
import java.util.List;

public record StudySessionResponse(
		Long id,
		Long courseId,
		String title,
		String status,
		List<Long> documentIds,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt) {

	static StudySessionResponse from(StudySession session, List<Long> documentIds) {
		return new StudySessionResponse(session.id(), session.courseId(), session.title(), session.status(),
				List.copyOf(documentIds), session.createdAt(), session.updatedAt());
	}
}
