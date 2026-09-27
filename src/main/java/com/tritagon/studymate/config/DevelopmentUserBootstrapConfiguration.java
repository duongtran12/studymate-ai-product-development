package com.tritagon.studymate.config;

import java.time.OffsetDateTime;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;

import com.tritagon.studymate.user.UserAccount;
import com.tritagon.studymate.user.UserAccountRepository;

@Configuration
@Profile("dev")
public class DevelopmentUserBootstrapConfiguration {

	private static final String DEMO_EMAIL = "demo@studymate.local";

	@Bean
	@Order(2)
	ApplicationRunner createDevelopmentUser(UserAccountRepository userAccountRepository) {
		return arguments -> {
			if (userAccountRepository.findByEmail(DEMO_EMAIL).isEmpty()) {
				OffsetDateTime now = OffsetDateTime.now();
				userAccountRepository.save(new UserAccount(
						null,
						DEMO_EMAIL,
						"development-only-no-login",
						"Demo Student",
						now,
						now));
			}
		};
	}
}
