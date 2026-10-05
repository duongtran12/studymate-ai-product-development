package com.tritagon.studymate.course;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CourseAccessServiceTests {

	@Mock
	private CourseRepository courseRepository;

	@Test
	void returnsCourseWhenItBelongsToTheCurrentUser() {
		CourseAccessService service = new CourseAccessService(courseRepository);
		Course course = course(5L, 9L);
		when(courseRepository.findByIdAndOwnerId(5L, 9L)).thenReturn(Optional.of(course));

		Course result = service.requireOwnedCourse(9L, 5L);

		assertThat(result).isSameAs(course);
		verify(courseRepository).findByIdAndOwnerId(5L, 9L);
	}

	@Test
	void rejectsCourseThatIsMissingOrOwnedByAnotherUser() {
		CourseAccessService service = new CourseAccessService(courseRepository);
		when(courseRepository.findByIdAndOwnerId(5L, 9L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.requireOwnedCourse(9L, 5L))
				.isInstanceOf(CourseNotFoundException.class)
				.hasMessageContaining("5");
	}

	private Course course(Long courseId, Long ownerId) {
		OffsetDateTime now = OffsetDateTime.now();
		return new Course(courseId, ownerId, "Software Engineering", "SE101", "Core course", now, now);
	}
}
