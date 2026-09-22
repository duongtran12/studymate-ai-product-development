package com.tritagon.studymate.user;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("users")
public record UserAccount(
		@Id Long id,
		String email,
		String passwordHash,
		String displayName,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt) {
}
