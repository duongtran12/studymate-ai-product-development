package com.tritagon.studymate.user;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface AuthSessionRepository extends CrudRepository<AuthSession, Long> {

	Optional<AuthSession> findByTokenHash(String tokenHash);

	void deleteByTokenHash(String tokenHash);
}
