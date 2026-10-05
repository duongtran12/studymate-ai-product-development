package com.tritagon.studymate.document;

import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Component
public class DocumentUploadValidator {

	private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
	private static final Set<String> SUPPORTED_EXTENSIONS = Set.of("pdf", "docx");
	private static final Set<String> SUPPORTED_CONTENT_TYPES = Set.of(
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document");

	public ValidatedDocument validate(MultipartFile file) {
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

		String contentType = normalizedContentType(file.getContentType(), extension);
		if (!SUPPORTED_CONTENT_TYPES.contains(contentType)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document content type does not match PDF or DOCX.");
		}
		return new ValidatedDocument(fileName, contentType);
	}

	private String extension(String fileName) {
		int separator = fileName.lastIndexOf('.');
		return separator < 0 ? "" : fileName.substring(separator + 1).toLowerCase(Locale.ROOT);
	}

	private String normalizedContentType(String rawContentType, String extension) {
		if (rawContentType != null && !rawContentType.isBlank()) {
			return rawContentType.toLowerCase(Locale.ROOT);
		}
		return extension.equals("pdf")
				? "application/pdf"
				: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	}

	public record ValidatedDocument(String fileName, String contentType) {
	}
}
