package com.tritagon.studymate.user;

import java.time.OffsetDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

	private final UserAccountRepository userAccountRepository;
	private final AuthSessionRepository authSessionRepository;
	private final PasswordEncoder passwordEncoder;

	public ProfileService(UserAccountRepository userAccountRepository, AuthSessionRepository authSessionRepository,
			PasswordEncoder passwordEncoder) {
		this.userAccountRepository = userAccountRepository;
		this.authSessionRepository = authSessionRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public ProfileResponse get(Long userId) {
		return ProfileResponse.from(requireUser(userId));
	}

	public ProfileResponse update(Long userId, ProfileUpdateRequest request) {
		String displayName = normalizeDisplayName(request == null ? null : request.displayName());
		UserAccount current = requireUser(userId);
		UserAccount saved = userAccountRepository.save(new UserAccount(current.id(), current.email(), current.passwordHash(), displayName,
				current.createdAt(), OffsetDateTime.now()));
		return ProfileResponse.from(saved);
	}

	public void changePassword(Long userId, ProfilePasswordChangeRequest request) {
		if (request == null || request.currentPassword() == null || request.currentPassword().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required.");
		}
		String newPassword = validNewPassword(request.newPassword());
		UserAccount current = requireUser(userId);
		if (!passwordEncoder.matches(request.currentPassword(), current.passwordHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
		}
		userAccountRepository.save(new UserAccount(current.id(), current.email(), passwordEncoder.encode(newPassword), current.displayName(),
				current.createdAt(), OffsetDateTime.now()));
		authSessionRepository.deleteByUserId(userId);
	}

	private UserAccount requireUser(Long userId) {
		return userAccountRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User account was not found."));
	}

	private String normalizeDisplayName(String value) {
		if (value == null || value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Display name is required.");
		String normalized = value.trim();
		if (normalized.length() > 120) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Display name must not exceed 120 characters.");
		return normalized;
	}

	private String validNewPassword(String value) {
		if (value == null || value.length() < 8) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must contain at least 8 characters.");
		}
		return value;
	}
}
