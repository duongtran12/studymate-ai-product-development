package com.tritagon.studymate.auth;

public record AuthRegisterRequest(String email, String password, String displayName) {
}
