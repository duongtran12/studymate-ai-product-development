package com.tritagon.studymate.study;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.course.CourseNotFoundException;
import com.tritagon.studymate.course.CourseRepository;
import com.tritagon.studymate.document.CourseDocument;
import com.tritagon.studymate.document.CourseDocumentNotFoundException;
import com.tritagon.studymate.document.CourseDocumentRepository;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class StudySessionService {

	private static final String ACTIVE = "ACTIVE";
	private static final String USER = "USER";
	private static final String ASSISTANT = "ASSISTANT";
	private static final String SUPPORTED = "SUPPORTED";
	private static final String INSUFFICIENT_CONTEXT = "INSUFFICIENT_CONTEXT";
	private static final String INSUFFICIENT_CONTEXT_MESSAGE =
			"Chưa đủ căn cứ từ tài liệu đã chọn để trả lời câu hỏi này.";
	private static final TypeReference<List<CitationResponse>> CITATION_LIST = new TypeReference<>() {
	};

	private final CourseRepository courseRepository;
	private final CourseDocumentRepository documentRepository;
	private final StudySessionRepository sessionRepository;
	private final StudySessionDocumentRepository sessionDocumentRepository;
	private final ChatMessageRepository messageRepository;
	private final ObjectMapper objectMapper;

	public StudySessionService(CourseRepository courseRepository, CourseDocumentRepository documentRepository,
			StudySessionRepository sessionRepository, StudySessionDocumentRepository sessionDocumentRepository,
			ChatMessageRepository messageRepository, ObjectMapper objectMapper) {
		this.courseRepository = courseRepository;
		this.documentRepository = documentRepository;
		this.sessionRepository = sessionRepository;
		this.sessionDocumentRepository = sessionDocumentRepository;
		this.messageRepository = messageRepository;
		this.objectMapper = objectMapper;
	}

	@Transactional
	public StudySessionResponse create(Long userId, StudySessionCreateRequest request) {
		validateCreateRequest(request);
		ensureOwnedCourse(userId, request.courseId());
		List<Long> documentIds = validateDocuments(request.courseId(), request.documentIds());
		OffsetDateTime now = OffsetDateTime.now();
		StudySession session = sessionRepository.save(new StudySession(
				null, userId, request.courseId(), request.title().trim(), ACTIVE, now, now));
		if (!documentIds.isEmpty()) {
			sessionDocumentRepository.saveAll(documentIds.stream()
					.map(documentId -> new StudySessionDocument(null, session.id(), documentId))
					.toList());
		}
		return StudySessionResponse.from(session, documentIds);
	}

	public List<StudySessionResponse> list(Long userId, Long courseId) {
		List<StudySession> sessions;
		if (courseId == null) {
			sessions = sessionRepository.findAllByUserIdOrderByUpdatedAtDesc(userId);
		} else {
			ensureOwnedCourse(userId, courseId);
			sessions = sessionRepository.findAllByUserIdAndCourseIdOrderByUpdatedAtDesc(userId, courseId);
		}
		return sessions.stream().map(this::toSessionResponse).toList();
	}

	public StudySessionResponse get(Long userId, Long sessionId) {
		return toSessionResponse(findOwnedSession(userId, sessionId));
	}

	public List<ChatMessageResponse> messages(Long userId, Long sessionId) {
		findOwnedSession(userId, sessionId);
		return messageRepository.findAllBySessionIdOrderByCreatedAtAscIdAsc(sessionId).stream()
				.map(this::toMessageResponse)
				.toList();
	}

	@Transactional
	public ChatTurnResponse ask(Long userId, Long sessionId, ChatQuestionRequest request) {
		StudySession session = findOwnedSession(userId, sessionId);
		String question = validateQuestion(request);
		ChatMessage userMessage = messageRepository.save(new ChatMessage(
				null, sessionId, USER, question, null, null, OffsetDateTime.now()));

		List<Long> documentIds = documentIds(sessionId);
		AssistantDraft draft = createAssistantDraft(session.courseId(), documentIds);
		ChatMessage assistantMessage = messageRepository.save(new ChatMessage(
				null,
				sessionId,
				ASSISTANT,
				draft.content(),
				serializeCitations(draft.citations()),
				draft.groundingStatus(),
				OffsetDateTime.now()));

		sessionRepository.save(new StudySession(
				session.id(), session.userId(), session.courseId(), session.title(), session.status(),
				session.createdAt(), OffsetDateTime.now()));

		return new ChatTurnResponse(toMessageResponse(userMessage), toMessageResponse(assistantMessage));
	}

	private AssistantDraft createAssistantDraft(Long courseId, List<Long> documentIds) {
		if (documentIds.isEmpty()) {
			return new AssistantDraft(INSUFFICIENT_CONTEXT_MESSAGE, INSUFFICIENT_CONTEXT, List.of());
		}
		Long documentId = documentIds.getFirst();
		CourseDocument document = documentRepository.findByIdAndCourseId(documentId, courseId)
				.orElseThrow(() -> new CourseDocumentNotFoundException(documentId));
		CitationResponse citation = new CitationResponse(
				document.id(),
				document.fileName(),
				"Tài liệu đã chọn",
				"Citation mô phỏng; nội dung tài liệu chưa được trích xuất ở Chương 5.");
		return new AssistantDraft(
				"Đây là phản hồi mô phỏng cho giai đoạn lưu lịch sử hội thoại. "
						+ "Nội dung AI/RAG sẽ được bổ sung ở giai đoạn tiếp theo.",
				SUPPORTED,
				List.of(citation));
	}

	private StudySessionResponse toSessionResponse(StudySession session) {
		return StudySessionResponse.from(session, documentIds(session.id()));
	}

	private ChatMessageResponse toMessageResponse(ChatMessage message) {
		return new ChatMessageResponse(
				message.id(),
				message.sessionId(),
				message.role(),
				message.content(),
				message.groundingStatus(),
				deserializeCitations(message.citationsJson()),
				message.createdAt());
	}

	private List<Long> documentIds(Long sessionId) {
		return sessionDocumentRepository.findAllBySessionIdOrderByIdAsc(sessionId).stream()
				.map(StudySessionDocument::documentId)
				.toList();
	}

	private List<Long> validateDocuments(Long courseId, List<Long> requestedDocumentIds) {
		if (requestedDocumentIds == null || requestedDocumentIds.isEmpty()) {
			return List.of();
		}
		LinkedHashSet<Long> distinctIds = new LinkedHashSet<>();
		for (Long documentId : requestedDocumentIds) {
			if (documentId == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document IDs must not contain null values.");
			}
			documentRepository.findByIdAndCourseId(documentId, courseId)
					.orElseThrow(() -> new CourseDocumentNotFoundException(documentId));
			distinctIds.add(documentId);
		}
		return List.copyOf(distinctIds);
	}

	private void validateCreateRequest(StudySessionCreateRequest request) {
		if (request == null || request.courseId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course ID is required.");
		}
		if (request.title() == null || request.title().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Study session title is required.");
		}
		if (request.title().trim().length() > 200) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Study session title must not exceed 200 characters.");
		}
	}

	private String validateQuestion(ChatQuestionRequest request) {
		if (request == null || request.question() == null || request.question().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A non-empty question is required.");
		}
		String question = request.question().trim();
		if (question.length() > 4_000) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question must not exceed 4000 characters.");
		}
		return question;
	}

	private void ensureOwnedCourse(Long userId, Long courseId) {
		courseRepository.findByIdAndOwnerId(courseId, userId)
				.orElseThrow(() -> new CourseNotFoundException(courseId));
	}

	private StudySession findOwnedSession(Long userId, Long sessionId) {
		return sessionRepository.findByIdAndUserId(sessionId, userId)
				.orElseThrow(() -> new StudySessionNotFoundException(sessionId));
	}

	private String serializeCitations(List<CitationResponse> citations) {
		try {
			return objectMapper.writeValueAsString(citations);
		} catch (JacksonException exception) {
			throw new IllegalStateException("Could not serialize chat citations.", exception);
		}
	}

	private List<CitationResponse> deserializeCitations(String citationsJson) {
		if (citationsJson == null || citationsJson.isBlank()) {
			return List.of();
		}
		try {
			return objectMapper.readValue(citationsJson, CITATION_LIST);
		} catch (JacksonException exception) {
			throw new IllegalStateException("Could not deserialize chat citations.", exception);
		}
	}

	private record AssistantDraft(String content, String groundingStatus, List<CitationResponse> citations) {
	}
}
