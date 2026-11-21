package com.tritagon.studymate.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTests {

	@Mock
	private UserAccountRepository userAccountRepository;

	@Mock
	private AuthSessionRepository authSessionRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Test
	void updatesTrimmedDisplayName() {
		UserAccount user = user(8L, "Original");
		when(userAccountRepository.findById(8L)).thenReturn(Optional.of(user));
		when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

		ProfileResponse result = service().update(8L, new ProfileUpdateRequest("  Study Mate  "));

		assertThat(result.displayName()).isEqualTo("Study Mate");
		assertThat(result.email()).isEqualTo("student@example.com");
	}

	@Test
	void rejectsBlankDisplayName() {
		assertThatThrownBy(() -> service().update(8L, new ProfileUpdateRequest("  ")))
				.isInstanceOf(ResponseStatusException.class)
				.satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
	}

	@Test
	void changesPasswordAndInvalidatesAllSessions() {
		UserAccount user = user(8L, "Original");
		when(userAccountRepository.findById(8L)).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("old-password", "hash")).thenReturn(true);
		when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

		service().changePassword(8L, new ProfilePasswordChangeRequest("old-password", "new-password"));

		verify(userAccountRepository).save(any(UserAccount.class));
		verify(authSessionRepository).deleteByUserId(8L);
	}

	private ProfileService service() {
		return new ProfileService(userAccountRepository, authSessionRepository, passwordEncoder);
	}

	private UserAccount user(Long id, String displayName) {
		OffsetDateTime now = OffsetDateTime.now();
		return new UserAccount(id, "student@example.com", "hash", displayName, now, now);
	}
}
