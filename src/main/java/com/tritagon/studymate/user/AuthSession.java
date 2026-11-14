package com.tritagon.studymate.user;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("auth_sessions")
public record AuthSession(@Id Long id, Long userId, String tokenHash, OffsetDateTime expiresAt, OffsetDateTime createdAt) {
}
