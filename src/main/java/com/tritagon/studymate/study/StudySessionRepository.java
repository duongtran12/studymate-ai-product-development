package com.tritagon.studymate.study;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface StudySessionRepository extends CrudRepository<StudySession, Long> {

	List<StudySession> findAllByUserIdOrderByUpdatedAtDesc(Long userId);

	List<StudySession> findAllByUserIdAndCourseIdOrderByUpdatedAtDesc(Long userId, Long courseId);

	Optional<StudySession> findByIdAndUserId(Long id, Long userId);
}
