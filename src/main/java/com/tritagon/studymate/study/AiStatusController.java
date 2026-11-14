package com.tritagon.studymate.study;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tritagon.studymate.web.CurrentUserId;

@RestController
@RequestMapping("/api/v1/ai")
public class AiStatusController {

	private final AiStatusService aiStatusService;

	public AiStatusController(AiStatusService aiStatusService) {
		this.aiStatusService = aiStatusService;
	}

	@GetMapping("/status")
	public AiStatusResponse status(@CurrentUserId Long userId) {
		return aiStatusService.status();
	}
}
