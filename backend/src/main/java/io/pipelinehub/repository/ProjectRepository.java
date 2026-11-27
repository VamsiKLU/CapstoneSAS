package io.pipelinehub.repository;

import io.pipelinehub.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /** Returns all projects owned by the given user, ordered newest-first. */
    List<Project> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    /** Finds a project by ID only if the given user is its owner (enforces ownership). */
    Optional<Project> findByIdAndOwnerId(Long id, Long ownerId);

    /** Checks whether a project with the same repo+branch already exists for this owner. */
    boolean existsByOwnerIdAndRepositoryFullNameAndBranch(Long ownerId, String repositoryFullName, String branch);

    /** Deletes all projects owned by the given user (used only on permanent account deletion). */
    void deleteByOwnerId(Long ownerId);
}
