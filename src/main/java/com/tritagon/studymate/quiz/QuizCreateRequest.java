package com.tritagon.studymate.quiz;

import java.util.List;

public record QuizCreateRequest(String title, List<QuizQuestionWriteRequest> questions) {
}
