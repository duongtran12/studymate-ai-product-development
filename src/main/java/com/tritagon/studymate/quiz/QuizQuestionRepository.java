package com.tritagon.studymate.quiz;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface QuizQuestionRepository extends CrudRepository<QuizQuestion, Long> {

	List<QuizQuestion> findAllByQuizIdOrderByPositionAsc(Long quizId);
}
