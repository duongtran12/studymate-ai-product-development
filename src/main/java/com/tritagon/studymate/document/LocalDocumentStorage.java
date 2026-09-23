package com.tritagon.studymate.document;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Component
public class LocalDocumentStorage {

	private final Path root;

	public LocalDocumentStorage(@Value("${studymate.storage.local-root:./data/uploads}") String root) {
		this.root = Path.of(root).toAbsolutePath().normalize();
	}

	public String store(Long courseId, MultipartFile file) {
		String extension = extension(file.getOriginalFilename());
		Path relativePath = Path.of("course-" + courseId, UUID.randomUUID() + "." + extension);
		Path destination = resolve(relativePath.toString());
		try {
			Files.createDirectories(destination.getParent());
			try (InputStream input = file.getInputStream()) {
				Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
			}
			return relativePath.toString().replace('\\', '/');
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store the uploaded document.", exception);
		}
	}

	public void delete(String storagePath) {
		try {
			Files.deleteIfExists(resolve(storagePath));
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not delete the stored document.", exception);
		}
	}

	private Path resolve(String relativePath) {
		Path resolved = root.resolve(relativePath).normalize();
		if (!resolved.startsWith(root)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid document storage path.");
		}
		return resolved;
	}

	private String extension(String fileName) {
		if (fileName == null) {
			return "bin";
		}
		int separator = fileName.lastIndexOf('.');
		return separator < 0 ? "bin" : fileName.substring(separator + 1).toLowerCase(Locale.ROOT);
	}
}
