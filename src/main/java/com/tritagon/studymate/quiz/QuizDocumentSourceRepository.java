package com.tritagon.studymate.quiz;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface QuizDocumentSourceRepository extends CrudRepository<QuizDocumentSource, Long> {

	List<QuizDocumentSource> findAllByQuizIdOrderByCreatedAtAsc(Long quizId);
}
