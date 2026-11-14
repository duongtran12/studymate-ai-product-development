package com.tritagon.studymate.document;

import java.io.IOException;
import java.io.InputStream;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;

@Component
public class DocumentTextExtractor {

	private final LocalDocumentStorage storage;

	public DocumentTextExtractor(LocalDocumentStorage storage) {
		this.storage = storage;
	}

	public String extract(CourseDocument document) {
		try (InputStream input = storage.open(document.storagePath())) {
			String text = switch (document.contentType()) {
			case "application/pdf" -> extractPdf(input);
			case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> extractDocx(input);
			default -> throw new IllegalArgumentException("Unsupported document content type.");
			};
			String normalized = text.replaceAll("\\s+", " ").trim();
			if (normalized.isBlank()) throw new IllegalArgumentException("The document does not contain readable text.");
			return normalized;
		} catch (IOException exception) {
			throw new IllegalStateException("Could not extract text from the uploaded document.", exception);
		}
	}

	private String extractPdf(InputStream input) throws IOException {
		try (PDDocument document = Loader.loadPDF(input.readAllBytes())) {
			return new PDFTextStripper().getText(document);
		}
	}

	private String extractDocx(InputStream input) throws IOException {
		try (XWPFDocument document = new XWPFDocument(input); XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
			return extractor.getText();
		}
	}
}
