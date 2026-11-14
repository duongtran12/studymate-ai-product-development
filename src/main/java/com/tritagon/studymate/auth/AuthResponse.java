package com.tritagon.studymate.auth;

public record AuthResponse(String token, Long userId, String displayName) {
}
