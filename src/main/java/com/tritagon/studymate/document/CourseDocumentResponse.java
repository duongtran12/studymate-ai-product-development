package com.tritagon.studymate.document;

import java.time.OffsetDateTime;

public record CourseDocumentResponse(
		Long id,
		Long courseId,
		String fileName,
		String contentType,
		Long fileSizeBytes,
		String processingStatus,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt) {

	static CourseDocumentResponse from(CourseDocument document) {
		return new CourseDocumentResponse(
				document.id(),
				document.courseId(),
				document.fileName(),
				document.contentType(),
				document.fileSizeBytes(),
				document.processingStatus(),
				document.createdAt(),
				document.updatedAt());
	}
}
