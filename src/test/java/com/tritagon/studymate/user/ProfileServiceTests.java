package com.tritagon.studymate.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTests {

	@Mock
	private UserAccountRepository userAccountRepository;

	@Test
	void updatesTrimmedDisplayName() {
		UserAccount user = user(8L, "Original");
		when(userAccountRepository.findById(8L)).thenReturn(Optional.of(user));
		when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

		ProfileResponse result = new ProfileService(userAccountRepository).update(8L, new ProfileUpdateRequest("  Study Mate  "));

		assertThat(result.displayName()).isEqualTo("Study Mate");
		assertThat(result.email()).isEqualTo("student@example.com");
	}

	@Test
	void rejectsBlankDisplayName() {
		assertThatThrownBy(() -> new ProfileService(userAccountRepository).update(8L, new ProfileUpdateRequest("  ")))
				.isInstanceOf(ResponseStatusException.class)
				.satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
	}

	private UserAccount user(Long id, String displayName) {
		OffsetDateTime now = OffsetDateTime.now();
		return new UserAccount(id, "student@example.com", "hash", displayName, now, now);
	}
}
