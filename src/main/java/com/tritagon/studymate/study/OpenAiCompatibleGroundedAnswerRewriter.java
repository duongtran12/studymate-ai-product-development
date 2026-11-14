package com.tritagon.studymate.study;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Optional adapter for OpenAI-compatible chat completion APIs. The caller keeps
 * the retrieved document excerpts as the only allowed source of facts.
 */
@Component
@ConditionalOnProperty(name = "studymate.ai.enabled", havingValue = "true")
public class OpenAiCompatibleGroundedAnswerRewriter {

	private final RestClient restClient;
	private final String apiKey;
	private final String model;

	public OpenAiCompatibleGroundedAnswerRewriter(
			@Value("${studymate.ai.base-url}") String baseUrl,
			@Value("${studymate.ai.api-key:}") String apiKey,
			@Value("${studymate.ai.model:}") String model) {
		this.restClient = RestClient.builder().baseUrl(baseUrl).build();
		this.apiKey = apiKey;
		this.model = model;
	}

	public Optional<String> rewrite(String question, List<CitationResponse> citations) {
		String context = citations.stream()
				.map(citation -> "[" + citation.documentName() + " — " + citation.locator() + "]\n" + citation.excerpt())
				.reduce((left, right) -> left + "\n\n" + right)
				.orElse("");
		return complete("Answer in Vietnamese using only the supplied excerpts. If the excerpts do not answer the question, say that the context is insufficient. Do not invent citations.",
				"Câu hỏi: " + question + "\n\nNgữ cảnh:\n" + context);
	}

	public Optional<String> complete(String systemPrompt, String userPrompt) {
		if (apiKey.isBlank() || model.isBlank()) return Optional.empty();
		Map<String, Object> request = Map.of(
				"model", model,
				"temperature", 0.2,
				"messages", List.of(
						Map.of("role", "system", "content", systemPrompt),
						Map.of("role", "user", "content", userPrompt)));
		try {
			@SuppressWarnings("unchecked")
			Map<String, Object> response = restClient.post().uri("/chat/completions")
					.contentType(MediaType.APPLICATION_JSON)
					.headers(headers -> headers.setBearerAuth(apiKey))
					.body(request)
					.retrieve()
					.body(Map.class);
			if (response == null || !(response.get("choices") instanceof List<?> choices) || choices.isEmpty()
					|| !(choices.getFirst() instanceof Map<?, ?> choice)
					|| !(choice.get("message") instanceof Map<?, ?> message)
					|| !(message.get("content") instanceof String content) || content.isBlank()) {
				return Optional.empty();
			}
			return Optional.of(content.trim());
		} catch (RuntimeException exception) {
			return Optional.empty();
		}
	}
}
