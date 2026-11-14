package com.tritagon.studymate.document;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;

@Service
public class DocumentIngestionService {

	private static final int CHUNK_SIZE = 1200;
	private final DocumentTextExtractor textExtractor;
	private final DocumentChunkRepository documentChunkRepository;

	public DocumentIngestionService(DocumentTextExtractor textExtractor, DocumentChunkRepository documentChunkRepository) {
		this.textExtractor = textExtractor;
		this.documentChunkRepository = documentChunkRepository;
	}

	public void ingest(CourseDocument document) {
		String text = textExtractor.extract(document);
		List<String> chunks = split(text);
		if (chunks.isEmpty()) throw new IllegalArgumentException("The document does not contain usable text.");
		documentChunkRepository.deleteByDocumentId(document.id());
		OffsetDateTime now = OffsetDateTime.now();
		documentChunkRepository.saveAll(IntStream.range(0, chunks.size())
				.mapToObj(index -> new DocumentChunk(null, document.id(), index, chunks.get(index), now)).toList());
	}

	private List<String> split(String text) {
		List<String> chunks = new ArrayList<>();
		int start = 0;
		while (start < text.length()) {
			int end = Math.min(start + CHUNK_SIZE, text.length());
			if (end < text.length()) {
				int boundary = text.lastIndexOf(' ', end);
				if (boundary > start + CHUNK_SIZE / 2) end = boundary;
			}
			String chunk = text.substring(start, end).trim();
			if (!chunk.isBlank()) chunks.add(chunk);
			start = Math.max(end, start + 1);
			while (start < text.length() && Character.isWhitespace(text.charAt(start))) start++;
		}
		return chunks;
	}
}
