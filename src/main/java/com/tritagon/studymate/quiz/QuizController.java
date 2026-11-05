package com.tritagon.studymate.quiz;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tritagon.studymate.web.CurrentUserId;

@RestController
@RequestMapping("/api/v1")
public class QuizController {
	private final QuizService quizService;
	public QuizController(QuizService quizService) { this.quizService = quizService; }

	@GetMapping("/courses/{courseId}/quizzes")
	public List<QuizResponse> list(@CurrentUserId Long userId, @PathVariable Long courseId) { return quizService.list(userId, courseId); }

	@PostMapping("/courses/{courseId}/quizzes")
	public ResponseEntity<QuizResponse> create(@CurrentUserId Long userId, @PathVariable Long courseId,
			@RequestBody QuizCreateRequest request) {
		QuizResponse quiz = quizService.create(userId, courseId, request);
		return ResponseEntity.created(URI.create("/api/v1/quizzes/" + quiz.id())).body(quiz);
	}

	@GetMapping("/quizzes/{quizId}")
	public QuizResponse get(@CurrentUserId Long userId, @PathVariable Long quizId) { return quizService.get(userId, quizId); }

	@PostMapping("/quizzes/{quizId}/attempts")
	public ResponseEntity<QuizAttemptResponse> submit(@CurrentUserId Long userId, @PathVariable Long quizId,
			@RequestBody QuizAttemptSubmitRequest request) {
		return ResponseEntity.status(201).body(quizService.submit(userId, quizId, request));
	}
}
