package com.tritagon.studymate.user;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface UserAccountRepository extends CrudRepository<UserAccount, Long> {

	Optional<UserAccount> findByEmail(String email);
}
