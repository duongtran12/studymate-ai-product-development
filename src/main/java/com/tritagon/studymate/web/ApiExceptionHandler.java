package com.tritagon.studymate.web;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.course.CourseNotFoundException;
import com.tritagon.studymate.document.CourseDocumentNotFoundException;
import com.tritagon.studymate.study.StudySessionNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ResponseStatusException.class)
	ProblemDetail handleResponseStatus(ResponseStatusException exception, HttpServletRequest request) {
		String detail = exception.getReason() == null ? "The request could not be completed." : exception.getReason();
		return problem(exception.getStatusCode(), "REQUEST_REJECTED", detail, request);
	}

	@ExceptionHandler({ CourseNotFoundException.class, CourseDocumentNotFoundException.class,
			StudySessionNotFoundException.class })
	ProblemDetail handleNotFound(RuntimeException exception, HttpServletRequest request) {
		return problem(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", exception.getMessage(), request);
	}

	@ExceptionHandler({ MissingRequestHeaderException.class, MissingServletRequestPartException.class,
			MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class,
			IllegalArgumentException.class })
	ProblemDetail handleMalformedRequest(Exception exception, HttpServletRequest request) {
		return problem(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "The request data is missing or invalid.", request);
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	ProblemDetail handleUploadTooLarge(MaxUploadSizeExceededException exception, HttpServletRequest request) {
		return problem(HttpStatus.BAD_REQUEST, "UPLOAD_TOO_LARGE", "The uploaded file exceeds the allowed size.", request);
	}

	@ExceptionHandler(Exception.class)
	ProblemDetail handleUnexpected(Exception exception, HttpServletRequest request) {
		return problem(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
				"An unexpected server error occurred.", request);
	}

	private ProblemDetail problem(HttpStatusCode status, String code, String detail, HttpServletRequest request) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
		problem.setTitle(status.toString());
		problem.setProperty("code", code);
		problem.setProperty("path", request.getRequestURI());
		return problem;
	}
}
