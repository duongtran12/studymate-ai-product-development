package com.tritagon.studymate.study;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiStatusService {

	private final boolean enabled;
	private final String apiKey;
	private final String model;

	public AiStatusService(@Value("${studymate.ai.enabled:false}") boolean enabled,
			@Value("${studymate.ai.api-key:}") String apiKey,
			@Value("${studymate.ai.model:}") String model) {
		this.enabled = enabled;
		this.apiKey = apiKey;
		this.model = model;
	}

	public AiStatusResponse status() {
		if (!enabled) return new AiStatusResponse(false, false, "AI chưa được bật trong cấu hình.");
		if (apiKey.isBlank()) return new AiStatusResponse(true, false, "AI đang bật nhưng chưa có API key.");
		if (model.isBlank()) return new AiStatusResponse(true, false, "AI đang bật nhưng chưa chọn model.");
		return new AiStatusResponse(true, true, "AI đã sẵn sàng để tạo câu trả lời và quiz.");
	}
}
