package com.tritagon.studymate.document;

import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.course.CourseNotFoundException;
import com.tritagon.studymate.course.CourseRepository;

@Service
public class CourseDocumentService {

	private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
	private static final Set<String> SUPPORTED_EXTENSIONS = Set.of("pdf", "docx");
	private static final Set<String> SUPPORTED_CONTENT_TYPES = Set.of(
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document");

	private final CourseRepository courseRepository;
	private final CourseDocumentRepository documentRepository;
	private final LocalDocumentStorage storage;

	public CourseDocumentService(CourseRepository courseRepository, CourseDocumentRepository documentRepository,
			LocalDocumentStorage storage) {
		this.courseRepository = courseRepository;
		this.documentRepository = documentRepository;
		this.storage = storage;
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
		String fileName = validate(file);
		String storagePath = storage.store(courseId, file);
		try {
			OffsetDateTime now = OffsetDateTime.now();
			CourseDocument saved = documentRepository.save(new CourseDocument(
					null,
					courseId,
					fileName,
					storagePath,
					normalizedContentType(file),
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
		courseRepository.findByIdAndOwnerId(courseId, ownerId)
				.orElseThrow(() -> new CourseNotFoundException(courseId));
	}

	private CourseDocument findDocument(Long courseId, Long documentId) {
		return documentRepository.findByIdAndCourseId(documentId, courseId)
				.orElseThrow(() -> new CourseDocumentNotFoundException(documentId));
	}

	private String validate(MultipartFile file) {
		if (file == null || file.isEmpty() || file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A non-empty document file is required.");
		}
		String fileName = Path.of(file.getOriginalFilename().replace('\\', '/')).getFileName().toString().trim();
		if (fileName.isBlank() || fileName.length() > 255) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document file name must not exceed 255 characters.");
		}
		if (file.getSize() > MAX_FILE_SIZE_BYTES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document file size must not exceed 10 MB.");
		}
		String extension = extension(fileName);
		if (!SUPPORTED_EXTENSIONS.contains(extension)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF and DOCX documents are supported.");
		}
		String contentType = file.getContentType();
		if (contentType != null && !contentType.isBlank() && !SUPPORTED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document content type does not match PDF or DOCX.");
		}
		return fileName;
	}

	private String extension(String fileName) {
		int separator = fileName.lastIndexOf('.');
		return separator < 0 ? "" : fileName.substring(separator + 1).toLowerCase(Locale.ROOT);
	}

	private String normalizedContentType(MultipartFile file) {
		String contentType = file.getContentType();
		if (contentType != null && !contentType.isBlank()) {
			return contentType.toLowerCase(Locale.ROOT);
		}
		return extension(file.getOriginalFilename()).equals("pdf")
				? "application/pdf"
				: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	}
}
