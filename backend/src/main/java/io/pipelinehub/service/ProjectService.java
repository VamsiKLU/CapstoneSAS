package io.pipelinehub.service;

import io.pipelinehub.dto.CreateProjectRequest;
import io.pipelinehub.dto.ProjectDto;
import io.pipelinehub.dto.UpdateProjectRequest;
import io.pipelinehub.entity.Project;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.ProjectRepository;
import io.pipelinehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for Pipeline Hub project management.
 * All operations enforce developer ownership; admin access to developer projects is not permitted.
 */
@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public static class ProjectNotFoundException extends RuntimeException {
        public ProjectNotFoundException(String message) { super(message); }
    }

    public static class ProjectConflictException extends RuntimeException {
        public ProjectConflictException(String message) { super(message); }
    }

    // ----- Queries -----

    /**
     * Returns all projects owned by the given developer, ordered newest-first.
     */
    public List<ProjectDto> listProjects(Long ownerId) {
        return projectRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single project, enforcing that it belongs to the requesting developer.
     */
    public ProjectDto getProject(Long projectId, Long ownerId) {
        Project p = projectRepository.findByIdAndOwnerId(projectId, ownerId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found."));
        return toDto(p);
    }

    // ----- Commands -----

    /**
     * Creates a new project for the given developer.
     * Derives owner/repo from repositoryFullName; never trusts a client-supplied userId.
     */
    @Transactional
    public ProjectDto createProject(Long ownerId, CreateProjectRequest req) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        String[] parts = req.getRepositoryFullName().split("/", 2);
        String repoOwner = parts[0];
        String repoName = parts[1];
        if (".".equals(repoOwner) || "..".equals(repoOwner) || ".".equals(repoName) || "..".equals(repoName)) {
            throw new IllegalArgumentException("Invalid GitHub repository owner or name.");
        }

        String branch = req.getBranch().trim();
        if (branch.isEmpty()) {
            throw new IllegalArgumentException("Branch is required.");
        }

        String canonicalUrl = "https://github.com/" + repoOwner + "/" + repoName;
        String submittedUrl = req.getRepositoryUrl() != null ? req.getRepositoryUrl().trim() : "";
        if (!submittedUrl.isEmpty() && !submittedUrl.startsWith("https://github.com/")) {
            throw new IllegalArgumentException("Repository URL must point to GitHub over HTTPS.");
        }
        String repositoryUrl = submittedUrl.isEmpty() ? canonicalUrl : submittedUrl;

        if (projectRepository.existsByOwnerIdAndRepositoryFullNameAndBranch(
                ownerId, req.getRepositoryFullName(), branch)) {
            throw new ProjectConflictException(
                    "A project for " + req.getRepositoryFullName() + " on branch '" + branch + "' already exists.");
        }

        String resolvedVersion = firstNonBlank(req.getPipelineVersion(), req.getVersion(), "v1");

        Project project = new Project();
        project.setOwner(owner);
        project.setName(req.getName().trim());
        project.setRepositoryFullName(req.getRepositoryFullName());
        project.setRepositoryOwner(repoOwner);
        project.setRepositoryName(repoName);
        project.setRepositoryUrl(repositoryUrl);
        project.setBranch(branch);
        project.setStack(req.getStack() != null ? req.getStack().trim() : null);
        project.setPipelineVersion(resolvedVersion);
        project.setStatus("Registered");

        return toDto(projectRepository.save(project));
    }

    /**
     * Updates mutable project fields (name, branch, stack, pipelineVersion), enforcing ownership.
     */
    @Transactional
    public ProjectDto updateProject(Long projectId, Long ownerId, UpdateProjectRequest req) {
        Project project = projectRepository.findByIdAndOwnerId(projectId, ownerId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found."));

        if (req.getName() != null && !req.getName().isBlank()) {
            project.setName(req.getName().trim());
        }
        if (req.getBranch() != null && !req.getBranch().isBlank()) {
            String nextBranch = req.getBranch().trim();
            if (!nextBranch.equals(project.getBranch())
                    && projectRepository.existsByOwnerIdAndRepositoryFullNameAndBranch(
                            ownerId, project.getRepositoryFullName(), nextBranch)) {
                throw new ProjectConflictException(
                        "A project for " + project.getRepositoryFullName() + " on branch '" + nextBranch + "' already exists.");
            }
            project.setBranch(nextBranch);
        }
        if (req.getStack() != null) {
            project.setStack(req.getStack().trim());
        }
        String nextVersion = firstNonBlank(req.getPipelineVersion(), req.getVersion(), null);
        if (nextVersion != null) {
            project.setPipelineVersion(nextVersion);
        }

        return toDto(projectRepository.save(project));
    }

    /**
     * Deletes a project, enforcing ownership.
     */
    @Transactional
    public void deleteProject(Long projectId, Long ownerId) {
        Project project = projectRepository.findByIdAndOwnerId(projectId, ownerId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found."));
        projectRepository.delete(project);
    }

    // ----- Mapping -----

    private String firstNonBlank(String primary, String secondary, String fallback) {
        if (primary != null && !primary.isBlank()) return primary.trim();
        if (secondary != null && !secondary.isBlank()) return secondary.trim();
        return fallback;
    }

    private ProjectDto toDto(Project p) {
        ProjectDto dto = new ProjectDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setRepositoryFullName(p.getRepositoryFullName());
        dto.setRepositoryOwner(p.getRepositoryOwner());
        dto.setRepositoryName(p.getRepositoryName());
        dto.setRepositoryUrl(p.getRepositoryUrl());
        dto.setBranch(p.getBranch());
        dto.setStack(p.getStack());
        dto.setPipelineVersion(p.getPipelineVersion());
        dto.setVersion(p.getPipelineVersion());
        dto.setStatus(p.getStatus());
        dto.setLastBuild("—");
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}
