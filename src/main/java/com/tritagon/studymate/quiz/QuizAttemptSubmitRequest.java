package com.tritagon.studymate.quiz;

import java.util.List;

public record QuizAttemptSubmitRequest(List<QuizAnswerWriteRequest> answers) {
}
