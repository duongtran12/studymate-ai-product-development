package com.tritagon.studymate.quiz;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface QuizRepository extends CrudRepository<Quiz, Long> {

	List<Quiz> findAllByCourseIdOrderByUpdatedAtDesc(Long courseId);

	Optional<Quiz> findByIdAndCourseId(Long id, Long courseId);
}
