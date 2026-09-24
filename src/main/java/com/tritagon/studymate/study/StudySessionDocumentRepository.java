package com.tritagon.studymate.study;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface StudySessionDocumentRepository extends CrudRepository<StudySessionDocument, Long> {

	List<StudySessionDocument> findAllBySessionIdOrderByIdAsc(Long sessionId);
}
