package com.tritagon.studymate.course;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("courses")
public record Course(
		@Id Long id,
		Long ownerId,
		String name,
		String code,
		String description,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt) {
}
