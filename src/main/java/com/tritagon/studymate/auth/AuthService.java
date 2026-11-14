package com.tritagon.studymate.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.user.AuthSession;
import com.tritagon.studymate.user.AuthSessionRepository;
import com.tritagon.studymate.user.UserAccount;
import com.tritagon.studymate.user.UserAccountRepository;

@Service
public class AuthService {

	private static final SecureRandom RANDOM = new SecureRandom();
	private final UserAccountRepository userAccountRepository;
	private final AuthSessionRepository authSessionRepository;
	private final PasswordEncoder passwordEncoder;

	public AuthService(UserAccountRepository userAccountRepository, AuthSessionRepository authSessionRepository,
			PasswordEncoder passwordEncoder) {
		this.userAccountRepository = userAccountRepository;
		this.authSessionRepository = authSessionRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public AuthResponse register(AuthRegisterRequest request) {
		String email = email(request == null ? null : request.email());
		String password = password(request == null ? null : request.password());
		String displayName = displayName(request == null ? null : request.displayName(), email);
		if (userAccountRepository.findByEmail(email).isPresent()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered.");
		}
		OffsetDateTime now = OffsetDateTime.now();
		UserAccount user = userAccountRepository.save(new UserAccount(null, email, passwordEncoder.encode(password), displayName, now, now));
		return createSession(user, now);
	}

	public AuthResponse login(AuthLoginRequest request) {
		String email = email(request == null ? null : request.email());
		if (request == null || request.password() == null || request.password().isBlank()) throw invalidCredentials();
		UserAccount user = userAccountRepository.findByEmail(email).orElseThrow(this::invalidCredentials);
		if (!passwordEncoder.matches(request.password(), user.passwordHash())) throw invalidCredentials();
		return createSession(user, OffsetDateTime.now());
	}

	public void logout(String authorization) {
		if (authorization == null || !authorization.startsWith("Bearer ")) return;
		String token = authorization.substring("Bearer ".length()).trim();
		if (!token.isBlank()) authSessionRepository.deleteByTokenHash(hash(token));
	}

	private AuthResponse createSession(UserAccount user, OffsetDateTime now) {
		String token = token();
		authSessionRepository.save(new AuthSession(null, user.id(), hash(token), now.plusDays(7), now));
		return new AuthResponse(token, user.id(), user.displayName());
	}

	private String email(String value) {
		if (value == null || value.isBlank() || !value.trim().contains("@")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid email is required.");
		}
		return value.trim().toLowerCase(Locale.ROOT);
	}

	private String password(String value) {
		if (value == null || value.length() < 8) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must contain at least 8 characters.");
		}
		return value;
	}

	private String displayName(String value, String email) {
		String normalized = value == null || value.isBlank() ? email.substring(0, email.indexOf('@')) : value.trim();
		if (normalized.length() > 120) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Display name must not exceed 120 characters.");
		return normalized;
	}

	private String token() {
		byte[] bytes = new byte[32];
		RANDOM.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private String hash(String value) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
			return java.util.HexFormat.of().formatHex(digest);
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 must be available.", exception);
		}
	}

	private ResponseStatusException invalidCredentials() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
	}
}
