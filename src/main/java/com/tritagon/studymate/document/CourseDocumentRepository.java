package com.tritagon.studymate.document;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface CourseDocumentRepository extends CrudRepository<CourseDocument, Long> {

	List<CourseDocument> findAllByCourseIdOrderByCreatedAtDesc(Long courseId);

	Optional<CourseDocument> findByIdAndCourseId(Long id, Long courseId);
}
