package com.tritagon.studymate.quiz;

import java.util.List;

public record QuizQuestionWriteRequest(String questionText, List<String> options, String answerText, String explanation) {
}
