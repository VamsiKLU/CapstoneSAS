package io.pipelinehub.service;

import io.pipelinehub.dto.UserDto;
import io.pipelinehub.entity.User;
import org.springframework.stereotype.Component;

/**
 * Maps between User entities and UserDto, ensuring no sensitive fields are exposed.
 */
@Component
public class UserMapper {

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
            dto.setGithub(github);
        }

        return dto;
    }
}
