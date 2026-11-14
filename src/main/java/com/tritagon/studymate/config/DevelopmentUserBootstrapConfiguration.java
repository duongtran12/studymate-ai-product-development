package com.tritagon.studymate.config;

import java.time.OffsetDateTime;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.tritagon.studymate.user.UserAccount;
import com.tritagon.studymate.user.UserAccountRepository;

@Configuration
@Profile("dev")
public class DevelopmentUserBootstrapConfiguration {

	private static final String DEMO_EMAIL = "demo@studymate.local";

	@Bean
	@Order(2)
	ApplicationRunner createDevelopmentUser(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
		return arguments -> {
			OffsetDateTime now = OffsetDateTime.now();
			UserAccount existing = userAccountRepository.findByEmail(DEMO_EMAIL).orElse(null);
			if (existing == null || !passwordEncoder.matches("studymate-demo", existing.passwordHash())) {
				userAccountRepository.save(new UserAccount(existing == null ? null : existing.id(), DEMO_EMAIL,
						passwordEncoder.encode("studymate-demo"), "Demo Student",
						existing == null ? now : existing.createdAt(), now));
			}
		};
	}
}
