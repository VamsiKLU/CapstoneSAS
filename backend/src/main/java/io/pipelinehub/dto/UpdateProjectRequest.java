package io.pipelinehub.dto;

import jakarta.validation.constraints.Size;

/**
 * Validated request body for updating mutable project configuration fields.
 * Ownership is always verified from the authenticated session.
 */
public class UpdateProjectRequest {

    @Size(max = 128, message = "Project name must be 128 characters or fewer")
    private String name;

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

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getStack() { return stack; }
    public void setStack(String stack) { this.stack = stack; }

    public String getPipelineVersion() { return pipelineVersion; }
    public void setPipelineVersion(String pipelineVersion) { this.pipelineVersion = pipelineVersion; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
}
