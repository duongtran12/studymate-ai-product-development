package com.tritagon.studymate.document;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface DocumentChunkRepository extends CrudRepository<DocumentChunk, Long> {

	List<DocumentChunk> findAllByDocumentIdOrderByChunkIndexAsc(Long documentId);

	List<DocumentChunk> findTop3ByDocumentIdOrderByChunkIndexAsc(Long documentId);

	long countByDocumentId(Long documentId);

	void deleteByDocumentId(Long documentId);
}
