package com.tritagon.studymate.study;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tritagon.studymate.document.CourseDocument;
import com.tritagon.studymate.document.CourseDocumentNotFoundException;
import com.tritagon.studymate.document.CourseDocumentRepository;
import com.tritagon.studymate.document.DocumentChunk;
import com.tritagon.studymate.document.DocumentChunkRepository;

@Service
public class MockGroundedAnswerGenerator implements GroundedAnswerGenerator {

	private static final String INSUFFICIENT_CONTEXT_MESSAGE =
			"Chưa đủ căn cứ từ tài liệu đã chọn để trả lời câu hỏi này.";

	private final CourseDocumentRepository documentRepository;
	private final DocumentChunkRepository documentChunkRepository;

	public MockGroundedAnswerGenerator(CourseDocumentRepository documentRepository,
			DocumentChunkRepository documentChunkRepository) {
		this.documentRepository = documentRepository;
		this.documentChunkRepository = documentChunkRepository;
	}

	@Override
	public GroundedAnswer generate(GroundedAnswerRequest request) {
		if (request.documentIds().isEmpty()) {
			return new GroundedAnswer(INSUFFICIENT_CONTEXT_MESSAGE, GroundingStatus.INSUFFICIENT_CONTEXT, List.of());
		}

		Set<String> questionTerms = terms(request.question());
		List<RankedChunk> matches = request.documentIds().stream()
				.map(documentId -> findDocument(documentId, request.courseId()))
				.flatMap(document -> documentChunkRepository.findAllByDocumentIdOrderByChunkIndexAsc(document.id()).stream()
						.map(chunk -> new RankedChunk(document, chunk, overlap(questionTerms, chunk.content()))))
				.filter(match -> match.score() > 0)
				.sorted(Comparator.comparingInt(RankedChunk::score).reversed()
						.thenComparing(match -> match.document().id())
						.thenComparing(match -> match.chunk().chunkIndex()))
				.limit(2)
				.toList();
		if (matches.isEmpty()) {
			return new GroundedAnswer(INSUFFICIENT_CONTEXT_MESSAGE, GroundingStatus.INSUFFICIENT_CONTEXT, List.of());
		}
		List<CitationResponse> citations = matches.stream().map(this::citation).toList();
		String answer = matches.stream()
				.map(match -> excerpt(match.chunk().content(), 420))
				.collect(Collectors.joining("\n\n"));
		return new GroundedAnswer(answer, GroundingStatus.SUPPORTED, citations);
	}

	private CourseDocument findDocument(Long documentId, Long courseId) {
		return documentRepository.findByIdAndCourseId(documentId, courseId)
				.orElseThrow(() -> new CourseDocumentNotFoundException(documentId));
	}

	private CitationResponse citation(RankedChunk match) {
		return new CitationResponse(match.document().id(), match.document().fileName(),
				"Đoạn " + (match.chunk().chunkIndex() + 1), excerpt(match.chunk().content(), 240));
	}

	private int overlap(Set<String> questionTerms, String content) {
		return (int) terms(content).stream().filter(questionTerms::contains).count();
	}

	private Set<String> terms(String value) {
		return Pattern.compile("[^\\p{L}\\p{N}]+")
				.splitAsStream(value.toLowerCase(Locale.ROOT))
				.filter(term -> term.length() >= 3)
				.collect(Collectors.toSet());
	}

	private String excerpt(String content, int maxLength) {
		String normalized = content.replaceAll("\\s+", " ").trim();
		return normalized.length() <= maxLength ? normalized : normalized.substring(0, maxLength).trim() + "…";
	}

	private record RankedChunk(CourseDocument document, DocumentChunk chunk, int score) {
	}
}
