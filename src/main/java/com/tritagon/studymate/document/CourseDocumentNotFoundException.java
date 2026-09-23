package com.tritagon.studymate.document;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class CourseDocumentNotFoundException extends RuntimeException {

	public CourseDocumentNotFoundException(Long documentId) {
		super("Document " + documentId + " was not found for the selected course.");
	}
}
