package io.pipelinehub.service;

import io.pipelinehub.dto.UserDto;
import io.pipelinehub.entity.GitHubConnection;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.GitHubConnectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Maps between User entities and UserDto, ensuring no sensitive fields are exposed.
 */
@Component
public class UserMapper {

    @Autowired(required = false)
    private GitHubConnectionRepository gitHubConnectionRepository;

    public UserDto toDto(User user) {
        if (user == null) return null;

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setGithubConnected(user.isGithubConnected());

        if (user.isGithubConnected() && user.getGithubUserId() != null) {
            UserDto.GitHubInfo github = new UserDto.GitHubInfo();
            github.setUserId(user.getGithubUserId());
            github.setUsername(user.getGithubUsername());
            github.setName(user.getGithubName());
            github.setEmail(user.getGithubEmail());
            github.setAvatarUrl(user.getGithubAvatarUrl());
            github.setProfileUrl(user.getGithubProfileUrl());

            if (gitHubConnectionRepository != null && user.getId() != null) {
                GitHubConnection conn = gitHubConnectionRepository.findByUserId(user.getId()).orElse(null);
                boolean repoReady = conn != null
                        && conn.getStatus() == GitHubConnection.ConnectionStatus.ACTIVE
                        && GitHubService.hasRepositoryScope(conn.getScopes());
                github.setRepositoryAccessReady(repoReady);
            }
            dto.setGithub(github);
        }

        return dto;
    }
}
