package com.tritagon.studymate.course;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

	private final CourseService courseService;

	public CourseController(CourseService courseService) {
		this.courseService = courseService;
	}

	@GetMapping
	public List<CourseResponse> list(@RequestHeader("X-User-Id") Long userId) {
		return courseService.list(userId);
	}

	@GetMapping("/{courseId}")
	public CourseResponse get(@RequestHeader("X-User-Id") Long userId, @PathVariable Long courseId) {
		return courseService.get(userId, courseId);
	}

	@PostMapping
	public ResponseEntity<CourseResponse> create(@RequestHeader("X-User-Id") Long userId, @RequestBody CourseWriteRequest request) {
		CourseResponse course = courseService.create(userId, request);
		return ResponseEntity.created(URI.create("/api/v1/courses/" + course.id())).body(course);
	}

	@PutMapping("/{courseId}")
	public CourseResponse update(@RequestHeader("X-User-Id") Long userId, @PathVariable Long courseId,
			@RequestBody CourseWriteRequest request) {
		return courseService.update(userId, courseId, request);
	}

	@DeleteMapping("/{courseId}")
	public ResponseEntity<Void> delete(@RequestHeader("X-User-Id") Long userId, @PathVariable Long courseId) {
		courseService.delete(userId, courseId);
		return ResponseEntity.noContent().build();
	}
}
