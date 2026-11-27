package io.pipelinehub;

import io.pipelinehub.entity.GitHubConnection;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.GitHubConnectionRepository;
import io.pipelinehub.repository.UserRepository;
import io.pipelinehub.service.GitHubService;
import io.pipelinehub.service.TokenEncryptionService;
import io.pipelinehub.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "admin.email=admin@pipelinehub.io",
    "admin.password=AdminPass123!",
    "github.client-id=test-client-id",
    "github.client-secret=test-client-secret",
    "github.callback-url=http://localhost:8080/api/v1/auth/github/callback",
    "github.token-encryption-key=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
    "frontend.url=http://localhost:5173"
})
class GitHubOAuthPersistenceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GitHubConnectionRepository gitHubConnectionRepository;

    @Autowired
    private TokenEncryptionService tokenEncryptionService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private GitHubService gitHubService;

    private User developer;

    @BeforeEach
    void setUp() {
        gitHubConnectionRepository.deleteAll();
        userRepository.deleteAll();

        User dev = new User();
        dev.setName("Alex Dev");
        dev.setEmail("alex@example.com");
        dev.setPasswordHash(passwordEncoder.encode("Password123!"));
        dev.setRole(User.Role.DEVELOPER);
        dev.setGithubConnected(false);
        developer = userRepository.save(dev);

        when(gitHubService.isConfigured()).thenReturn(true);
        when(gitHubService.getClientId()).thenReturn("test-client-id");
        when(gitHubService.getCallbackUrl()).thenReturn("http://localhost:8080/api/v1/auth/github/callback");
    }

    @Test
    @DisplayName("OAuth callback persists encrypted token after email match and never exposes token in /me")
    void callbackPersistsEncryptedTokenOnEmailMatch() throws Exception {
        String rawToken = "gho_super_secret_callback_token_999";
        when(gitHubService.exchangeCodeForToken(eq("auth-code-1"), eq("state-1"), eq("state-1")))
                .thenReturn(new GitHubService.GitHubTokenResult(rawToken, "bearer", "read:user,user:email", null));
        when(gitHubService.fetchUserProfile(rawToken))
                .thenReturn(new GitHubService.GitHubProfile(
                        "424242", "alexdev", "Alex Dev", "Alex@Example.com",
                        "https://avatars.example.com/u/424242", "https://github.com/alexdev"));

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", developer.getId());
        session.setAttribute("oauthState", "state-1");

        mockMvc.perform(get("/api/v1/auth/github/callback")
                        .param("code", "auth-code-1")
                        .param("state", "state-1")
                        .session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://localhost:5173/dashboard"));

        User updatedUser = userRepository.findById(developer.getId()).orElseThrow();
        assertTrue(updatedUser.isGithubConnected());
        assertEquals("alexdev", updatedUser.getGithubUsername());

        GitHubConnection conn = gitHubConnectionRepository.findByUserId(developer.getId()).orElseThrow();
        assertNotEquals(rawToken, conn.getEncryptedAccessToken());
        assertEquals(rawToken, tokenEncryptionService.decrypt(conn.getEncryptedAccessToken()));
        assertEquals("read:user,user:email", conn.getScopes());
        assertEquals(GitHubConnection.ConnectionStatus.ACTIVE, conn.getStatus());
        assertNull(conn.getTokenExpiresAt());

        // Verify /me never leaks encrypted or plaintext token and marks repositoryAccessReady=false for insufficient scope
        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString(rawToken))))
                .andExpect(content().string(not(containsString(conn.getEncryptedAccessToken()))))
                .andExpect(jsonPath("$.user.github.username").value("alexdev"))
                .andExpect(jsonPath("$.user.github.repositoryAccessReady").value(false));

        // Reauthorize with public_repo scope replaces old token and marks repositoryAccessReady=true
        String upgradedToken = "gho_upgraded_public_repo_token_123";
        when(gitHubService.exchangeCodeForToken(eq("auth-code-upgrade"), eq("state-up"), eq("state-up")))
                .thenReturn(new GitHubService.GitHubTokenResult(upgradedToken, "bearer", "public_repo,read:user,user:email", null));
        when(gitHubService.fetchUserProfile(upgradedToken))
                .thenReturn(new GitHubService.GitHubProfile(
                        "424242", "alexdev", "Alex Dev", "alex@example.com",
                        "https://avatars.example.com/u/424242", "https://github.com/alexdev"));

        session.setAttribute("oauthState", "state-up");
        mockMvc.perform(get("/api/v1/auth/github/callback")
                        .param("code", "auth-code-upgrade")
                        .param("state", "state-up")
                        .session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://localhost:5173/dashboard"));

        GitHubConnection upgradedConn = gitHubConnectionRepository.findByUserId(developer.getId()).orElseThrow();
        assertEquals(upgradedToken, tokenEncryptionService.decrypt(upgradedConn.getEncryptedAccessToken()));
        assertEquals("public_repo,read:user,user:email", upgradedConn.getScopes());

        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString(upgradedToken))))
                .andExpect(jsonPath("$.user.github.repositoryAccessReady").value(true));
    }

    @Test
    @DisplayName("OAuth callback rejects mismatched state without persisting connection")
    void oauthStateMismatchRejected() throws Exception {
        when(gitHubService.exchangeCodeForToken(eq("auth-code-bad"), eq("wrong-state"), eq("expected-state")))
                .thenThrow(new IllegalArgumentException("OAuth state mismatch -- possible CSRF attempt"));

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", developer.getId());
        session.setAttribute("oauthState", "expected-state");

        mockMvc.perform(get("/api/v1/auth/github/callback")
                        .param("code", "auth-code-bad")
                        .param("state", "wrong-state")
                        .session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("http://localhost:5173/connect-github?error=GITHUB_AUTH_FAILED*"));

        assertTrue(gitHubConnectionRepository.findByUserId(developer.getId()).isEmpty());
        assertFalse(userRepository.findById(developer.getId()).orElseThrow().isGithubConnected());
    }

    @Test
    @DisplayName("Email mismatch does not create or update a GitHubConnection")
    void emailMismatchDoesNotPersistConnection() throws Exception {
        String rawToken = "gho_mismatched_user_token";
        when(gitHubService.exchangeCodeForToken(eq("auth-code-2"), eq("state-2"), eq("state-2")))
                .thenReturn(new GitHubService.GitHubTokenResult(rawToken, "bearer", "read:user,user:email", null));
        when(gitHubService.fetchUserProfile(rawToken))
                .thenReturn(new GitHubService.GitHubProfile(
                        "777777", "otheruser", "Other User", "different@example.com",
                        "https://avatars.example.com/u/777", "https://github.com/otheruser"));

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", developer.getId());
        session.setAttribute("oauthState", "state-2");

        mockMvc.perform(get("/api/v1/auth/github/callback")
                        .param("code", "auth-code-2")
                        .param("state", "state-2")
                        .session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://localhost:5173/connect-github?error=EMAIL_MISMATCH"));

        User unchanged = userRepository.findById(developer.getId()).orElseThrow();
        assertFalse(unchanged.isGithubConnected());
        assertTrue(gitHubConnectionRepository.findByUserId(developer.getId()).isEmpty());
    }

    @Test
    @DisplayName("Reconnect updates existing connection safely and disconnect removes credentials while preserving user")
    void reconnectAndDisconnectBehavior() throws Exception {
        userService.connectGitHub(
                developer.getId(), "gho_first_token", "bearer", "read:user,user:email", null,
                "424242", "alexdev", "Alex Dev", "alex@example.com", null, null);

        GitHubConnection first = gitHubConnectionRepository.findByUserId(developer.getId()).orElseThrow();
        Long firstId = first.getId();

        // Reconnect with new token updates same connection record
        userService.connectGitHub(
                developer.getId(), "gho_second_token", "bearer", "read:user,user:email", null,
                "424242", "alexdev", "Alex Dev", "alex@example.com", null, null);

        assertEquals(1, gitHubConnectionRepository.count());
        GitHubConnection second = gitHubConnectionRepository.findByUserId(developer.getId()).orElseThrow();
        assertEquals(firstId, second.getId());
        assertEquals("gho_second_token", tokenEncryptionService.decrypt(second.getEncryptedAccessToken()));

        // Disconnect even if remote revocation returns false must still clear local credentials
        when(gitHubService.revokeToken(anyString())).thenReturn(false);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", developer.getId());

        mockMvc.perform(post("/api/v1/auth/github/disconnect")
                        .cookie(new Cookie("XSRF-TOKEN", "test-csrf-token"))
                        .header("X-XSRF-TOKEN", "test-csrf-token")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.githubConnected").value(false));

        verify(gitHubService).revokeToken("gho_second_token");
        assertTrue(gitHubConnectionRepository.findByUserId(developer.getId()).isEmpty());
        assertTrue(userRepository.findById(developer.getId()).isPresent());
    }
}
