package com.tritagon.studymate.study;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("study_session_documents")
public record StudySessionDocument(@Id Long id, Long sessionId, Long documentId) {
}
