package io.pipelinehub.dto;

/**
 * Safe public representation of a user – never includes password_hash or tokens.
 */
public class UserDto {

    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean githubConnected;
    private GitHubInfo github;

    public static class GitHubInfo {
        private String userId;
        private String username;
        private String name;
        private String email;
        private String avatarUrl;
        private String profileUrl;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public String getProfileUrl() { return profileUrl; }
        public void setProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isGithubConnected() { return githubConnected; }
    public void setGithubConnected(boolean githubConnected) { this.githubConnected = githubConnected; }
    public GitHubInfo getGithub() { return github; }
    public void setGithub(GitHubInfo github) { this.github = github; }
}
