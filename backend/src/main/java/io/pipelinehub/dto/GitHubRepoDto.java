package io.pipelinehub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Safe DTO for a GitHub public repository.
 * Never includes raw upstream payloads, tokens, or private fields.
 * visibility is always "public" for every item returned by the repository listing endpoint.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GitHubRepoDto {

    private Long id;
    private String name;
    private String fullName;
    private String ownerLogin;
    private String description;
    private String htmlUrl;
    private String defaultBranch;
    private String language;
    private String updatedAt;
    private boolean archived;
    private String visibility;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getOwnerLogin() { return ownerLogin; }
    public void setOwnerLogin(String ownerLogin) { this.ownerLogin = ownerLogin; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHtmlUrl() { return htmlUrl; }
    public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }

    public String getDefaultBranch() { return defaultBranch; }
    public void setDefaultBranch(String defaultBranch) { this.defaultBranch = defaultBranch; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
}
