package io.pipelinehub;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.GitHubConnectionRepository;
import io.pipelinehub.repository.ProjectRepository;
import io.pipelinehub.repository.UserRepository;
import io.pipelinehub.service.UserService;
import jakarta.servlet.http.Cookie;
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

import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:projecttestdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
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
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private GitHubConnectionRepository gitHubConnectionRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User devAlice;
    private User devBob;
    private User adminUser;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
        gitHubConnectionRepository.deleteAll();
        userRepository.deleteAll();

        User a = new User();
        a.setName("Alice Dev");
        a.setEmail("alice@example.com");
        a.setPasswordHash(passwordEncoder.encode("Pass123!"));
        a.setRole(User.Role.DEVELOPER);
        devAlice = userRepository.save(a);

        User b = new User();
        b.setName("Bob Dev");
        b.setEmail("bob@example.com");
        b.setPasswordHash(passwordEncoder.encode("Pass123!"));
        b.setRole(User.Role.DEVELOPER);
        devBob = userRepository.save(b);

        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@pipelinehub.io");
        admin.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        admin.setRole(User.Role.ADMIN);
        adminUser = userRepository.save(admin);
    }

    private Cookie xsrf() {
        return new Cookie("XSRF-TOKEN", "test-csrf");
    }

    @Test
    @DisplayName("Projects API requires Developer session and rejects unauthenticated or Admin callers")
    void accessControlRequiresDeveloper() throws Exception {
        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_REQUIRED"));

        MockHttpSession adminSession = new MockHttpSession();
        adminSession.setAttribute("userId", adminUser.getId());
        mockMvc.perform(get("/api/v1/projects").session(adminSession))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("Developers can create, list, update, and delete only their own projects; client userId ignored")
    void projectOwnershipAndCrudLifecycle() throws Exception {
        MockHttpSession aliceSession = new MockHttpSession();
        aliceSession.setAttribute("userId", devAlice.getId());

        MockHttpSession bobSession = new MockHttpSession();
        bobSession.setAttribute("userId", devBob.getId());

        // Create project for Alice (even if payload attempts to pass bob's id/ownerId, backend ignores it)
        String body = objectMapper.writeValueAsString(Map.of(
                "name", "payments-service",
                "repositoryFullName", "alice/payments-service",
                "repositoryUrl", "https://github.com/alice/payments-service",
                "branch", "main",
                "stack", "Java",
                "pipelineVersion", "v2",
                "ownerId", devBob.getId()
        ));

        MvcResult createdResult = mockMvc.perform(post("/api/v1/projects")
                        .session(aliceSession)
                        .cookie(xsrf())
                        .header("X-XSRF-TOKEN", "test-csrf")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.project.name").value("payments-service"))
                .andExpect(jsonPath("$.project.repositoryFullName").value("alice/payments-service"))
                .andExpect(jsonPath("$.project.branch").value("main"))
                .andExpect(jsonPath("$.project.version").value("v2"))
                .andReturn();

        Long projectId = objectMapper.readTree(createdResult.getResponse().getContentAsString())
                .get("project").get("id").asLong();

        // Alice sees her project
        mockMvc.perform(get("/api/v1/projects").session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projects", hasSize(1)))
                .andExpect(jsonPath("$.projects[0].id").value(projectId));

        // Bob cannot list, get, update, or delete Alice's project
        mockMvc.perform(get("/api/v1/projects").session(bobSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projects", hasSize(0)));

        mockMvc.perform(get("/api/v1/projects/" + projectId).session(bobSession))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/v1/projects/" + projectId)
                        .session(bobSession)
                        .cookie(xsrf())
                        .header("X-XSRF-TOKEN", "test-csrf")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"hijacked\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/projects/" + projectId)
                        .session(bobSession)
                        .cookie(xsrf())
                        .header("X-XSRF-TOKEN", "test-csrf"))
                .andExpect(status().isNotFound());

        // GitHub disconnect & reconnect must NOT delete Alice's projects
        userService.connectGitHub(
                devAlice.getId(), "gho_tok1", "bearer", "read:user,user:email", null,
                "101", "alice", "Alice", "alice@example.com", null, null);
        userService.disconnectGitHub(devAlice.getId());
        mockMvc.perform(get("/api/v1/projects").session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projects", hasSize(1)));

        // Alice updates and deletes her own project
        mockMvc.perform(put("/api/v1/projects/" + projectId)
                        .session(aliceSession)
                        .cookie(xsrf())
                        .header("X-XSRF-TOKEN", "test-csrf")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"payments-v2\",\"pipelineVersion\":\"v3\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.project.name").value("payments-v2"))
                .andExpect(jsonPath("$.project.version").value("v3"));

        // Account deletion cleanly cascades to Alice's projects
        mockMvc.perform(delete("/api/v1/account")
                        .session(aliceSession)
                        .cookie(xsrf())
                        .header("X-XSRF-TOKEN", "test-csrf"))
                .andExpect(status().isOk());
        assertEquals(0, projectRepository.findByOwnerIdOrderByCreatedAtDesc(devAlice.getId()).size());
    }
}
