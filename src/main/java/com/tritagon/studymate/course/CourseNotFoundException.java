package com.tritagon.studymate.course;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class CourseNotFoundException extends RuntimeException {

	public CourseNotFoundException(Long courseId) {
		super("Course " + courseId + " was not found for the current user.");
	}
}
