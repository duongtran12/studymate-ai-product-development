package com.tritagon.studymate.quiz;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("quiz_questions")
public record QuizQuestion(
		@Id Long id,
		Long quizId,
		String questionText,
		String questionType,
		String optionsJson,
		String answerText,
		String explanation,
		Integer position) {
}
