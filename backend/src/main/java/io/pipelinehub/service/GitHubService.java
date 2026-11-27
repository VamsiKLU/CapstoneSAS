package io.pipelinehub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * GitHub OAuth service.
 * Exchanges an authorization code for an access token, then fetches the GitHub user identity.
 * All sensitive operations stay server-side; the access token is never sent to the frontend.
 */
@Service
public class GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubService.class);
    private static final String GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_API_URL = "https://api.github.com";

    @Value("${github.client-id:}")
    private String clientId;

    @Value("${github.client-secret:}")
    private String clientSecret;

    @Value("${github.callback-url:}")
    private String callbackUrl;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
    }

    public String getClientId() { return clientId; }
    public String getCallbackUrl() { return callbackUrl; }

    /**
     * Exchange OAuth code for access token. Never returns the token to the frontend.
     */
    public String exchangeCodeForToken(String code, String state, String expectedState) throws IOException {
        if (state == null || !state.equals(expectedState)) {
            throw new IllegalArgumentException("OAuth state mismatch -- possible CSRF attempt");
        }

        RequestBody formBody = new FormBody.Builder()
                .add("client_id", clientId)
                .add("client_secret", clientSecret)
                .add("code", code)
                .add("redirect_uri", callbackUrl)
                .build();

        Request request = new Request.Builder()
                .url(GITHUB_TOKEN_URL)
                .addHeader("Accept", "application/json")
                .post(formBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("GitHub token exchange failed: HTTP " + response.code());
            }
            String body = response.body().string();
            JsonNode json = objectMapper.readTree(body);

            if (json.has("error")) {
                String error = json.get("error").asText();
                String desc = json.has("error_description") ? json.get("error_description").asText() : error;
                throw new IOException("GitHub token exchange error: " + desc);
            }

            String token = json.has("access_token") ? json.get("access_token").asText() : null;
            if (token == null || token.isBlank()) {
                throw new IOException("No access token in GitHub response");
            }
            return token;
        }
    }

    /**
     * Fetch the GitHub user profile and primary verified email.
     */
    public GitHubProfile fetchUserProfile(String accessToken) throws IOException {
        // Fetch user profile
        Request userRequest = new Request.Builder()
                .url(GITHUB_API_URL + "/user")
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Accept", "application/vnd.github+json")
                .addHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();

        JsonNode userJson;
        try (Response response = httpClient.newCall(userRequest).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("GitHub user fetch failed: HTTP " + response.code());
            }
            userJson = objectMapper.readTree(response.body().string());
        }

        String email = userJson.has("email") && !userJson.get("email").isNull()
                ? userJson.get("email").asText() : null;

        // If email not public, fetch from emails endpoint
        if (email == null || email.isBlank()) {
            email = fetchPrimaryEmail(accessToken);
        }

        return new GitHubProfile(
                String.valueOf(userJson.get("id").asLong()),
                userJson.get("login").asText(),
                userJson.has("name") && !userJson.get("name").isNull() ? userJson.get("name").asText() : userJson.get("login").asText(),
                email,
                userJson.has("avatar_url") ? userJson.get("avatar_url").asText() : null,
                userJson.has("html_url") ? userJson.get("html_url").asText() : null
        );
    }

    private String fetchPrimaryEmail(String accessToken) {
        try {
            Request emailRequest = new Request.Builder()
                    .url(GITHUB_API_URL + "/user/emails")
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .addHeader("Accept", "application/vnd.github+json")
                    .addHeader("X-GitHub-Api-Version", "2022-11-28")
                    .build();

            try (Response response = httpClient.newCall(emailRequest).execute()) {
                if (!response.isSuccessful()) return null;
                JsonNode emails = objectMapper.readTree(response.body().string());
                for (JsonNode emailNode : emails) {
                    if (emailNode.has("primary") && emailNode.get("primary").asBoolean()
                            && emailNode.has("verified") && emailNode.get("verified").asBoolean()) {
                        return emailNode.get("email").asText();
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[GitHubService] Could not fetch email list: {}", e.getMessage());
        }
        return null;
    }

    public record GitHubProfile(
            String id,
            String username,
            String name,
            String email,
            String avatarUrl,
            String profileUrl
    ) {}
}
