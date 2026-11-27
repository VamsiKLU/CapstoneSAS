package io.pipelinehub.repository;

import io.pipelinehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGithubUserId(String githubUserId);

    boolean existsByEmail(String email);

    boolean existsByGithubUserId(String githubUserId);
}
