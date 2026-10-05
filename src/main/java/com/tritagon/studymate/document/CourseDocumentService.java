package com.tritagon.studymate.document;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.tritagon.studymate.course.CourseAccessService;

@Service
public class CourseDocumentService {

	private final CourseAccessService courseAccessService;
	private final CourseDocumentRepository documentRepository;
	private final LocalDocumentStorage storage;
	private final DocumentUploadValidator documentUploadValidator;

	public CourseDocumentService(CourseAccessService courseAccessService, CourseDocumentRepository documentRepository,
			LocalDocumentStorage storage, DocumentUploadValidator documentUploadValidator) {
		this.courseAccessService = courseAccessService;
		this.documentRepository = documentRepository;
		this.storage = storage;
		this.documentUploadValidator = documentUploadValidator;
	}

	public List<CourseDocumentResponse> list(Long ownerId, Long courseId) {
		ensureOwnedCourse(ownerId, courseId);
		return documentRepository.findAllByCourseIdOrderByCreatedAtDesc(courseId).stream()
				.map(CourseDocumentResponse::from)
				.toList();
	}

	public CourseDocumentResponse get(Long ownerId, Long courseId, Long documentId) {
		ensureOwnedCourse(ownerId, courseId);
		return CourseDocumentResponse.from(findDocument(courseId, documentId));
	}

	@Transactional
	public CourseDocumentResponse upload(Long ownerId, Long courseId, MultipartFile file) {
		ensureOwnedCourse(ownerId, courseId);
		DocumentUploadValidator.ValidatedDocument fileMetadata = documentUploadValidator.validate(file);
		String storagePath = storage.store(courseId, file);
		try {
			OffsetDateTime now = OffsetDateTime.now();
			CourseDocument saved = documentRepository.save(new CourseDocument(
					null,
					courseId,
					fileMetadata.fileName(),
					storagePath,
					fileMetadata.contentType(),
					file.getSize(),
					"UPLOADED",
					now,
					now));
			return CourseDocumentResponse.from(saved);
		} catch (RuntimeException exception) {
			storage.delete(storagePath);
			throw exception;
		}
	}

	@Transactional
	public void delete(Long ownerId, Long courseId, Long documentId) {
		ensureOwnedCourse(ownerId, courseId);
		CourseDocument document = findDocument(courseId, documentId);
		storage.delete(document.storagePath());
		documentRepository.delete(document);
	}

	private void ensureOwnedCourse(Long ownerId, Long courseId) {
		courseAccessService.requireOwnedCourse(ownerId, courseId);
	}

	private CourseDocument findDocument(Long courseId, Long documentId) {
		return documentRepository.findByIdAndCourseId(documentId, courseId)
				.orElseThrow(() -> new CourseDocumentNotFoundException(documentId));
	}

}
