package com.tritagon.studymate.study;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AiStatusServiceTests {

	@Test
	void disabledAiIsNotReady() {
		AiStatusResponse status = new AiStatusService(false, "key", "model").status();
		assertThat(status.enabled()).isFalse();
		assertThat(status.ready()).isFalse();
	}

	@Test
	void enabledAiNeedsKeyAndModel() {
		assertThat(new AiStatusService(true, "", "model").status().ready()).isFalse();
		assertThat(new AiStatusService(true, "key", "").status().ready()).isFalse();
	}

	@Test
	void configuredAiIsReady() {
		AiStatusResponse status = new AiStatusService(true, "key", "model").status();
		assertThat(status.ready()).isTrue();
	}
}
