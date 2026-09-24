package com.tritagon.studymate.study;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class StudySessionNotFoundException extends RuntimeException {

	public StudySessionNotFoundException(Long sessionId) {
		super("Study session " + sessionId + " was not found for the current user.");
	}
}
