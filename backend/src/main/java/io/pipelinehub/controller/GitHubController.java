package io.pipelinehub.controller;

import io.pipelinehub.dto.GitHubBranchPageDto;
import io.pipelinehub.dto.GitHubRepoPageDto;
import io.pipelinehub.entity.GitHubConnection;
import io.pipelinehub.entity.User;
import io.pipelinehub.exception.GitHubApiException;
import io.pipelinehub.service.GitHubService;
import io.pipelinehub.service.TokenEncryptionService;
import io.pipelinehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Read-only GitHub repository and branch browsing endpoints for connected developers.
 */
@RestController
@RequestMapping("/api/v1/github")
public class GitHubController {

    private static final String SESSION_USER_ID = "userId";

    @Autowired
    private UserService userService;

    @Autowired
    private TokenEncryptionService tokenEncryptionService;

    @Autowired
    private GitHubService gitHubService;

    @GetMapping("/repos")
    public ResponseEntity<?> listRepositories(@RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "30") int perPage,
                                              HttpServletRequest httpRequest) {
        DeveloperTokenContext ctx = requireActiveDeveloperToken(httpRequest);
        try {
            GitHubRepoPageDto result = gitHubService.listPublicRepositories(ctx.accessToken(), page, perPage);
            return ResponseEntity.ok(result);
        } catch (GitHubApiException e) {
            if ("GITHUB_REAUTH_REQUIRED".equals(e.getCode())) {
                userService.markGitHubReauthRequired(ctx.userId());
            }
            throw e;
        }
    }

    @GetMapping("/repos/{owner}/{repo}/branches")
    public ResponseEntity<?> listBranches(@PathVariable String owner,
                                          @PathVariable String repo,
                                          @RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "30") int perPage,
                                          HttpServletRequest httpRequest) {
        DeveloperTokenContext ctx = requireActiveDeveloperToken(httpRequest);
        try {
            GitHubBranchPageDto result = gitHubService.listBranches(ctx.accessToken(), owner, repo, page, perPage);
            return ResponseEntity.ok(result);
        } catch (GitHubApiException e) {
            if ("GITHUB_REAUTH_REQUIRED".equals(e.getCode())) {
                userService.markGitHubReauthRequired(ctx.userId());
            }
            throw e;
        }
    }

    private DeveloperTokenContext requireActiveDeveloperToken(HttpServletRequest httpRequest) {
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
                    "Only developer accounts can access GitHub repository integration.");
        }

        GitHubConnection connection = userService.findActiveGitHubConnection(userId);
        if (!user.isGithubConnected() || connection == null) {
            throw new GitHubApiException(HttpStatus.FORBIDDEN, "GITHUB_NOT_CONNECTED",
                    "Connect your GitHub account to continue.");
        }

        // Only reject locally when scope metadata was actually recorded and lacks repository access.
        // If GitHub did not return scope metadata, proceed to probe GitHub and classify the live response.
        String recordedScopes = connection.getScopes();
        if (recordedScopes != null && !recordedScopes.isBlank()
                && !GitHubService.hasRepositoryScope(recordedScopes)) {
            throw new GitHubApiException(HttpStatus.FORBIDDEN, "GITHUB_SCOPE_INSUFFICIENT",
                    "Reconnect your GitHub account to grant public repository access.");
        }

        try {
            String rawToken = tokenEncryptionService.decrypt(connection.getEncryptedAccessToken());
            return new DeveloperTokenContext(userId, rawToken);
        } catch (Exception e) {
            userService.markGitHubReauthRequired(userId);
            throw new GitHubApiException(HttpStatus.UNAUTHORIZED, "GITHUB_REAUTH_REQUIRED",
                    "Your GitHub authorization could not be validated. Reconnect your GitHub account to continue.");
        }
    }

    private record DeveloperTokenContext(Long userId, String accessToken) {}
}
