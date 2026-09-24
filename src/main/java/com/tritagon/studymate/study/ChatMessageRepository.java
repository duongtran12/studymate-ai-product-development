package com.tritagon.studymate.study;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface ChatMessageRepository extends CrudRepository<ChatMessage, Long> {

	List<ChatMessage> findAllBySessionIdOrderByCreatedAtAscIdAsc(Long sessionId);
}
