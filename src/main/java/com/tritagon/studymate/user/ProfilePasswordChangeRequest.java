package com.tritagon.studymate.user;

public record ProfilePasswordChangeRequest(String currentPassword, String newPassword) {
}
