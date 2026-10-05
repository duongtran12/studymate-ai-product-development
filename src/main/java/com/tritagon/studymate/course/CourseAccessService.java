package com.tritagon.studymate.course;

import org.springframework.stereotype.Service;

@Service
public class CourseAccessService {

	private final CourseRepository courseRepository;

	public CourseAccessService(CourseRepository courseRepository) {
		this.courseRepository = courseRepository;
	}

	public Course requireOwnedCourse(Long ownerId, Long courseId) {
		return courseRepository.findByIdAndOwnerId(courseId, ownerId)
				.orElseThrow(() -> new CourseNotFoundException(courseId));
	}
}
