package io.pipelinehub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GitHubBranchDto {

    private String name;

    @JsonProperty("protected")
    private Boolean isProtected;

    @JsonProperty("default")
    private Boolean defaultBranch;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getIsProtected() { return isProtected; }
    public void setIsProtected(Boolean isProtected) { this.isProtected = isProtected; }

    public Boolean getDefaultBranch() { return defaultBranch; }
    public void setDefaultBranch(Boolean defaultBranch) { this.defaultBranch = defaultBranch; }
}
