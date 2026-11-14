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
	private final DocumentIngestionService documentIngestionService;

	public CourseDocumentService(CourseAccessService courseAccessService, CourseDocumentRepository documentRepository,
			LocalDocumentStorage storage, DocumentUploadValidator documentUploadValidator,
			DocumentIngestionService documentIngestionService) {
		this.courseAccessService = courseAccessService;
		this.documentRepository = documentRepository;
		this.storage = storage;
		this.documentUploadValidator = documentUploadValidator;
		this.documentIngestionService = documentIngestionService;
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
					"PROCESSING",
					now,
					now));
			try {
				documentIngestionService.ingest(saved);
				return CourseDocumentResponse.from(withStatus(saved, "READY"));
			} catch (RuntimeException exception) {
				return CourseDocumentResponse.from(withStatus(saved, "FAILED"));
			}
		} catch (RuntimeException exception) {
			storage.delete(storagePath);
			throw exception;
		}
	}

	private CourseDocument withStatus(CourseDocument document, String status) {
		return documentRepository.save(new CourseDocument(document.id(), document.courseId(), document.fileName(),
				document.storagePath(), document.contentType(), document.fileSizeBytes(), status, document.createdAt(), OffsetDateTime.now()));
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
