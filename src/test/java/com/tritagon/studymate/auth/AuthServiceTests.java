package com.tritagon.studymate.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.tritagon.studymate.user.AuthSession;
import com.tritagon.studymate.user.AuthSessionRepository;
import com.tritagon.studymate.user.UserAccount;
import com.tritagon.studymate.user.UserAccountRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

	@Mock
	private UserAccountRepository userAccountRepository;
	@Mock
	private AuthSessionRepository authSessionRepository;

	private AuthService service;

	@BeforeEach
	void setUp() {
		service = new AuthService(userAccountRepository, authSessionRepository, new BCryptPasswordEncoder());
	}

	@Test
	void registersAccountWithEncodedPasswordAndSession() {
		when(userAccountRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());
		when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> {
			UserAccount draft = invocation.getArgument(0);
			return new UserAccount(12L, draft.email(), draft.passwordHash(), draft.displayName(), draft.createdAt(), draft.updatedAt());
		});

		AuthResponse response = service.register(new AuthRegisterRequest(" Student@Example.com ", "correct-password", "Student"));

		assertThat(response.userId()).isEqualTo(12L);
		assertThat(response.token()).isNotBlank();
		ArgumentCaptor<UserAccount> user = ArgumentCaptor.forClass(UserAccount.class);
		verify(userAccountRepository).save(user.capture());
		assertThat(user.getValue().passwordHash()).doesNotContain("correct-password");
		ArgumentCaptor<AuthSession> session = ArgumentCaptor.forClass(AuthSession.class);
		verify(authSessionRepository).save(session.capture());
		assertThat(session.getValue().tokenHash()).doesNotContain(response.token());
		assertThat(session.getValue().expiresAt()).isAfter(session.getValue().createdAt());
	}

	@Test
	void rejectsDuplicateRegistration() {
		when(userAccountRepository.findByEmail("student@example.com")).thenReturn(Optional.of(user("student@example.com", "hash")));

		assertThatThrownBy(() -> service.register(new AuthRegisterRequest("student@example.com", "correct-password", "Student")))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("already registered");
	}

	@Test
	void rejectsInvalidLoginPassword() {
		when(userAccountRepository.findByEmail("student@example.com")).thenReturn(Optional.of(user("student@example.com", new BCryptPasswordEncoder().encode("correct-password"))));

		assertThatThrownBy(() -> service.login(new AuthLoginRequest("student@example.com", "wrong-password")))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("Invalid email or password");
	}

	private UserAccount user(String email, String passwordHash) {
		OffsetDateTime now = OffsetDateTime.now();
		return new UserAccount(12L, email, passwordHash, "Student", now, now);
	}
}
