package com.tritagon.studymate.course;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("course_learning_goals")
public record CourseLearningGoal(@Id Long id, Long courseId, int targetAttemptCount, int targetAverageScore,
		OffsetDateTime updatedAt) {
}
