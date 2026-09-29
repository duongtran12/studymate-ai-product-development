package com.tritagon.studymate.web;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentUserIdResolver implements HandlerMethodArgumentResolver {

	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return parameter.hasParameterAnnotation(CurrentUserId.class)
				&& parameter.getParameterType().equals(Long.class);
	}

	@Override
	public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer container, NativeWebRequest request,
			WebDataBinderFactory binderFactory) {
		String header = request.getHeader("X-User-Id");
		if (header == null || header.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-User-Id header is required.");
		}
		try {
			long userId = Long.parseLong(header);
			if (userId <= 0) {
				throw new NumberFormatException();
			}
			return userId;
		} catch (NumberFormatException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-User-Id must be a positive integer.");
		}
	}
}
