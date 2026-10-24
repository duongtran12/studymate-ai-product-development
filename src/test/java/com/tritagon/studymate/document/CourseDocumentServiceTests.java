package com.tritagon.studymate.document;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.tritagon.studymate.course.CourseAccessService;

@ExtendWith(MockitoExtension.class)
class CourseDocumentServiceTests {

	private static final long OWNER_ID = 11L;
	private static final long COURSE_ID = 21L;
	private static final long DOCUMENT_ID = 31L;

	@Mock
	private CourseAccessService courseAccessService;

	@Mock
	private CourseDocumentRepository documentRepository;

	@Mock
	private LocalDocumentStorage storage;

	@Mock
	private DocumentUploadValidator documentUploadValidator;

	private CourseDocumentService service;

	@BeforeEach
	void setUp() {
		service = new CourseDocumentService(courseAccessService, documentRepository, storage, documentUploadValidator);
	}

	@Test
	void uploadsValidatedFileWithNormalizedMetadata() {
		MockMultipartFile file = pdf();
		DocumentUploadValidator.ValidatedDocument metadata =
				new DocumentUploadValidator.ValidatedDocument("chapter-08.pdf", "application/pdf");
		when(documentUploadValidator.validate(file)).thenReturn(metadata);
		when(storage.store(COURSE_ID, file)).thenReturn("course-21/generated.pdf");
		when(documentRepository.save(any(CourseDocument.class))).thenAnswer(invocation -> {
			CourseDocument draft = invocation.getArgument(0);
			return new CourseDocument(DOCUMENT_ID, draft.courseId(), draft.fileName(), draft.storagePath(),
					draft.contentType(), draft.fileSizeBytes(), draft.processingStatus(), draft.createdAt(), draft.updatedAt());
		});

		CourseDocumentResponse result = service.upload(OWNER_ID, COURSE_ID, file);

		assertThat(result.id()).isEqualTo(DOCUMENT_ID);
		assertThat(result.fileName()).isEqualTo("chapter-08.pdf");
		ArgumentCaptor<CourseDocument> saved = ArgumentCaptor.forClass(CourseDocument.class);
		verify(documentRepository).save(saved.capture());
		assertThat(saved.getValue().storagePath()).isEqualTo("course-21/generated.pdf");
		assertThat(saved.getValue().contentType()).isEqualTo("application/pdf");
		assertThat(saved.getValue().fileSizeBytes()).isEqualTo((long) file.getSize());
		verify(courseAccessService).requireOwnedCourse(OWNER_ID, COURSE_ID);
	}

	@Test
	void stopsBeforeStorageWhenFileValidationFails() {
		MockMultipartFile file = pdf();
		IllegalArgumentException invalidFile = new IllegalArgumentException("Unsupported document");
		when(documentUploadValidator.validate(file)).thenThrow(invalidFile);

		assertThatThrownBy(() -> service.upload(OWNER_ID, COURSE_ID, file)).isSameAs(invalidFile);

		verify(courseAccessService).requireOwnedCourse(OWNER_ID, COURSE_ID);
		verifyNoInteractions(storage, documentRepository);
	}

	@Test
	void removesStoredFileWhenSavingMetadataFails() {
		MockMultipartFile file = pdf();
		when(documentUploadValidator.validate(file)).thenReturn(
				new DocumentUploadValidator.ValidatedDocument("chapter-08.pdf", "application/pdf"));
		when(storage.store(COURSE_ID, file)).thenReturn("course-21/generated.pdf");
		doThrow(new IllegalStateException("Database unavailable")).when(documentRepository).save(any(CourseDocument.class));

		assertThatThrownBy(() -> service.upload(OWNER_ID, COURSE_ID, file))
				.isInstanceOf(IllegalStateException.class)
				.hasMessageContaining("Database unavailable");

		verify(storage).delete("course-21/generated.pdf");
	}

	@Test
	void deletesOnlyDocumentWithinOwnedCourse() {
		CourseDocument document = document();
		when(documentRepository.findByIdAndCourseId(DOCUMENT_ID, COURSE_ID)).thenReturn(Optional.of(document));

		service.delete(OWNER_ID, COURSE_ID, DOCUMENT_ID);

		verify(courseAccessService).requireOwnedCourse(OWNER_ID, COURSE_ID);
		verify(storage).delete(document.storagePath());
		verify(documentRepository).delete(document);
	}

	private MockMultipartFile pdf() {
		return new MockMultipartFile("file", "chapter-08.pdf", "application/pdf", "test document".getBytes());
	}

	private CourseDocument document() {
		OffsetDateTime now = OffsetDateTime.now();
		return new CourseDocument(DOCUMENT_ID, COURSE_ID, "chapter-08.pdf", "course-21/generated.pdf",
				"application/pdf", 13L, "UPLOADED", now, now);
	}
}
