package com.tritagon.studymate.study;

public record ChatTurnResponse(ChatMessageResponse userMessage, ChatMessageResponse assistantMessage) {
}
