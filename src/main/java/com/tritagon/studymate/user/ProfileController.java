package com.tritagon.studymate.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tritagon.studymate.web.CurrentUserId;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

	private final ProfileService profileService;

	public ProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@GetMapping
	public ProfileResponse get(@CurrentUserId Long userId) {
		return profileService.get(userId);
	}

	@PutMapping
	public ProfileResponse update(@CurrentUserId Long userId, @RequestBody ProfileUpdateRequest request) {
		return profileService.update(userId, request);
	}
}
