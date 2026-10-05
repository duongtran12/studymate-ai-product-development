package com.tritagon.studymate.document;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

class DocumentUploadValidatorTests {

	private final DocumentUploadValidator validator = new DocumentUploadValidator();

	@Test
	void sanitizesTheFileNameAndKeepsThePdfContentType() {
		MockMultipartFile file = new MockMultipartFile(
				"file", "C:\\fakepath\\week-07.pdf", "application/pdf", "study material".getBytes());

		DocumentUploadValidator.ValidatedDocument result = validator.validate(file);

		assertThat(result.fileName()).isEqualTo("week-07.pdf");
		assertThat(result.contentType()).isEqualTo("application/pdf");
	}

	@Test
	void infersDocxContentTypeWhenTheBrowserDoesNotSupplyOne() {
		MockMultipartFile file = new MockMultipartFile("file", "week-07.docx", null, "study material".getBytes());

		DocumentUploadValidator.ValidatedDocument result = validator.validate(file);

		assertThat(result.contentType())
				.isEqualTo("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
	}

	@Test
	void rejectsUnsupportedFileType() {
		MockMultipartFile file = new MockMultipartFile("file", "notes.txt", "text/plain", "notes".getBytes());

		assertBadRequest(() -> validator.validate(file), "Only PDF and DOCX");
	}

	@Test
	void rejectsFilesLargerThanTenMegabytes() {
		MockMultipartFile file = new MockMultipartFile(
				"file", "week-07.pdf", "application/pdf", new byte[10 * 1024 * 1024 + 1]);

		assertBadRequest(() -> validator.validate(file), "10 MB");
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
}
