package com.tritagon.studymate.document;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("document_chunks")
public record DocumentChunk(@Id Long id, Long documentId, Integer chunkIndex, String content, OffsetDateTime createdAt) {
}
