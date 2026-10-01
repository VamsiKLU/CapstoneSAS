package io.pipelinehub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "admin.email=test-admin@pipelinehub.io",
    "admin.password=TestAdmin123!",
    "github.client-id=Ov23lisRnZ4J0WJR25Gx",
    "github.client-secret=test-secret",
    "github.callback-url=http://localhost:8080/api/v1/auth/github/callback",
    "frontend.url=http://localhost:5173"
})
class OAuthVerificationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RequestMappingHandlerMapping handlerMapping;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private User testDeveloper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User dev = new User();
        dev.setName("Test Developer");
        dev.setEmail("developer@pipelinehub.io");
        dev.setRole(User.Role.DEVELOPER);
        dev.setGithubConnected(false);
        testDeveloper = userRepository.save(dev);
    }

    @Test
    @DisplayName("OAuth initiation requires authenticated session")
    void oauthInitiationRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/auth/github"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Verify exact GitHub OAuth redirect_uri matches Spring Boot callback mapping")
    void verifyExactRedirectUriMatchesCallbackMapping() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", testDeveloper.getId());

        MvcResult result = mockMvc.perform(get("/api/v1/auth/github").session(session))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(responseBody);
        assertTrue(jsonNode.has("authUrl"), "Response must contain authUrl");

        String authUrlStr = jsonNode.get("authUrl").asText();
        URI authUri = URI.create(authUrlStr);

        assertEquals("https", authUri.getScheme());
        assertEquals("github.com", authUri.getHost());
        assertEquals("/login/oauth/authorize", authUri.getPath());

        // Parse query parameters
        Map<String, String> queryParams = new HashMap<>();
        String[] pairs = authUri.getRawQuery().split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
            String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
            queryParams.put(key, value);
        }

        // 1. Verify client_id
        assertEquals("Ov23lisRnZ4J0WJR25Gx", queryParams.get("client_id"));

        // 2. Verify redirect_uri
        String decodedRedirectUri = queryParams.get("redirect_uri");
        assertNotNull(decodedRedirectUri, "redirect_uri must be present in authUrl");

        String expectedCallbackUrl = "http://localhost:8080/api/v1/auth/github/callback";
        assertEquals(expectedCallbackUrl, decodedRedirectUri,
                "Decoded redirect_uri must exactly match authoritative Spring Boot callback URL");

        // 3. Verify scope
        assertTrue(queryParams.get("scope").contains("read:user"));
        assertTrue(queryParams.get("scope").contains("user:email"));

        // 4. Verify state
        String state = queryParams.get("state");
        assertNotNull(state, "state parameter must be present");
        assertEquals(state, session.getAttribute("oauthState"),
                "State in URL must match state stored in session");

        // 5. Verify Spring Boot controller mapping exists for the redirect_uri path
        URI redirectUriObj = URI.create(decodedRedirectUri);
        String callbackPath = redirectUriObj.getPath();
        assertEquals("/api/v1/auth/github/callback", callbackPath);

        boolean hasCallbackMapping = handlerMapping.getHandlerMethods().keySet().stream()
                .anyMatch(info -> info.getDirectPaths().contains(callbackPath)
                        || info.getPatternValues().contains(callbackPath));
        assertTrue(hasCallbackMapping,
                "Spring Boot RequestMappingHandlerMapping must have an active handler for " + callbackPath);
    }
}
