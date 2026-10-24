package com.tritagon.studymate.course;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.user.UserAccountRepository;

@ExtendWith(MockitoExtension.class)
class CourseServiceTests {

	private static final long OWNER_ID = 11L;
	private static final long COURSE_ID = 21L;

	@Mock
	private CourseRepository courseRepository;

	@Mock
	private UserAccountRepository userAccountRepository;

	@Mock
	private CourseAccessService courseAccessService;

	private CourseService service;

	@BeforeEach
	void setUp() {
		service = new CourseService(courseRepository, userAccountRepository, courseAccessService);
	}

	@Test
	void createsNormalizedCourseForExistingUser() {
		when(userAccountRepository.existsById(OWNER_ID)).thenReturn(true);
		when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> {
			Course draft = invocation.getArgument(0);
			return new Course(COURSE_ID, draft.ownerId(), draft.name(), draft.code(), draft.description(),
					draft.createdAt(), draft.updatedAt());
		});

		CourseResponse result = service.create(OWNER_ID, new CourseWriteRequest(
				"  Software Testing  ", "  ST302  ", "  Test automation  "));

		assertThat(result.id()).isEqualTo(COURSE_ID);
		assertThat(result.name()).isEqualTo("Software Testing");
		assertThat(result.code()).isEqualTo("ST302");
		assertThat(result.description()).isEqualTo("Test automation");
		ArgumentCaptor<Course> savedCourse = ArgumentCaptor.forClass(Course.class);
		verify(courseRepository).save(savedCourse.capture());
		assertThat(savedCourse.getValue().ownerId()).isEqualTo(OWNER_ID);
	}

	@Test
	void rejectsUnknownUserBeforeSavingCourse() {
		when(userAccountRepository.existsById(OWNER_ID)).thenReturn(false);

		assertBadRequest(() -> service.create(OWNER_ID, new CourseWriteRequest("Testing", null, null)),
				"does not identify an existing user");

		verifyNoInteractions(courseRepository, courseAccessService);
	}

	@Test
	void rejectsBlankAndOverlongCourseNames() {
		when(userAccountRepository.existsById(OWNER_ID)).thenReturn(true);

		assertBadRequest(() -> service.create(OWNER_ID, new CourseWriteRequest("  ", null, null)), "Course name is required");
		assertBadRequest(() -> service.update(OWNER_ID, COURSE_ID,
				new CourseWriteRequest("x".repeat(161), null, null)), "must not exceed 160");

		verifyNoInteractions(courseRepository, courseAccessService);
	}

	@Test
	void updatesOnlyCourseReturnedByOwnershipCheck() {
		Course existing = course(COURSE_ID, OWNER_ID, "Old title");
		when(courseAccessService.requireOwnedCourse(OWNER_ID, COURSE_ID)).thenReturn(existing);
		when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

		CourseResponse result = service.update(OWNER_ID, COURSE_ID,
				new CourseWriteRequest("  New title ", "  NEW101 ", "  Updated  "));

		assertThat(result.name()).isEqualTo("New title");
		assertThat(result.code()).isEqualTo("NEW101");
		assertThat(result.description()).isEqualTo("Updated");
		verify(courseAccessService).requireOwnedCourse(OWNER_ID, COURSE_ID);
	}

	@Test
	void deletesOnlyCourseReturnedByOwnershipCheck() {
		Course owned = course(COURSE_ID, OWNER_ID, "Testing");
		when(courseAccessService.requireOwnedCourse(OWNER_ID, COURSE_ID)).thenReturn(owned);

		service.delete(OWNER_ID, COURSE_ID);

		verify(courseRepository).delete(owned);
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

	private Course course(Long courseId, Long ownerId, String name) {
		OffsetDateTime now = OffsetDateTime.now();
		return new Course(courseId, ownerId, name, "TST101", "Description", now, now);
	}
}
