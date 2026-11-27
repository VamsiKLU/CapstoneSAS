package io.pipelinehub.repository;

import io.pipelinehub.entity.GitHubConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GitHubConnectionRepository extends JpaRepository<GitHubConnection, Long> {

    Optional<GitHubConnection> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
