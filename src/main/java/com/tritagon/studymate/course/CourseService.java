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
	private final CourseAccessService courseAccessService;
	private final CourseLearningGoalRepository learningGoalRepository;

	public CourseService(CourseRepository courseRepository, UserAccountRepository userAccountRepository,
			CourseAccessService courseAccessService, CourseLearningGoalRepository learningGoalRepository) {
		this.courseRepository = courseRepository;
		this.userAccountRepository = userAccountRepository;
		this.courseAccessService = courseAccessService;
		this.learningGoalRepository = learningGoalRepository;
	}

	public List<CourseResponse> list(Long ownerId) {
		return courseRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId).stream().map(CourseResponse::from).toList();
	}

	public CourseResponse get(Long ownerId, Long courseId) {
		return CourseResponse.from(courseAccessService.requireOwnedCourse(ownerId, courseId));
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
		Course current = courseAccessService.requireOwnedCourse(ownerId, courseId);
		Course saved = courseRepository.save(new Course(current.id(), current.ownerId(), request.name().trim(),
				normalize(request.code()), normalize(request.description()), current.createdAt(), OffsetDateTime.now()));
		return CourseResponse.from(saved);
	}

	public void delete(Long ownerId, Long courseId) {
		courseRepository.delete(courseAccessService.requireOwnedCourse(ownerId, courseId));
	}

	public CourseLearningGoalResponse getLearningGoal(Long ownerId, Long courseId) {
		courseAccessService.requireOwnedCourse(ownerId, courseId);
		return learningGoalRepository.findByCourseId(courseId).map(CourseLearningGoalResponse::from)
				.orElseGet(() -> CourseLearningGoalResponse.empty(courseId));
	}

	public CourseLearningGoalResponse saveLearningGoal(Long ownerId, Long courseId, CourseLearningGoalRequest request) {
		validateLearningGoal(request);
		courseAccessService.requireOwnedCourse(ownerId, courseId);
		CourseLearningGoal current = learningGoalRepository.findByCourseId(courseId).orElse(null);
		CourseLearningGoal saved = learningGoalRepository.save(new CourseLearningGoal(current == null ? null : current.id(), courseId,
				request.targetAttemptCount(), request.targetAverageScore(), OffsetDateTime.now()));
		return CourseLearningGoalResponse.from(saved);
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

	private void validateLearningGoal(CourseLearningGoalRequest request) {
		if (request == null || request.targetAttemptCount() == null || request.targetAttemptCount() < 1
				|| request.targetAttemptCount() > 100) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target quiz attempts must be between 1 and 100.");
		}
		if (request.targetAverageScore() == null || request.targetAverageScore() < 1 || request.targetAverageScore() > 100) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target average score must be between 1 and 100.");
		}
	}
}
