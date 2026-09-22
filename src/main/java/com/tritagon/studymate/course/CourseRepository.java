package com.tritagon.studymate.course;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface CourseRepository extends CrudRepository<Course, Long> {

	List<Course> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);

	Optional<Course> findByIdAndOwnerId(Long id, Long ownerId);
}
