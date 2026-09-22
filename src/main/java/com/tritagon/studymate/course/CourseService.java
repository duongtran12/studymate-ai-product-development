package com.tritagon.studymate.course;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.user.UserAccountRepository;

@Service
public class CourseService {

	private final CourseRepository courseRepository;
	private final UserAccountRepository userAccountRepository;

	public CourseService(CourseRepository courseRepository, UserAccountRepository userAccountRepository) {
		this.courseRepository = courseRepository;
		this.userAccountRepository = userAccountRepository;
	}

	public List<CourseResponse> list(Long ownerId) {
		return courseRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId).stream().map(CourseResponse::from).toList();
	}

	public CourseResponse get(Long ownerId, Long courseId) {
		return CourseResponse.from(findOwnedCourse(ownerId, courseId));
	}

	public CourseResponse create(Long ownerId, CourseWriteRequest request) {
		ensureUserExists(ownerId);
		validate(request);
		OffsetDateTime now = OffsetDateTime.now();
		Course saved = courseRepository.save(new Course(null, ownerId, request.name().trim(), normalize(request.code()),
				normalize(request.description()), now, now));
		return CourseResponse.from(saved);
	}

	public CourseResponse update(Long ownerId, Long courseId, CourseWriteRequest request) {
		validate(request);
		Course current = findOwnedCourse(ownerId, courseId);
		Course saved = courseRepository.save(new Course(current.id(), current.ownerId(), request.name().trim(),
				normalize(request.code()), normalize(request.description()), current.createdAt(), OffsetDateTime.now()));
		return CourseResponse.from(saved);
	}

	public void delete(Long ownerId, Long courseId) {
		courseRepository.delete(findOwnedCourse(ownerId, courseId));
	}

	private Course findOwnedCourse(Long ownerId, Long courseId) {
		return courseRepository.findByIdAndOwnerId(courseId, ownerId).orElseThrow(() -> new CourseNotFoundException(courseId));
	}

	private void ensureUserExists(Long ownerId) {
		if (!userAccountRepository.existsById(ownerId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-User-Id does not identify an existing user.");
		}
	}

	private void validate(CourseWriteRequest request) {
		if (request == null || request.name() == null || request.name().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course name is required.");
		}
		if (request.name().trim().length() > 160) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course name must not exceed 160 characters.");
		}
	}

	private String normalize(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
