package com.tritagon.studymate.quiz;

import java.util.List;

public record QuizQuestionResponse(Long id, String questionText, List<String> options, String explanation, Integer position) {
}
