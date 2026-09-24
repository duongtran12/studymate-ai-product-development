package com.tritagon.studymate.study;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/study-sessions")
public class StudySessionController {

	private final StudySessionService sessionService;

	public StudySessionController(StudySessionService sessionService) {
		this.sessionService = sessionService;
	}

	@PostMapping
	public ResponseEntity<StudySessionResponse> create(@RequestHeader("X-User-Id") Long userId,
			@RequestBody StudySessionCreateRequest request) {
		StudySessionResponse session = sessionService.create(userId, request);
		return ResponseEntity.created(URI.create("/api/v1/study-sessions/" + session.id())).body(session);
	}

	@GetMapping
	public List<StudySessionResponse> list(@RequestHeader("X-User-Id") Long userId,
			@RequestParam(required = false) Long courseId) {
		return sessionService.list(userId, courseId);
	}

	@GetMapping("/{sessionId}")
	public StudySessionResponse get(@RequestHeader("X-User-Id") Long userId, @PathVariable Long sessionId) {
		return sessionService.get(userId, sessionId);
	}

	@GetMapping("/{sessionId}/messages")
	public List<ChatMessageResponse> messages(@RequestHeader("X-User-Id") Long userId,
			@PathVariable Long sessionId) {
		return sessionService.messages(userId, sessionId);
	}

	@PostMapping("/{sessionId}/messages")
	public ResponseEntity<ChatTurnResponse> ask(@RequestHeader("X-User-Id") Long userId,
			@PathVariable Long sessionId, @RequestBody ChatQuestionRequest request) {
		ChatTurnResponse turn = sessionService.ask(userId, sessionId, request);
		return ResponseEntity.created(URI.create("/api/v1/study-sessions/" + sessionId + "/messages")).body(turn);
	}
}
