package com.tritagon.studymate.quiz;

import java.util.List;

public record QuizGenerateRequest(List<Long> documentIds, Integer questionCount, String difficulty) {
}
