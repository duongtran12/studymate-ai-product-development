package com.tritagon.studymate.course;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface CourseLearningGoalRepository extends CrudRepository<CourseLearningGoal, Long> {

	Optional<CourseLearningGoal> findByCourseId(Long courseId);
}
