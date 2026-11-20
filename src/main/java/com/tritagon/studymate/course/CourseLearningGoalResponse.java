package com.tritagon.studymate.course;

import java.time.OffsetDateTime;

public record CourseLearningGoalResponse(Long courseId, int targetAttemptCount, int targetAverageScore,
		boolean configured, OffsetDateTime updatedAt) {

	static CourseLearningGoalResponse from(CourseLearningGoal goal) {
		return new CourseLearningGoalResponse(goal.courseId(), goal.targetAttemptCount(), goal.targetAverageScore(), true,
				goal.updatedAt());
	}

	static CourseLearningGoalResponse empty(Long courseId) {
		return new CourseLearningGoalResponse(courseId, 0, 0, false, null);
	}
}
