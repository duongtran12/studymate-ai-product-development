package com.tritagon.studymate.study;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.tritagon.studymate.document.CourseDocument;
import com.tritagon.studymate.document.CourseDocumentNotFoundException;
import com.tritagon.studymate.document.CourseDocumentRepository;

@ExtendWith(MockitoExtension.class)
class GroundedAnswerGeneratorTests {

	private static final long COURSE_ID = 71;
	private static final long DOCUMENT_ID = 81;

	@Mock
	private CourseDocumentRepository documentRepository;

	private MockGroundedAnswerGenerator generator;

	@BeforeEach
	void setUp() {
		generator = new MockGroundedAnswerGenerator(documentRepository);
	}

	@Test
	void noSelectedDocumentsReturnsInsufficientContextWithoutCitation() {
		GroundedAnswer answer = generator.generate(request(List.of()));

		assertThat(answer.status()).isEqualTo(GroundingStatus.INSUFFICIENT_CONTEXT);
		assertThat(answer.content()).isEqualTo(
				"Chưa đủ căn cứ từ tài liệu đã chọn để trả lời câu hỏi này.");
		assertThat(answer.citations()).isEmpty();
		verifyNoInteractions(documentRepository);
	}

	@Test
	void selectedDocumentReturnsSupportedAnswerWithCitation() {
		CourseDocument document = document();
		when(documentRepository.findByIdAndCourseId(DOCUMENT_ID, COURSE_ID)).thenReturn(Optional.of(document));

		GroundedAnswer answer = generator.generate(request(List.of(DOCUMENT_ID)));

		assertThat(answer.status()).isEqualTo(GroundingStatus.SUPPORTED);
		assertThat(answer.content()).isNotBlank();
		assertThat(answer.citations()).singleElement().satisfies(citation -> {
			assertThat(citation.documentId()).isEqualTo(DOCUMENT_ID);
			assertThat(citation.documentName()).isEqualTo("chapter-06.pdf");
			assertThat(citation.locator()).isNotBlank();
			assertThat(citation.excerpt()).isNotBlank();
		});
		verify(documentRepository).findByIdAndCourseId(DOCUMENT_ID, COURSE_ID);
	}

	@Test
	void missingSelectedDocumentIsRejected() {
		when(documentRepository.findByIdAndCourseId(DOCUMENT_ID, COURSE_ID)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> generator.generate(request(List.of(DOCUMENT_ID))))
				.isInstanceOf(CourseDocumentNotFoundException.class);
	}

	@Test
	void supportedAnswerCannotBeCreatedWithoutCitation() {
		assertThatThrownBy(() -> new GroundedAnswer("Unsupported output", GroundingStatus.SUPPORTED, List.of()))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("must include at least one citation");
	}

	@Test
	void insufficientContextAnswerCannotCarryCitation() {
		CitationResponse citation = new CitationResponse(DOCUMENT_ID, "chapter-06.pdf", "Page 1", "Excerpt");

		assertThatThrownBy(() -> new GroundedAnswer(
				"Not enough evidence", GroundingStatus.INSUFFICIENT_CONTEXT, List.of(citation)))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("must not include citations");
	}

	@Test
	void requestKeepsQuestionAndCopiesDocumentScope() {
		List<Long> mutableDocumentIds = new ArrayList<>(List.of(DOCUMENT_ID));
		GroundedAnswerRequest request = new GroundedAnswerRequest("  What is DI?  ", COURSE_ID, mutableDocumentIds);

		mutableDocumentIds.clear();

		assertThat(request.question()).isEqualTo("  What is DI?  ");
		assertThat(request.documentIds()).containsExactly(DOCUMENT_ID);
		assertThatThrownBy(() -> request.documentIds().add(99L))
				.isInstanceOf(UnsupportedOperationException.class);
	}

	private GroundedAnswerRequest request(List<Long> documentIds) {
		return new GroundedAnswerRequest("Explain dependency injection", COURSE_ID, documentIds);
	}

	private CourseDocument document() {
		OffsetDateTime now = OffsetDateTime.now();
		return new CourseDocument(
				DOCUMENT_ID,
				COURSE_ID,
				"chapter-06.pdf",
				"71/chapter-06.pdf",
				"application/pdf",
				1024L,
				"UPLOADED",
				now,
				now);
	}
}
