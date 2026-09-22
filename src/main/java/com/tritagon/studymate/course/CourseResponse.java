package com.tritagon.studymate.course;

import java.time.OffsetDateTime;

public record CourseResponse(
		Long id,
		String name,
		String code,
		String description,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt) {

	static CourseResponse from(Course course) {
		return new CourseResponse(
				course.id(),
				course.name(),
				course.code(),
				course.description(),
				course.createdAt(),
				course.updatedAt());
	}
}
