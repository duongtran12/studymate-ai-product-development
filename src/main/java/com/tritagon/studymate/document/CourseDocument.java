package com.tritagon.studymate.document;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("documents")
public record CourseDocument(
		@Id Long id,
		Long courseId,
		String fileName,
		String storagePath,
		String contentType,
		Long fileSizeBytes,
		String processingStatus,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt) {
}
