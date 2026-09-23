package com.tritagon.studymate.document;

import java.net.URI;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/documents")
public class CourseDocumentController {

	private final CourseDocumentService documentService;

	public CourseDocumentController(CourseDocumentService documentService) {
		this.documentService = documentService;
	}

	@GetMapping
	public List<CourseDocumentResponse> list(@RequestHeader("X-User-Id") Long userId, @PathVariable Long courseId) {
		return documentService.list(userId, courseId);
	}

	@GetMapping("/{documentId}")
	public CourseDocumentResponse get(@RequestHeader("X-User-Id") Long userId, @PathVariable Long courseId,
			@PathVariable Long documentId) {
		return documentService.get(userId, courseId, documentId);
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<CourseDocumentResponse> upload(@RequestHeader("X-User-Id") Long userId,
			@PathVariable Long courseId, @RequestPart("file") MultipartFile file) {
		CourseDocumentResponse document = documentService.upload(userId, courseId, file);
		URI location = URI.create("/api/v1/courses/" + courseId + "/documents/" + document.id());
		return ResponseEntity.created(location).body(document);
	}

	@DeleteMapping("/{documentId}")
	public ResponseEntity<Void> delete(@RequestHeader("X-User-Id") Long userId, @PathVariable Long courseId,
			@PathVariable Long documentId) {
		documentService.delete(userId, courseId, documentId);
		return ResponseEntity.noContent().build();
	}
}
