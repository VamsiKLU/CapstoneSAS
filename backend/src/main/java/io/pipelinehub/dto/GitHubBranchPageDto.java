package io.pipelinehub.dto;

import java.util.List;

public class GitHubBranchPageDto {

    private List<GitHubBranchDto> branches;
    private int page;
    private int perPage;
    private boolean hasNextPage;
    private boolean hasPrevPage;
    private Integer nextPage;
    private Integer prevPage;

    public List<GitHubBranchDto> getBranches() { return branches; }
    public void setBranches(List<GitHubBranchDto> branches) { this.branches = branches; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getPerPage() { return perPage; }
    public void setPerPage(int perPage) { this.perPage = perPage; }

    public boolean isHasNextPage() { return hasNextPage; }
    public void setHasNextPage(boolean hasNextPage) { this.hasNextPage = hasNextPage; }

    public boolean isHasPrevPage() { return hasPrevPage; }
    public void setHasPrevPage(boolean hasPrevPage) { this.hasPrevPage = hasPrevPage; }

    public Integer getNextPage() { return nextPage; }
    public void setNextPage(Integer nextPage) { this.nextPage = nextPage; }

    public Integer getPrevPage() { return prevPage; }
    public void setPrevPage(Integer prevPage) { this.prevPage = prevPage; }
}
