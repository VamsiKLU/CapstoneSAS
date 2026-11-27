package io.pipelinehub;

import io.pipelinehub.entity.User;
import io.pipelinehub.repository.GitHubConnectionRepository;
import io.pipelinehub.repository.UserRepository;
import io.pipelinehub.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:missingkeydb;DB_CLOSE_DELAY=-1;MODE=MySQL",
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
    "github.token-encryption-key=",
    "frontend.url=http://localhost:5173"
})
class MissingEncryptionKeyTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GitHubConnectionRepository gitHubConnectionRepository;

    @Autowired
    private UserService userService;

    private User developer;

    @BeforeEach
    void setUp() {
        gitHubConnectionRepository.deleteAll();
        userRepository.deleteAll();
        User dev = new User();
        dev.setName("Missing Key Dev");
        dev.setEmail("missingkey@example.com");
        dev.setRole(User.Role.DEVELOPER);
        dev.setGithubConnected(false);
        developer = userRepository.save(dev);
    }

    @Test
    @DisplayName("OAuth initiation and token persistence fail safely when encryption key is missing")
    void missingEncryptionKeyBlocksConnectAndPreservesState() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", developer.getId());

        mockMvc.perform(get("/api/v1/auth/github").session(session))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("GITHUB_NOT_CONFIGURED"));

        assertThrows(IllegalStateException.class, () ->
                userService.connectGitHub(
                        developer.getId(), "gho_should_not_persist", "bearer", "read:user,user:email", null,
                        "111", "dev", "Missing Key Dev", "missingkey@example.com", null, null));

        User unchanged = userRepository.findById(developer.getId()).orElseThrow();
        assertFalse(unchanged.isGithubConnected());
        assertTrue(gitHubConnectionRepository.findByUserId(developer.getId()).isEmpty());
    }
}
