package io.pipelinehub.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.pipelinehub.dto.GitHubBranchDto;
import io.pipelinehub.dto.GitHubBranchPageDto;
import io.pipelinehub.dto.GitHubRepoDto;
import io.pipelinehub.dto.GitHubRepoPageDto;
import io.pipelinehub.exception.GitHubApiException;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * GitHub OAuth and read-only repository integration service.
 * All sensitive operations stay server-side; access tokens are never sent to the frontend.
 */
@Service
public class GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubService.class);
    private static final String GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String DEFAULT_GITHUB_API_URL = "https://api.github.com";
    private static final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");
    private static final Pattern SAFE_IDENTIFIER_PATTERN = Pattern.compile("^[A-Za-z0-9._-]{1,100}$");
    private static final Pattern LINK_HEADER_PATTERN = Pattern.compile("<([^>]+)>;\\s*rel=\"([^\"]+)\"");
    private static final Pattern PAGE_QUERY_PATTERN = Pattern.compile("[?&]page=(\\d+)");

    @Value("${github.client-id:}")
    private String clientId;

    @Value("${github.client-secret:}")
    private String clientSecret;

    @Value("${github.callback-url:}")
    private String callbackUrl;

    @Value("${github.api-url:" + DEFAULT_GITHUB_API_URL + "}")
    private String githubApiUrl;

    private volatile OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Allows integration tests to supply an OkHttpClient with a mock Interceptor.
     */
    public void setHttpClient(OkHttpClient httpClient) {
        if (httpClient != null) {
            this.httpClient = httpClient;
        }
    }

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
    }

    public String getClientId() { return clientId; }
    public String getCallbackUrl() { return callbackUrl; }

    /**
     * Returns true when a comma/space-delimited GitHub OAuth scope header or string
     * explicitly grants repository access ({@code public_repo} or {@code repo}).
     */
    public static boolean hasRepositoryScope(String scopes) {
        if (scopes == null || scopes.isBlank()) {
            return false;
        }
        Set<String> granted = Arrays.stream(scopes.split("[,\\s]+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
        return granted.contains("public_repo") || granted.contains("repo");
    }

    /**
     * Exchange OAuth code for access token and metadata. Never returns the token to the frontend.
     */
    public GitHubTokenResult exchangeCodeForToken(String code, String state, String expectedState) throws IOException {
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
                .addHeader("User-Agent", "PipelineHub")
                .post(formBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful() || response.body() == null) {
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
            String tokenType = json.has("token_type") && !json.get("token_type").isNull()
                    ? json.get("token_type").asText() : null;
            String scope = json.has("scope") && !json.get("scope").isNull()
                    ? json.get("scope").asText() : null;
            Instant expiresAt = null;
            if (json.has("expires_in") && json.get("expires_in").isNumber()) {
                long expiresIn = json.get("expires_in").asLong();
                if (expiresIn > 0) {
                    expiresAt = Instant.now().plusSeconds(expiresIn);
                }
            }
            return new GitHubTokenResult(token, tokenType, scope, expiresAt);
        }
    }

    /**
     * Best-effort revocation of an OAuth token via GitHub's OAuth application token API.
     * Returns true if GitHub acknowledged revocation; never logs credentials.
     */
    public boolean revokeToken(String accessToken) {
        if (!isConfigured() || accessToken == null || accessToken.isBlank()) {
            return false;
        }
        try {
            String payload = objectMapper.writeValueAsString(Map.of("access_token", accessToken));
            RequestBody body = RequestBody.create(payload, JSON_MEDIA_TYPE);
            Request request = new Request.Builder()
                    .url(apiBaseUrl() + "/applications/" + clientId + "/token")
                    .addHeader("Authorization", Credentials.basic(clientId, clientSecret))
                    .addHeader("Accept", "application/vnd.github+json")
                    .addHeader("X-GitHub-Api-Version", "2022-11-28")
                    .addHeader("User-Agent", "PipelineHub")
                    .delete(body)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.code() == 204 || response.isSuccessful()) {
                    return true;
                }
                log.warn("[GitHubService] GitHub token revocation returned HTTP {}", response.code());
                return false;
            }
        } catch (Exception e) {
            log.warn("[GitHubService] Best-effort GitHub token revocation failed");
            return false;
        }
    }

    /**
     * Fetch the GitHub user profile and primary verified email.
     */
    public GitHubProfile fetchUserProfile(String accessToken) throws IOException {
        Request userRequest = new Request.Builder()
                .url(apiBaseUrl() + "/user")
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Accept", "application/vnd.github+json")
                .addHeader("X-GitHub-Api-Version", "2022-11-28")
                .addHeader("User-Agent", "PipelineHub")
                .build();

        JsonNode userJson;
        try (Response response = httpClient.newCall(userRequest).execute()) {
            if (!response.isSuccessful() || response.body() == null) {
                throw new IOException("GitHub user fetch failed: HTTP " + response.code());
            }
            userJson = objectMapper.readTree(response.body().string());
        }

        String email = userJson.has("email") && !userJson.get("email").isNull()
                ? userJson.get("email").asText() : null;

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

    /**
     * Lists public repositories accessible to the connected developer with pagination metadata.
     * Private repositories are excluded both via GitHub API query parameters and server-side filtering.
     */
    public GitHubRepoPageDto listPublicRepositories(String accessToken, int page, int perPage) {
        int safePage = Math.max(1, page);
        int safePerPage = Math.max(1, Math.min(100, perPage));

        HttpUrl url = baseUrlBuilder()
                .addPathSegment("user")
                .addPathSegment("repos")
                .addQueryParameter("visibility", "public")
                .addQueryParameter("affiliation", "owner,collaborator,organization_member")
                .addQueryParameter("sort", "updated")
                .addQueryParameter("page", String.valueOf(safePage))
                .addQueryParameter("per_page", String.valueOf(safePerPage))
                .build();

        GitHubApiResult result = executeGitHubGet(url, accessToken);

        // If GitHub explicitly returned X-OAuth-Scopes without public_repo/repo, fail clearly
        // instead of returning an empty or incomplete repository list.
        if (result.oauthScopes() != null && !hasRepositoryScope(result.oauthScopes())) {
            throw new GitHubApiException(HttpStatus.FORBIDDEN, "GITHUB_SCOPE_INSUFFICIENT",
                    "Reconnect your GitHub account to grant public repository access.");
        }

        if (!result.body().isArray()) {
            throw new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_INVALID_RESPONSE",
                    "Received an unexpected repository payload from GitHub.");
        }

        List<GitHubRepoDto> repos = new ArrayList<>();
        for (JsonNode node : result.body()) {
            if (isPrivateOrNonPublic(node)) {
                continue;
            }
            GitHubRepoDto dto = new GitHubRepoDto();
            dto.setId(node.hasNonNull("id") ? node.get("id").asLong() : null);
            dto.setName(textOrNull(node, "name"));
            dto.setFullName(textOrNull(node, "full_name"));
            dto.setOwnerLogin(node.hasNonNull("owner") ? textOrNull(node.get("owner"), "login") : null);
            dto.setDescription(textOrNull(node, "description"));
            dto.setHtmlUrl(textOrNull(node, "html_url"));
            dto.setDefaultBranch(textOrNull(node, "default_branch"));
            dto.setLanguage(textOrNull(node, "language"));
            dto.setUpdatedAt(textOrNull(node, "updated_at"));
            dto.setArchived(node.has("archived") && node.get("archived").asBoolean(false));
            dto.setVisibility("public");
            if (dto.getName() == null || dto.getOwnerLogin() == null) {
                throw new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_INVALID_RESPONSE",
                        "Received an incomplete repository record from GitHub.");
            }
            repos.add(dto);
        }

        PaginationMeta pagination = parseLinkPagination(result.linkHeader(), safePage);
        GitHubRepoPageDto pageDto = new GitHubRepoPageDto();
        pageDto.setRepositories(repos);
        pageDto.setPage(safePage);
        pageDto.setPerPage(safePerPage);
        pageDto.setHasNextPage(pagination.nextPage() != null);
        pageDto.setHasPrevPage(pagination.prevPage() != null || safePage > 1);
        pageDto.setNextPage(pagination.nextPage());
        pageDto.setPrevPage(pagination.prevPage() != null ? pagination.prevPage() : (safePage > 1 ? safePage - 1 : null));
        return pageDto;
    }

    /**
     * Verifies that the selected repository is public and lists its branches with pagination metadata.
     */
    public GitHubBranchPageDto listBranches(String accessToken, String owner, String repo, int page, int perPage) {
        validateRepoIdentifier(owner, "owner");
        validateRepoIdentifier(repo, "repo");

        int safePage = Math.max(1, page);
        int safePerPage = Math.max(1, Math.min(100, perPage));

        // Verify selected repository is public and accessible before fetching branches
        HttpUrl repoUrl = baseUrlBuilder()
                .addPathSegment("repos")
                .addPathSegment(owner)
                .addPathSegment(repo)
                .build();
        GitHubApiResult repoResult = executeGitHubGet(repoUrl, accessToken);
        if (!repoResult.body().isObject()) {
            throw new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_INVALID_RESPONSE",
                    "Received an unexpected repository payload from GitHub.");
        }
        if (isPrivateOrNonPublic(repoResult.body())) {
            throw new GitHubApiException(HttpStatus.FORBIDDEN, "GITHUB_PRIVATE_REPO_FORBIDDEN",
                    "Only public GitHub repositories are supported.");
        }
        String defaultBranch = textOrNull(repoResult.body(), "default_branch");

        HttpUrl branchesUrl = baseUrlBuilder()
                .addPathSegment("repos")
                .addPathSegment(owner)
                .addPathSegment(repo)
                .addPathSegment("branches")
                .addQueryParameter("page", String.valueOf(safePage))
                .addQueryParameter("per_page", String.valueOf(safePerPage))
                .build();

        GitHubApiResult result = executeGitHubGet(branchesUrl, accessToken);
        if (!result.body().isArray()) {
            throw new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_INVALID_RESPONSE",
                    "Received an unexpected branch payload from GitHub.");
        }

        List<GitHubBranchDto> branches = new ArrayList<>();
        for (JsonNode node : result.body()) {
            String branchName = textOrNull(node, "name");
            if (branchName == null) {
                throw new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_INVALID_RESPONSE",
                        "Received an incomplete branch record from GitHub.");
            }
            GitHubBranchDto dto = new GitHubBranchDto();
            dto.setName(branchName);
            if (node.has("protected") && node.get("protected").isBoolean()) {
                dto.setIsProtected(node.get("protected").asBoolean());
            }
            if (defaultBranch != null) {
                dto.setDefaultBranch(defaultBranch.equals(branchName));
            }
            branches.add(dto);
        }

        PaginationMeta pagination = parseLinkPagination(result.linkHeader(), safePage);
        GitHubBranchPageDto pageDto = new GitHubBranchPageDto();
        pageDto.setBranches(branches);
        pageDto.setPage(safePage);
        pageDto.setPerPage(safePerPage);
        pageDto.setHasNextPage(pagination.nextPage() != null);
        pageDto.setHasPrevPage(pagination.prevPage() != null || safePage > 1);
        pageDto.setNextPage(pagination.nextPage());
        pageDto.setPrevPage(pagination.prevPage() != null ? pagination.prevPage() : (safePage > 1 ? safePage - 1 : null));
        return pageDto;
    }

    private boolean isPrivateOrNonPublic(JsonNode repoNode) {
        if (repoNode.has("private") && repoNode.get("private").asBoolean(false)) {
            return true;
        }
        String visibility = textOrNull(repoNode, "visibility");
        return visibility != null && !"public".equalsIgnoreCase(visibility);
    }

    private GitHubApiResult executeGitHubGet(HttpUrl url, String accessToken) {
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Accept", "application/vnd.github+json")
                .addHeader("X-GitHub-Api-Version", "2022-11-28")
                .addHeader("User-Agent", "PipelineHub")
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            int status = response.code();
            String oauthScopes = response.header("X-OAuth-Scopes");
            String acceptedScopes = response.header("X-Accepted-OAuth-Scopes");
            String rateLimitRemaining = response.header("X-RateLimit-Remaining");
            String rateLimitReset = response.header("X-RateLimit-Reset");

            if (!response.isSuccessful()) {
                log.warn("[GitHubService] GitHub API GET {} returned HTTP {} (scopes='{}', accepted='{}', rateRemaining='{}', rateReset='{}')",
                        url.encodedPath(), status, oauthScopes, acceptedScopes, rateLimitRemaining, rateLimitReset);
                throw mapUpstreamError(status, rateLimitRemaining, oauthScopes, acceptedScopes, responseBody);
            }
            if (responseBody.isBlank()) {
                throw new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_INVALID_RESPONSE",
                        "Received an empty response from GitHub.");
            }
            JsonNode json = objectMapper.readTree(responseBody);
            return new GitHubApiResult(json, response.header("Link"), oauthScopes);
        } catch (GitHubApiException e) {
            throw e;
        } catch (JsonProcessingException e) {
            throw new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_INVALID_RESPONSE",
                    "Received a malformed JSON response from GitHub.");
        } catch (SocketTimeoutException e) {
            log.warn("[GitHubService] Timeout calling GitHub API path={}", url.encodedPath());
            throw new GitHubApiException(HttpStatus.GATEWAY_TIMEOUT, "GITHUB_TIMEOUT",
                    "GitHub took too long to respond. Please try again.");
        } catch (IOException e) {
            log.warn("[GitHubService] Network failure calling GitHub API path={}", url.encodedPath());
            throw new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_UNAVAILABLE",
                    "Unable to reach GitHub right now. Please try again.");
        }
    }

    private GitHubApiException mapUpstreamError(int status,
                                                String rateLimitRemaining,
                                                String oauthScopes,
                                                String acceptedScopes,
                                                String responseBody) {
        if (status == 401) {
            return new GitHubApiException(HttpStatus.UNAUTHORIZED, "GITHUB_REAUTH_REQUIRED",
                    "Your GitHub authorization has expired or been revoked. Reconnect your GitHub account to continue.");
        }
        if (status == 403) {
            boolean rateLimited = "0".equals(rateLimitRemaining)
                    || (responseBody != null && responseBody.toLowerCase().contains("rate limit"));
            if (rateLimited) {
                return new GitHubApiException(HttpStatus.TOO_MANY_REQUESTS, "GITHUB_RATE_LIMIT",
                        "GitHub API rate limit exceeded. Please try again later.");
            }
            boolean headerIndicatesMissingScope = oauthScopes != null && !hasRepositoryScope(oauthScopes)
                    && (acceptedScopes == null || hasRepositoryScope(acceptedScopes) || oauthScopes.isBlank()
                    || oauthScopes.contains("read:user"));
            String bodyLower = responseBody != null ? responseBody.toLowerCase() : "";
            boolean bodyIndicatesMissingScope = bodyLower.contains("scope")
                    || bodyLower.contains("insufficient")
                    || bodyLower.contains("must have push access")
                    || bodyLower.contains("requires authentication")
                    || bodyLower.contains("not have permission");
            if (headerIndicatesMissingScope || bodyIndicatesMissingScope) {
                return new GitHubApiException(HttpStatus.FORBIDDEN, "GITHUB_SCOPE_INSUFFICIENT",
                        "Reconnect your GitHub account to grant public repository access.");
            }
            return new GitHubApiException(HttpStatus.FORBIDDEN, "GITHUB_FORBIDDEN",
                    "GitHub denied access to the requested resource. Verify repository permissions or reconnect GitHub.");
        }
        if (status == 404) {
            return new GitHubApiException(HttpStatus.NOT_FOUND, "GITHUB_NOT_FOUND",
                    "The requested GitHub repository was not found.");
        }
        if (status == 429) {
            return new GitHubApiException(HttpStatus.TOO_MANY_REQUESTS, "GITHUB_RATE_LIMIT",
                    "GitHub API rate limit exceeded. Please try again later.");
        }
        return new GitHubApiException(HttpStatus.BAD_GATEWAY, "GITHUB_UNAVAILABLE",
                "GitHub returned an unexpected error. Please try again.");
    }

    private void validateRepoIdentifier(String value, String fieldName) {
        if (value == null || value.isBlank() || ".".equals(value) || "..".equals(value)
                || !SAFE_IDENTIFIER_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Invalid GitHub " + fieldName + " parameter");
        }
    }

    private PaginationMeta parseLinkPagination(String linkHeader, int currentPage) {
        if (linkHeader == null || linkHeader.isBlank()) {
            return new PaginationMeta(null, null);
        }
        Integer nextPage = null;
        Integer prevPage = null;
        Matcher matcher = LINK_HEADER_PATTERN.matcher(linkHeader);
        while (matcher.find()) {
            String linkUrl = matcher.group(1);
            String rel = matcher.group(2);
            Matcher pageMatcher = PAGE_QUERY_PATTERN.matcher(linkUrl);
            if (pageMatcher.find()) {
                int parsed = Integer.parseInt(pageMatcher.group(1));
                if ("next".equals(rel)) {
                    nextPage = parsed;
                } else if ("prev".equals(rel)) {
                    prevPage = parsed;
                }
            }
        }
        if (prevPage == null && currentPage > 1) {
            prevPage = currentPage - 1;
        }
        return new PaginationMeta(nextPage, prevPage);
    }

    private String textOrNull(JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull() ? node.get(field).asText() : null;
    }

    private String apiBaseUrl() {
        String base = (githubApiUrl == null || githubApiUrl.isBlank()) ? DEFAULT_GITHUB_API_URL : githubApiUrl.trim();
        return base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }

    private HttpUrl.Builder baseUrlBuilder() {
        HttpUrl parsed = HttpUrl.parse(apiBaseUrl());
        if (parsed == null) {
            throw new IllegalStateException("Invalid GitHub API base URL");
        }
        return parsed.newBuilder();
    }

    private String fetchPrimaryEmail(String accessToken) {
        try {
            Request emailRequest = new Request.Builder()
                    .url(apiBaseUrl() + "/user/emails")
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .addHeader("Accept", "application/vnd.github+json")
                    .addHeader("X-GitHub-Api-Version", "2022-11-28")
                    .addHeader("User-Agent", "PipelineHub")
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

    private record GitHubApiResult(JsonNode body, String linkHeader, String oauthScopes) {}

    private record PaginationMeta(Integer nextPage, Integer prevPage) {}

    public record GitHubTokenResult(
            String accessToken,
            String tokenType,
            String scope,
            Instant expiresAt
    ) {}

    public record GitHubProfile(
            String id,
            String username,
            String name,
            String email,
            String avatarUrl,
            String profileUrl
    ) {}
}
