package com.tritagon.studymate.quiz;

public record QuizAnswerFeedbackResponse(Long questionId, String selectedAnswer, String correctAnswer,
		boolean correct, String explanation) {
}
