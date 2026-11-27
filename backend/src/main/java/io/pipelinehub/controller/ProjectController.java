package io.pipelinehub.controller;

import io.pipelinehub.dto.ApiError;
import io.pipelinehub.dto.CreateProjectRequest;
import io.pipelinehub.dto.ProjectDto;
import io.pipelinehub.dto.UpdateProjectRequest;
import io.pipelinehub.entity.User;
import io.pipelinehub.exception.GitHubApiException;
import io.pipelinehub.service.ProjectService;
import io.pipelinehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for Pipeline Hub project CRUD operations.
 * All endpoints require an authenticated Developer session. Ownership is enforced at the service
 * layer; the owner ID is taken from the server-side session, never from request bodies.
 */
@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private static final Logger log = LoggerFactory.getLogger(ProjectController.class);
    private static final String SESSION_USER_ID = "userId";

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> listProjects(HttpServletRequest httpRequest) {
        Long userId = requireDeveloperId(httpRequest);
        try {
            List<ProjectDto> projects = projectService.listProjects(userId);
            return ResponseEntity.ok(Map.of("projects", projects));
        } catch (Exception e) {
            log.error("[ProjectController] listProjects error for user {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("PROJECT_LIST_FAILED", "Unable to load projects. Please try again."));
        }
    }

    @PostMapping
    public ResponseEntity<?> createProject(@Valid @RequestBody CreateProjectRequest request,
                                            HttpServletRequest httpRequest) {
        Long userId = requireDeveloperId(httpRequest);
        try {
            ProjectDto created = projectService.createProject(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("project", created));
        } catch (ProjectService.ProjectConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiError("PROJECT_CONFLICT", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiError("VALIDATION_ERROR", e.getMessage()));
        } catch (Exception e) {
            log.error("[ProjectController] createProject error for user {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("PROJECT_CREATE_FAILED", "Unable to create project. Please try again."));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long userId = requireDeveloperId(httpRequest);
        try {
            ProjectDto project = projectService.getProject(id, userId);
            return ResponseEntity.ok(Map.of("project", project));
        } catch (ProjectService.ProjectNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiError("PROJECT_NOT_FOUND", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id,
                                            @Valid @RequestBody UpdateProjectRequest request,
                                            HttpServletRequest httpRequest) {
        Long userId = requireDeveloperId(httpRequest);
        try {
            ProjectDto updated = projectService.updateProject(id, userId, request);
            return ResponseEntity.ok(Map.of("project", updated));
        } catch (ProjectService.ProjectNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiError("PROJECT_NOT_FOUND", e.getMessage()));
        } catch (ProjectService.ProjectConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiError("PROJECT_CONFLICT", e.getMessage()));
        } catch (Exception e) {
            log.error("[ProjectController] updateProject error for user {}, project {}", userId, id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("PROJECT_UPDATE_FAILED", "Unable to update project. Please try again."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long userId = requireDeveloperId(httpRequest);
        try {
            projectService.deleteProject(id, userId);
            return ResponseEntity.noContent().build();
        } catch (ProjectService.ProjectNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiError("PROJECT_NOT_FOUND", e.getMessage()));
        }
    }

    /**
     * Resolves authenticated Developer userId from the server-side session.
     * Throws 401 AUTH_REQUIRED when unauthenticated and 403 FORBIDDEN for non-Developer roles.
     */
    private Long requireDeveloperId(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Long userId = session != null ? (Long) session.getAttribute(SESSION_USER_ID) : null;
        if (userId == null) {
            throw new GitHubApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED",
                    "Authentication is required to access this resource.");
        }
        User user = userService.findById(userId);
        if (user == null) {
            throw new GitHubApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED",
                    "Session is no longer valid. Please sign in again.");
        }
        if (user.getRole() != User.Role.DEVELOPER) {
            throw new GitHubApiException(HttpStatus.FORBIDDEN, "FORBIDDEN",
                    "Only developer accounts can manage projects.");
        }
        return userId;
    }
}
