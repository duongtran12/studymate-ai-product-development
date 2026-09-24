package com.tritagon.studymate.study;

import java.util.List;

public record StudySessionCreateRequest(Long courseId, String title, List<Long> documentIds) {
}
