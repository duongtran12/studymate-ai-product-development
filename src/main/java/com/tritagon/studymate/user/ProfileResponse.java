package com.tritagon.studymate.user;

import java.time.OffsetDateTime;

public record ProfileResponse(Long id, String email, String displayName, OffsetDateTime createdAt, OffsetDateTime updatedAt) {

	static ProfileResponse from(UserAccount user) {
		return new ProfileResponse(user.id(), user.email(), user.displayName(), user.createdAt(), user.updatedAt());
	}
}
