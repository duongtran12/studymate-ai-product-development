package com.tritagon.studymate.web;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.user.AuthSession;
import com.tritagon.studymate.user.AuthSessionRepository;

@Component
public class CurrentUserIdResolver implements HandlerMethodArgumentResolver {

	private final AuthSessionRepository authSessionRepository;

	public CurrentUserIdResolver(AuthSessionRepository authSessionRepository) {
		this.authSessionRepository = authSessionRepository;
	}

	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return parameter.hasParameterAnnotation(CurrentUserId.class)
				&& parameter.getParameterType().equals(Long.class);
	}

	@Override
	public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer container, NativeWebRequest request,
			WebDataBinderFactory binderFactory) {
		String authorization = request.getHeader("Authorization");
		if (authorization != null && authorization.startsWith("Bearer ")) {
			return resolveBearerToken(authorization.substring("Bearer ".length()).trim());
		}
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

	private Long resolveBearerToken(String token) {
		if (token.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A valid session token is required.");
		AuthSession session = authSessionRepository.findByTokenHash(hash(token))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A valid session token is required."));
		if (!session.expiresAt().isAfter(OffsetDateTime.now())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your session has expired. Please log in again.");
		}
		return session.userId();
	}

	private String hash(String value) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
			return java.util.HexFormat.of().formatHex(digest);
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 must be available.", exception);
		}
	}
}
