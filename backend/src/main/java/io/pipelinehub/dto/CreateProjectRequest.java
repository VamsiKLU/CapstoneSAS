package io.pipelinehub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Validated request body for project creation. All repo/branch identifiers are validated
 * server-side; the owner identity is taken from the authenticated session, never from this DTO.
 */
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 128, message = "Project name must be 128 characters or fewer")
    private String name;

    @NotBlank(message = "Repository full name is required")
    @Pattern(
            regexp = "^[A-Za-z0-9._-]{1,100}/[A-Za-z0-9._-]{1,100}$",
            message = "Repository full name must be in owner/repo format"
    )
    private String repositoryFullName;

    @Size(max = 1024, message = "Repository URL must be 1024 characters or fewer")
    private String repositoryUrl;

    @NotBlank(message = "Branch is required")
    @Size(max = 256, message = "Branch name must be 256 characters or fewer")
    private String branch;

    @Size(max = 128, message = "Stack must be 128 characters or fewer")
    private String stack;

    @Size(max = 32, message = "Pipeline version must be 32 characters or fewer")
    private String pipelineVersion;

    @Size(max = 32, message = "Version must be 32 characters or fewer")
    private String version;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRepositoryFullName() { return repositoryFullName; }
    public void setRepositoryFullName(String repositoryFullName) { this.repositoryFullName = repositoryFullName; }

    public String getRepositoryUrl() { return repositoryUrl; }
    public void setRepositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getStack() { return stack; }
    public void setStack(String stack) { this.stack = stack; }

    public String getPipelineVersion() { return pipelineVersion; }
    public void setPipelineVersion(String pipelineVersion) { this.pipelineVersion = pipelineVersion; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
}
