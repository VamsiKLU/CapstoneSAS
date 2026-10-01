package io.pipelinehub.controller;

import io.pipelinehub.dto.*;
import io.pipelinehub.entity.User;
import io.pipelinehub.service.GitHubService;
import io.pipelinehub.service.UserMapper;
import io.pipelinehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private static final String SESSION_USER_ID = "userId";
    private static final String SESSION_OAUTH_STATE = "oauthState";

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private GitHubService gitHubService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // ------------------------------------------------------------------
    // POST /api/v1/auth/register
    // Developer registration -- role is always DEVELOPER
    // ------------------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request,
                                       HttpServletRequest httpRequest) {
        try {
            User user = userService.registerDeveloper(request);

            // Establish session
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(SESSION_USER_ID, user.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("user", userMapper.toDto(user)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiError("REGISTRATION_FAILED", e.getMessage()));
        } catch (Exception e) {
            log.error("[AuthController] Registration error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("REGISTRATION_FAILED", "Unable to create account. Please try again."));
        }
    }

    // ------------------------------------------------------------------
    // POST /api/v1/auth/login
    // Unified login for both DEVELOPER and ADMIN
    // ------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                    HttpServletRequest httpRequest) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(auth);

            // Establish session
            HttpSession session = httpRequest.getSession(true);
            User user = userService.findByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiError("AUTH_REQUIRED", "Invalid credentials."));
            }
            session.setAttribute(SESSION_USER_ID, user.getId());

            return ResponseEntity.ok(Map.of("user", userMapper.toDto(user)));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Invalid email or password."));
        } catch (Exception e) {
            log.error("[AuthController] Login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("AUTH_REQUIRED", "Authentication failed. Please try again."));
        }
    }

    // ------------------------------------------------------------------
    // GET /api/v1/auth/me
    // Returns the current authenticated user (never exposes password_hash)
    // ------------------------------------------------------------------
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Authentication is required."));
        }
        Long userId = (Long) session.getAttribute(SESSION_USER_ID);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Authentication is required."));
        }
        User user = userService.findById(userId);
        if (user == null) {
            session.invalidate();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Session is no longer valid. Please sign in again."));
        }
        return ResponseEntity.ok(Map.of("user", userMapper.toDto(user)));
    }

    // ------------------------------------------------------------------
    // POST /api/v1/auth/logout
    // Destroys the server-side session
    // ------------------------------------------------------------------
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ------------------------------------------------------------------
    // GET /api/v1/auth/github
    // Initiates GitHub OAuth -- requires the user to be authenticated first
    // ------------------------------------------------------------------
    @GetMapping("/github")
    public ResponseEntity<?> initiateGitHub(HttpServletRequest httpRequest) {
        if (!gitHubService.isConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ApiError("GITHUB_NOT_CONFIGURED",
                            "GitHub authorization is not configured. Please contact the platform administrator."));
        }

        // User must be authenticated
        HttpSession session = httpRequest.getSession(false);
        Long userId = session != null ? (Long) session.getAttribute(SESSION_USER_ID) : null;
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Authentication is required."));
        }

        String state = UUID.randomUUID().toString();
        session.setAttribute(SESSION_OAUTH_STATE, state);

        String authUrl = "https://github.com/login/oauth/authorize"
                + "?client_id=" + gitHubService.getClientId()
                + "&redirect_uri=" + URLEncoder.encode(gitHubService.getCallbackUrl(), StandardCharsets.UTF_8)
                + "&scope=read:user+user:email"
                + "&state=" + state;

        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }

    // ------------------------------------------------------------------
    // GET /api/v1/auth/github/callback
    // GitHub redirects here after authorization
    // ------------------------------------------------------------------
    @GetMapping("/github/callback")
    public void githubCallback(@RequestParam(required = false) String code,
                                @RequestParam(required = false) String state,
                                @RequestParam(required = false) String error,
                                @RequestParam(name = "error_description", required = false) String errorDescription,
                                HttpServletRequest httpRequest,
                                jakarta.servlet.http.HttpServletResponse response) throws IOException {

        if (error != null) {
            String msg = URLEncoder.encode(errorDescription != null ? errorDescription : "GitHub authorization was denied.", StandardCharsets.UTF_8);
            response.sendRedirect(frontendUrl + "/auth/error?reason=" + msg);
            return;
        }

        if (code == null) {
            response.sendRedirect(frontendUrl + "/auth/error?reason=" + URLEncoder.encode("No authorization code received.", StandardCharsets.UTF_8));
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        if (session == null) {
            response.sendRedirect(frontendUrl + "/auth/error?reason=" + URLEncoder.encode("Session expired. Please sign in again.", StandardCharsets.UTF_8));
            return;
        }

        Long userId = (Long) session.getAttribute(SESSION_USER_ID);
        String expectedState = (String) session.getAttribute(SESSION_OAUTH_STATE);
        session.removeAttribute(SESSION_OAUTH_STATE);

        if (userId == null) {
            response.sendRedirect(frontendUrl + "/auth/error?reason=" + URLEncoder.encode("Session expired. Please sign in again.", StandardCharsets.UTF_8));
            return;
        }

        User user = userService.findById(userId);
        if (user == null) {
            response.sendRedirect(frontendUrl + "/auth/error?reason=" + URLEncoder.encode("User account not found.", StandardCharsets.UTF_8));
            return;
        }

        try {
            String accessToken = gitHubService.exchangeCodeForToken(code, state, expectedState);
            GitHubService.GitHubProfile profile = gitHubService.fetchUserProfile(accessToken);

            // Email matching -- backend validates, never trusts client
            String pipelineHubEmail = user.getEmail().toLowerCase().trim();
            String githubEmail = profile.email() != null ? profile.email().toLowerCase().trim() : "";

            if (!pipelineHubEmail.equals(githubEmail)) {
                log.warn("[AuthController] GitHub email mismatch for user {}: ph={} gh={}", userId, pipelineHubEmail, githubEmail);
                response.sendRedirect(frontendUrl + "/connect-github?error=EMAIL_MISMATCH");
                return;
            }

            userService.connectGitHub(userId,
                    profile.id(), profile.username(), profile.name(),
                    profile.email(), profile.avatarUrl(), profile.profileUrl());

            response.sendRedirect(frontendUrl + "/dashboard");

        } catch (Exception e) {
            log.error("[AuthController] GitHub callback error", e);
            String msg = URLEncoder.encode("Unable to complete GitHub authorization. Please try again.", StandardCharsets.UTF_8);
            response.sendRedirect(frontendUrl + "/connect-github?error=GITHUB_AUTH_FAILED&msg=" + msg);
        }
    }

    // ------------------------------------------------------------------
    // POST /api/v1/auth/github/disconnect
    // ------------------------------------------------------------------
    @PostMapping("/github/disconnect")
    public ResponseEntity<?> disconnectGitHub(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Long userId = session != null ? (Long) session.getAttribute(SESSION_USER_ID) : null;
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Authentication is required."));
        }
        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Session is no longer valid. Please sign in again."));
        }
        if (user.getRole() != User.Role.DEVELOPER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiError("FORBIDDEN", "Only developers can manage GitHub connections."));
        }
        userService.disconnectGitHub(userId);
        User updated = userService.findById(userId);
        return ResponseEntity.ok(Map.of("user", userMapper.toDto(updated)));
    }
}
