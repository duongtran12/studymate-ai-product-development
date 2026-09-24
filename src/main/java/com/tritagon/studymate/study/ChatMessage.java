package com.tritagon.studymate.study;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("chat_messages")
public record ChatMessage(
		@Id Long id,
		Long sessionId,
		String role,
		String content,
		String citationsJson,
		String groundingStatus,
		OffsetDateTime createdAt) {
}
