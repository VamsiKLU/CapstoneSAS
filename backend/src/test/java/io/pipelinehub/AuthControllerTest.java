package io.pipelinehub;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.pipelinehub.dto.LoginRequest;
import io.pipelinehub.dto.RegisterRequest;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.UserRepository;
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
    "frontend.url=http://localhost:5173"
})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
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
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_REQUIRED"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me returns safe profile without password hash")
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
                .andExpect(jsonPath("$.user.email").value("john@example.com"))
                .andExpect(jsonPath("$.user.githubConnected").value(true))
                .andExpect(jsonPath("$.user.github.username").value("johndoe"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/github/disconnect sets githubConnected to false")
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

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", saved.getId());

        mockMvc.perform(post("/api/v1/auth/github/disconnect").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.githubConnected").value(false))
                .andExpect(jsonPath("$.user.github").doesNotExist());

        User updated = userRepository.findById(saved.getId()).orElse(null);
        assertNotNull(updated);
        assertFalse(updated.isGithubConnected());
        assertNull(updated.getGithubUserId());
    }

    @Test
    @DisplayName("DELETE /api/v1/account permanently deletes user and clears session")
    void testDeleteAccount() throws Exception {
        User user = new User();
        user.setName("To Delete");
        user.setEmail("todelete@example.com");
        user.setPasswordHash(passwordEncoder.encode("Pass12345!"));
        user.setRole(User.Role.DEVELOPER);
        user.setGithubConnected(false);
        User saved = userRepository.save(user);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", saved.getId());

        mockMvc.perform(delete("/api/v1/account").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        assertFalse(userRepository.findById(saved.getId()).isPresent());
        assertTrue(session.isInvalid());
    }
}
