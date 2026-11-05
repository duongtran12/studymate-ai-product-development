package com.tritagon.studymate.quiz;

import java.time.OffsetDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("quiz_document_sources")
public record QuizDocumentSource(@Id Long id, Long quizId, Long documentId, OffsetDateTime createdAt) {
}
