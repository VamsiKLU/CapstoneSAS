package io.pipelinehub;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.pipelinehub.dto.LoginRequest;
import io.pipelinehub.dto.RegisterRequest;
import io.pipelinehub.entity.GitHubConnection;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.GitHubConnectionRepository;
import io.pipelinehub.repository.UserRepository;
import io.pipelinehub.service.TokenEncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import jakarta.servlet.http.Cookie;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GitHubConnectionRepository gitHubConnectionRepository;

    @Autowired
    private TokenEncryptionService tokenEncryptionService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        gitHubConnectionRepository.deleteAll();
        userRepository.deleteAll();
    }

    private Cookie xsrfCookie(String value) {
        return new Cookie("XSRF-TOKEN", value);
    }

    @Test
    @DisplayName("POST /api/v1/auth/register creates a DEVELOPER account and starts a session")
    void testDeveloperRegistration() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alex Developer");
        req.setEmail("alex@example.com");
        req.setPassword("Password123!");
        req.setConfirmPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .cookie(xsrfCookie("test-csrf-token"))
                        .header("X-XSRF-TOKEN", "test-csrf-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email").value("alex@example.com"))
                .andExpect(jsonPath("$.user.role").value("DEVELOPER"))
                .andExpect(jsonPath("$.user.githubConnected").value(false))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andReturn();

        // Verify session was created
        assertNotNull(result.getRequest().getSession(false));

        // Verify in database
        User saved = userRepository.findByEmail("alex@example.com").orElse(null);
        assertNotNull(saved);
        assertEquals(User.Role.DEVELOPER, saved.getRole());
        assertTrue(passwordEncoder.matches("Password123!", saved.getPasswordHash()));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login authenticates with valid credentials")
    void testLoginSuccess() throws Exception {
        User user = new User();
        user.setName("Sarah Connor");
        user.setEmail("sarah@example.com");
        user.setPasswordHash(passwordEncoder.encode("SecurePass123!"));
        user.setRole(User.Role.DEVELOPER);
        user.setGithubConnected(false);
        userRepository.save(user);

        LoginRequest req = new LoginRequest();
        req.setEmail("sarah@example.com");
        req.setPassword("SecurePass123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .cookie(xsrfCookie("test-csrf-token"))
                        .header("X-XSRF-TOKEN", "test-csrf-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("sarah@example.com"))
                .andExpect(jsonPath("$.user.role").value("DEVELOPER"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login rejects invalid credentials with 401")
    void testLoginFailure() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("nonexistent@example.com");
        req.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .cookie(xsrfCookie("test-csrf-token"))
                        .header("X-XSRF-TOKEN", "test-csrf-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_REQUIRED"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me sets XSRF-TOKEN cookie and returns safe profile without password hash or tokens")
    void testGetMeAuthenticated() throws Exception {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setPasswordHash(passwordEncoder.encode("Pass12345!"));
        user.setRole(User.Role.DEVELOPER);
        user.setGithubConnected(true);
        user.setGithubUserId("123456");
        user.setGithubUsername("johndoe");
        user.setGithubEmail("john@example.com");
        User saved = userRepository.save(user);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", saved.getId());

        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andExpect(jsonPath("$.user.email").value("john@example.com"))
                .andExpect(jsonPath("$.user.githubConnected").value(true))
                .andExpect(jsonPath("$.user.github.username").value("johndoe"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.encryptedAccessToken").doesNotExist())
                .andExpect(jsonPath("$.user.accessToken").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/github/disconnect removes GitHub credentials while preserving user")
    void testDisconnectGitHub() throws Exception {
        User user = new User();
        user.setName("Dev Disconnect");
        user.setEmail("disconnect@example.com");
        user.setPasswordHash(passwordEncoder.encode("Pass12345!"));
        user.setRole(User.Role.DEVELOPER);
        user.setGithubConnected(true);
        user.setGithubUserId("99999");
        user.setGithubUsername("devdisconnect");
        User saved = userRepository.save(user);

        GitHubConnection conn = new GitHubConnection();
        conn.setUser(saved);
        conn.setEncryptedAccessToken(tokenEncryptionService.encrypt("gho_test_token_value"));
        conn.setScopes("read:user,user:email");
        conn.setGithubUserId("99999");
        conn.setGithubUsername("devdisconnect");
        gitHubConnectionRepository.save(conn);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", saved.getId());

        mockMvc.perform(post("/api/v1/auth/github/disconnect")
                        .cookie(xsrfCookie("test-csrf-token"))
                        .header("X-XSRF-TOKEN", "test-csrf-token")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.githubConnected").value(false))
                .andExpect(jsonPath("$.user.github").doesNotExist());

        User updated = userRepository.findById(saved.getId()).orElse(null);
        assertNotNull(updated);
        assertFalse(updated.isGithubConnected());
        assertNull(updated.getGithubUserId());
        assertTrue(gitHubConnectionRepository.findByUserId(saved.getId()).isEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/auth/github/disconnect without CSRF token is rejected with 403")
    void testDisconnectRequiresCsrf() throws Exception {
        User user = new User();
        user.setName("Dev Csrf");
        user.setEmail("csrf@example.com");
        user.setPasswordHash(passwordEncoder.encode("Pass12345!"));
        user.setRole(User.Role.DEVELOPER);
        user.setGithubConnected(true);
        User saved = userRepository.save(user);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", saved.getId());

        mockMvc.perform(post("/api/v1/auth/github/disconnect").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("SPA flow: XSRF-TOKEN cookie from GET /me authorizes POST via X-XSRF-TOKEN header")
    void testSpaCsrfCookieAndHeaderFlow() throws Exception {
        User user = new User();
        user.setName("Dev SpaCsrf");
        user.setEmail("spacsrf@example.com");
        user.setPasswordHash(passwordEncoder.encode("Pass12345!"));
        user.setRole(User.Role.DEVELOPER);
        user.setGithubConnected(true);
        user.setGithubUserId("55555");
        user.setGithubUsername("spacsrf");
        User saved = userRepository.save(user);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", saved.getId());

        MvcResult meResult = mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andReturn();

        Cookie xsrfCookie = meResult.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrfCookie, "XSRF-TOKEN cookie must be set on GET /me");

        mockMvc.perform(post("/api/v1/auth/github/disconnect")
                        .session(session)
                        .cookie(xsrfCookie)
                        .header("X-XSRF-TOKEN", xsrfCookie.getValue()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.githubConnected").value(false));
    }

    @Test
    @DisplayName("DELETE /api/v1/account permanently deletes user, GitHub connection, and clears session")
    void testDeleteAccount() throws Exception {
        User user = new User();
        user.setName("To Delete");
        user.setEmail("todelete@example.com");
        user.setPasswordHash(passwordEncoder.encode("Pass12345!"));
        user.setRole(User.Role.DEVELOPER);
        user.setGithubConnected(true);
        user.setGithubUserId("88888");
        user.setGithubUsername("todelete");
        User saved = userRepository.save(user);

        GitHubConnection conn = new GitHubConnection();
        conn.setUser(saved);
        conn.setEncryptedAccessToken(tokenEncryptionService.encrypt("gho_delete_me"));
        conn.setGithubUserId("88888");
        conn.setGithubUsername("todelete");
        gitHubConnectionRepository.save(conn);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", saved.getId());

        mockMvc.perform(delete("/api/v1/account")
                        .cookie(xsrfCookie("test-csrf-token"))
                        .header("X-XSRF-TOKEN", "test-csrf-token")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        assertFalse(userRepository.findById(saved.getId()).isPresent());
        assertTrue(gitHubConnectionRepository.findByUserId(saved.getId()).isEmpty());
        assertTrue(session.isInvalid());
    }
}
