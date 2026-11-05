package com.tritagon.studymate.quiz;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface QuizAttemptRepository extends CrudRepository<QuizAttempt, Long> {

	List<QuizAttempt> findAllByQuizIdAndUserIdOrderByCreatedAtDesc(Long quizId, Long userId);
}
