package com.tritagon.studymate.study;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.course.CourseAccessService;
import com.tritagon.studymate.document.CourseDocument;
import com.tritagon.studymate.document.CourseDocumentNotFoundException;
import com.tritagon.studymate.document.CourseDocumentRepository;

import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class StudySessionServiceTests {

	private static final long USER_ID = 11L;
	private static final long COURSE_ID = 21L;
	private static final long DOCUMENT_ID = 31L;
	private static final long SESSION_ID = 41L;

	@Mock
	private CourseAccessService courseAccessService;

	@Mock
	private CourseDocumentRepository documentRepository;

	@Mock
	private StudySessionRepository sessionRepository;

	@Mock
	private StudySessionDocumentRepository sessionDocumentRepository;

	@Mock
	private ChatMessageRepository messageRepository;

	@Mock
	private GroundedAnswerGenerator groundedAnswerGenerator;

	@Mock
	private ObjectMapper objectMapper;

	private StudySessionService service;

	@BeforeEach
	void setUp() {
		service = new StudySessionService(courseAccessService, documentRepository, sessionRepository,
				sessionDocumentRepository, messageRepository, groundedAnswerGenerator, objectMapper);
	}

	@Test
	void createsSessionWithUniqueCourseScopedDocuments() {
		CourseDocument document = document(DOCUMENT_ID);
		when(documentRepository.findByIdAndCourseId(DOCUMENT_ID, COURSE_ID)).thenReturn(Optional.of(document));
		when(sessionRepository.save(any(StudySession.class))).thenAnswer(invocation -> {
			StudySession draft = invocation.getArgument(0);
			return new StudySession(SESSION_ID, draft.userId(), draft.courseId(), draft.title(), draft.status(),
					draft.createdAt(), draft.updatedAt());
		});

		StudySessionResponse result = service.create(USER_ID,
				new StudySessionCreateRequest(COURSE_ID, "  Chapter 8 test plan  ", List.of(DOCUMENT_ID, DOCUMENT_ID)));

		assertThat(result.id()).isEqualTo(SESSION_ID);
		assertThat(result.title()).isEqualTo("Chapter 8 test plan");
		assertThat(result.documentIds()).containsExactly(DOCUMENT_ID);
		verify(courseAccessService).requireOwnedCourse(USER_ID, COURSE_ID);
		verify(documentRepository, times(2)).findByIdAndCourseId(DOCUMENT_ID, COURSE_ID);
		verify(sessionDocumentRepository).saveAll(List.of(new StudySessionDocument(null, SESSION_ID, DOCUMENT_ID)));
	}

	@Test
	void rejectsDocumentOutsideCourseScopeBeforeSessionIsSaved() {
		when(documentRepository.findByIdAndCourseId(DOCUMENT_ID, COURSE_ID)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.create(USER_ID,
				new StudySessionCreateRequest(COURSE_ID, "Private source", List.of(DOCUMENT_ID))))
				.isInstanceOf(CourseDocumentNotFoundException.class)
				.hasMessageContaining(String.valueOf(DOCUMENT_ID));

		verify(courseAccessService).requireOwnedCourse(USER_ID, COURSE_ID);
		verifyNoInteractions(sessionRepository, sessionDocumentRepository);
	}

	@Test
	void rejectsMissingCourseAndBlankTitleBeforeAccessOrPersistence() {
		assertBadRequest(() -> service.create(USER_ID, new StudySessionCreateRequest(null, "Review", List.of())),
				"Course ID is required");
		assertBadRequest(() -> service.create(USER_ID, new StudySessionCreateRequest(COURSE_ID, "  ", List.of())),
				"title is required");

		verifyNoInteractions(courseAccessService, documentRepository, sessionRepository, sessionDocumentRepository);
	}

	@Test
	void rejectsBlankAndOverlongQuestionsBeforeMessagesAreSaved() {
		when(sessionRepository.findByIdAndUserId(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));

		assertBadRequest(() -> service.ask(USER_ID, SESSION_ID, new ChatQuestionRequest("  ")),
				"non-empty question");
		assertBadRequest(() -> service.ask(USER_ID, SESSION_ID, new ChatQuestionRequest("x".repeat(4_001))),
				"must not exceed 4000");

		verifyNoInteractions(messageRepository, groundedAnswerGenerator);
	}

	private void assertBadRequest(Runnable action, String reason) {
		assertThatThrownBy(action::run)
				.isInstanceOf(ResponseStatusException.class)
				.satisfies(exception -> {
					ResponseStatusException responseException = (ResponseStatusException) exception;
					assertThat(responseException.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
					assertThat(responseException.getReason()).contains(reason);
				});
	}

	private CourseDocument document(Long documentId) {
		OffsetDateTime now = OffsetDateTime.now();
		return new CourseDocument(documentId, COURSE_ID, "chapter-08.pdf", "course-21/chapter-08.pdf",
				"application/pdf", 1024L, "UPLOADED", now, now);
	}

	private StudySession session() {
		OffsetDateTime now = OffsetDateTime.now();
		return new StudySession(SESSION_ID, USER_ID, COURSE_ID, "Test review", "ACTIVE", now, now);
	}
}
