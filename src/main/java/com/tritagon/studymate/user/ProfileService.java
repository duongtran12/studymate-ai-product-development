package com.tritagon.studymate.user;

import java.time.OffsetDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

	private final UserAccountRepository userAccountRepository;

	public ProfileService(UserAccountRepository userAccountRepository) {
		this.userAccountRepository = userAccountRepository;
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
}
