package io.pipelinehub;

import io.pipelinehub.entity.GitHubConnection;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.GitHubConnectionRepository;
import io.pipelinehub.repository.UserRepository;
import io.pipelinehub.service.GitHubService;
import io.pipelinehub.service.UserService;
import okhttp3.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:githubrepotestdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
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
class GitHubRepositoryIntegrationTest {

    @FunctionalInterface
    interface MockResponder {
        Response respond(Request request) throws IOException;
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GitHubConnectionRepository gitHubConnectionRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GitHubService gitHubService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final AtomicReference<MockResponder> nextResponder = new AtomicReference<>();
    private final AtomicInteger upstreamCallCount = new AtomicInteger(0);
    private final AtomicReference<String> lastAuthHeader = new AtomicReference<>();
    private final AtomicReference<String> lastRequestUrl = new AtomicReference<>();

    private User connectedDeveloper;
    private User disconnectedDeveloper;
    private User adminUser;
    private static final String RAW_TOKEN = "gho_test_repo_access_token_xyz";
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    @BeforeEach
    void setUp() {
        upstreamCallCount.set(0);
        lastAuthHeader.set(null);
        lastRequestUrl.set(null);
        nextResponder.set(null);

        OkHttpClient mockClient = new OkHttpClient.Builder()
                .addInterceptor(chain -> {
                    Request req = chain.request();
                    upstreamCallCount.incrementAndGet();
                    lastAuthHeader.set(req.header("Authorization"));
                    lastRequestUrl.set(req.url().toString());
                    MockResponder responder = nextResponder.get();
                    if (responder == null) {
                        return buildResponse(req, 404, "{\"message\":\"Not Found\"}", null, null);
                    }
                    return responder.respond(req);
                })
                .build();
        gitHubService.setHttpClient(mockClient);

        gitHubConnectionRepository.deleteAll();
        userRepository.deleteAll();

        User dev = new User();
        dev.setName("Connected Dev");
        dev.setEmail("connected@example.com");
        dev.setPasswordHash(passwordEncoder.encode("Password123!"));
        dev.setRole(User.Role.DEVELOPER);
        dev.setGithubConnected(false);
        connectedDeveloper = userRepository.save(dev);
        connectedDeveloper = userService.connectGitHub(
                connectedDeveloper.getId(), RAW_TOKEN, "bearer", "read:user,user:email,public_repo", null,
                "1001", "octodev", "Connected Dev", "connected@example.com", null, null);

        User disc = new User();
        disc.setName("Disconnected Dev");
        disc.setEmail("disconnected@example.com");
        disc.setPasswordHash(passwordEncoder.encode("Password123!"));
        disc.setRole(User.Role.DEVELOPER);
        disc.setGithubConnected(false);
        disconnectedDeveloper = userRepository.save(disc);

        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin-test@pipelinehub.io");
        admin.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        admin.setRole(User.Role.ADMIN);
        admin.setGithubConnected(false);
        adminUser = userRepository.save(admin);
    }

    private Response buildResponse(Request req, int code, String body, String headerName, String headerValue) {
        Response.Builder builder = new Response.Builder()
                .request(req)
                .protocol(Protocol.HTTP_1_1)
                .code(code)
                .message("Mock")
                .body(ResponseBody.create(body, JSON));
        if (headerName != null && headerValue != null) {
            builder.addHeader(headerName, headerValue);
        }
        return builder.build();
    }

    @Test
    @DisplayName("Unauthenticated repository and branch requests are rejected with 401")
    void unauthenticatedRequestsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/github/repos"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_REQUIRED"));

        mockMvc.perform(get("/api/v1/github/repos/octodev/sample-repo/branches"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_REQUIRED"));
    }

    @Test
    @DisplayName("Admin cannot access developer GitHub repository endpoints")
    void adminCannotAccessDeveloperTokenOrRepos() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", adminUser.getId());

        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        assertEquals(0, upstreamCallCount.get());
    }

    @Test
    @DisplayName("Disconnected developer receives GITHUB_NOT_CONNECTED error")
    void disconnectedDeveloperRejected() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", disconnectedDeveloper.getId());

        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GITHUB_NOT_CONNECTED"));
        assertEquals(0, upstreamCallCount.get());
    }

    @Test
    @DisplayName("Developer with only read:user user:email scope is prompted to reconnect for public_repo")
    void insufficientScopeRejected() throws Exception {
        userService.connectGitHub(
                disconnectedDeveloper.getId(), "gho_limited_scope", "bearer", "read:user,user:email", null,
                "1002", "limiteddev", "Limited Dev", "disconnected@example.com", null, null);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", disconnectedDeveloper.getId());

        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GITHUB_SCOPE_INSUFFICIENT"));
        assertEquals(0, upstreamCallCount.get());
    }

    @Test
    @DisplayName("When stored scopes are absent, live X-OAuth-Scopes header lacking public_repo triggers GITHUB_SCOPE_INSUFFICIENT")
    void probeDetectsMissingPublicRepoFromLiveHeaders() throws Exception {
        userService.connectGitHub(
                disconnectedDeveloper.getId(), "gho_unknown_scope", "bearer", null, null,
                "1002", "limiteddev", "Limited Dev", "disconnected@example.com", null, null);

        nextResponder.set(req -> buildResponse(req, 200, "[]", "X-OAuth-Scopes", "read:user, user:email"));

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", disconnectedDeveloper.getId());

        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GITHUB_SCOPE_INSUFFICIENT"));
        assertEquals(1, upstreamCallCount.get());
    }

    @Test
    @DisplayName("GET /api/v1/github/repos handles pagination, filters private repos, maps safe DTOs, and never exposes token")
    void listRepositoriesWithPagination() throws Exception {
        String repoJson = """
                [
                  {
                    "id": 9001,
                    "name": "pipeline-demo",
                    "full_name": "octodev/pipeline-demo",
                    "owner": {"login": "octodev"},
                    "description": "Reusable CI steps",
                    "private": false,
                    "visibility": "public",
                    "language": "Java",
                    "default_branch": "main",
                    "html_url": "https://github.com/octodev/pipeline-demo",
                    "archived": false,
                    "updated_at": "2026-10-01T00:00:00Z"
                  },
                  {
                    "id": 9002,
                    "name": "secret-private",
                    "full_name": "octodev/secret-private",
                    "owner": {"login": "octodev"},
                    "private": true,
                    "visibility": "private",
                    "default_branch": "main",
                    "html_url": "https://github.com/octodev/secret-private",
                    "archived": false
                  }
                ]
                """;
        String linkHeader = "<https://api.github.com/user/repos?page=2&per_page=10>; rel=\"next\"";
        nextResponder.set(req -> buildResponse(req, 200, repoJson, "Link", linkHeader));

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", connectedDeveloper.getId());

        mockMvc.perform(get("/api/v1/github/repos?page=1&perPage=10").session(session))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString(RAW_TOKEN))))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.perPage").value(10))
                .andExpect(jsonPath("$.hasNextPage").value(true))
                .andExpect(jsonPath("$.nextPage").value(2))
                .andExpect(jsonPath("$.hasPrevPage").value(false))
                .andExpect(jsonPath("$.repositories.length()").value(1))
                .andExpect(jsonPath("$.repositories[0].id").value(9001))
                .andExpect(jsonPath("$.repositories[0].fullName").value("octodev/pipeline-demo"))
                .andExpect(jsonPath("$.repositories[0].ownerLogin").value("octodev"))
                .andExpect(jsonPath("$.repositories[0].visibility").value("public"))
                .andExpect(jsonPath("$.repositories[0].language").value("Java"))
                .andExpect(jsonPath("$.repositories[0].defaultBranch").value("main"));

        assertEquals("Bearer " + RAW_TOKEN, lastAuthHeader.get());
        assertTrue(lastRequestUrl.get().contains("visibility=public"));
        assertTrue(lastRequestUrl.get().contains("page=1"));
        assertTrue(lastRequestUrl.get().contains("per_page=10"));
    }

    @Test
    @DisplayName("GET /api/v1/github/repos returns 200 with empty list when developer has no public repositories")
    void emptyPublicRepositoryListReturns200() throws Exception {
        nextResponder.set(req -> buildResponse(req, 200, "[]", "X-OAuth-Scopes", "public_repo, read:user"));

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", connectedDeveloper.getId());

        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.repositories.length()").value(0))
                .andExpect(jsonPath("$.hasNextPage").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/github/repos/{owner}/{repo}/branches verifies public visibility, validates inputs, and returns branches")
    void listBranchesAndValidateInputs() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", connectedDeveloper.getId());

        mockMvc.perform(get("/api/v1/github/repos/../branches").session(session))
                .andExpect(status().is4xxClientError());
        mockMvc.perform(get("/api/v1/github/repos/octodev/invalid$repo/branches").session(session))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
        assertEquals(0, upstreamCallCount.get());

        String repoMetaJson = """
                {"id": 9001, "name": "pipeline-demo", "private": false, "visibility": "public", "default_branch": "main"}
                """;
        String branchJson = """
                [
                  {"name": "main", "protected": true},
                  {"name": "develop"}
                ]
                """;
        nextResponder.set(req -> {
            if (req.url().encodedPath().endsWith("/branches")) {
                return buildResponse(req, 200, branchJson, null, null);
            }
            return buildResponse(req, 200, repoMetaJson, null, null);
        });

        mockMvc.perform(get("/api/v1/github/repos/octodev/pipeline-demo/branches").session(session))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString(RAW_TOKEN))))
                .andExpect(jsonPath("$.branches.length()").value(2))
                .andExpect(jsonPath("$.branches[0].name").value("main"))
                .andExpect(jsonPath("$.branches[0].protected").value(true))
                .andExpect(jsonPath("$.branches[0].default").value(true))
                .andExpect(jsonPath("$.branches[1].name").value("develop"))
                .andExpect(jsonPath("$.branches[1].default").value(false))
                .andExpect(jsonPath("$.branches[1].protected").doesNotExist());
    }

    @Test
    @DisplayName("Branch listing rejects private repositories with 403 GITHUB_PRIVATE_REPO_FORBIDDEN")
    void branchListingRejectsPrivateRepo() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", connectedDeveloper.getId());

        nextResponder.set(req -> buildResponse(
                req, 200, "{\"id\": 9002, \"name\": \"secret\", \"private\": true, \"visibility\": \"private\"}", null, null));

        mockMvc.perform(get("/api/v1/github/repos/octodev/secret/branches").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GITHUB_PRIVATE_REPO_FORBIDDEN"));
        assertEquals(1, upstreamCallCount.get());
    }

    @Test
    @DisplayName("GitHub 401, 403/rate-limit, 404, 5xx, timeout, and malformed JSON responses are mapped safely")
    void upstreamErrorMappings() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", connectedDeveloper.getId());

        // 403 rate limit
        nextResponder.set(req -> buildResponse(req, 403, "{\"message\":\"API rate limit exceeded\"}", "X-RateLimit-Remaining", "0"));
        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("GITHUB_RATE_LIMIT"));

        // 403 insufficient scope from upstream header
        nextResponder.set(req -> buildResponse(req, 403, "{\"message\":\"Resource not accessible\"}", "X-OAuth-Scopes", "read:user, user:email"));
        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GITHUB_SCOPE_INSUFFICIENT"));

        // 403 forbidden (non-rate-limit, no scope header)
        nextResponder.set(req -> buildResponse(req, 403, "{\"message\":\"Resource not accessible\"}", "X-RateLimit-Remaining", "4999"));
        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GITHUB_FORBIDDEN"));

        // 404 not found
        nextResponder.set(req -> buildResponse(req, 404, "{\"message\":\"Not Found\"}", null, null));
        mockMvc.perform(get("/api/v1/github/repos/octodev/missing-repo/branches").session(session))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("GITHUB_NOT_FOUND"));

        // 503 GitHub 5xx -> 502 GITHUB_UNAVAILABLE
        nextResponder.set(req -> buildResponse(req, 503, "{\"message\":\"Service Unavailable\"}", null, null));
        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.code").value("GITHUB_UNAVAILABLE"));

        // SocketTimeoutException -> 504 GITHUB_TIMEOUT
        nextResponder.set(req -> {
            throw new SocketTimeoutException("Simulated read timeout");
        });
        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isGatewayTimeout())
                .andExpect(jsonPath("$.code").value("GITHUB_TIMEOUT"));

        // Malformed JSON
        nextResponder.set(req -> buildResponse(req, 200, "{not-json", null, null));
        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.code").value("GITHUB_INVALID_RESPONSE"));

        // Network IOException
        nextResponder.set(req -> {
            throw new IOException("Simulated network failure");
        });
        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.code").value("GITHUB_UNAVAILABLE"));

        // 401 revoked token marks connection REAUTH_REQUIRED without deleting user
        nextResponder.set(req -> buildResponse(req, 401, "{\"message\":\"Bad credentials\"}", null, null));
        mockMvc.perform(get("/api/v1/github/repos").session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("GITHUB_REAUTH_REQUIRED"));

        User after401 = userRepository.findById(connectedDeveloper.getId()).orElseThrow();
        assertFalse(after401.isGithubConnected());
        GitHubConnection connAfter401 = gitHubConnectionRepository.findByUserId(connectedDeveloper.getId()).orElseThrow();
        assertEquals(GitHubConnection.ConnectionStatus.REAUTH_REQUIRED, connAfter401.getStatus());
    }
}
