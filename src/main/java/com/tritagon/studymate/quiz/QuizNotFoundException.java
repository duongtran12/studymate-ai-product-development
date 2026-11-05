package com.tritagon.studymate.quiz;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class QuizNotFoundException extends RuntimeException {
	public QuizNotFoundException(Long quizId) { super("Quiz " + quizId + " was not found for the current user."); }
}
