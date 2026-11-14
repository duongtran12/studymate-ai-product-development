package com.tritagon.studymate.quiz;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.course.CourseAccessService;
import com.tritagon.studymate.document.CourseDocument;
import com.tritagon.studymate.document.CourseDocumentNotFoundException;
import com.tritagon.studymate.document.CourseDocumentRepository;
import com.tritagon.studymate.document.DocumentChunkRepository;
import com.tritagon.studymate.study.OpenAiCompatibleGroundedAnswerRewriter;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class AiQuizGenerationService {
	private final CourseAccessService courseAccessService;
	private final CourseDocumentRepository documentRepository;
	private final DocumentChunkRepository documentChunkRepository;
	private final Optional<OpenAiCompatibleGroundedAnswerRewriter> aiProvider;
	private final ObjectMapper objectMapper;

	public AiQuizGenerationService(CourseAccessService courseAccessService, CourseDocumentRepository documentRepository,
			DocumentChunkRepository documentChunkRepository, Optional<OpenAiCompatibleGroundedAnswerRewriter> aiProvider, ObjectMapper objectMapper) {
		this.courseAccessService = courseAccessService; this.documentRepository = documentRepository;
		this.documentChunkRepository = documentChunkRepository; this.aiProvider = aiProvider; this.objectMapper = objectMapper;
	}

	public QuizCreateRequest generate(Long userId, Long courseId, QuizGenerateRequest request) {
		courseAccessService.requireOwnedCourse(userId, courseId);
		if (request == null || request.documentIds() == null || request.documentIds().isEmpty()) throw badRequest("Choose at least one ready document.");
		int count = request.questionCount() == null ? 3 : request.questionCount();
		if (count < 1 || count > 5) throw badRequest("Question count must be between 1 and 5.");
		List<Long> ids = request.documentIds().stream().distinct().toList();
		String context = ids.stream().map(id -> context(courseId, id)).reduce((left, right) -> left + "\n\n" + right).orElse("");
		if (context.isBlank()) throw badRequest("No usable document content was found.");
		String prompt = "Create exactly " + count + " Vietnamese multiple-choice questions from this context. Return only a JSON array. Each item must contain questionText, options (exactly 4 strings), answerText, explanation. Every answer must be supported by the context.\n\n" + context;
		String generated = aiProvider.flatMap(provider -> provider.complete("You are a careful educational quiz generator. Output valid JSON only.", prompt))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI quiz generation is not configured."));
		try {
			List<QuizQuestionWriteRequest> questions = objectMapper.readValue(stripFence(generated), new TypeReference<>() { });
			if (questions.size() != count) throw badRequest("AI did not return the requested number of questions.");
			return new QuizCreateRequest("Ôn tập tự động", questions, ids);
		} catch (JacksonException exception) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI returned an invalid quiz format."); }
	}

	private String context(Long courseId, Long documentId) {
		if (documentId == null) throw badRequest("Document IDs must not contain null values.");
		CourseDocument document = documentRepository.findByIdAndCourseId(documentId, courseId).orElseThrow(() -> new CourseDocumentNotFoundException(documentId));
		if (!"READY".equals(document.processingStatus())) throw badRequest("Every quiz source document must be ready.");
		return documentChunkRepository.findTop3ByDocumentIdOrderByChunkIndexAsc(documentId).stream().map(chunk -> chunk.content()).reduce((left, right) -> left + "\n" + right).orElse("");
	}
	private String stripFence(String value) { return value.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "").trim(); }
	private ResponseStatusException badRequest(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
