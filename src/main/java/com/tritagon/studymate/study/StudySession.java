package com.tritagon.studymate.study;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("study_sessions")
public record StudySession(
		@Id Long id,
		Long userId,
		Long courseId,
		String title,
		String status,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt) {
}
