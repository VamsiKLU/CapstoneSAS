package io.pipelinehub.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "github_connected", nullable = false)
    private boolean githubConnected = false;

    @Column(name = "github_user_id", unique = true)
    private String githubUserId;

    @Column(name = "github_username")
    private String githubUsername;

    @Column(name = "github_name")
    private String githubName;

    @Column(name = "github_email")
    private String githubEmail;

    @Column(name = "github_avatar_url", length = 1024)
    private String githubAvatarUrl;

    @Column(name = "github_profile_url", length = 1024)
    private String githubProfileUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum Role {
        DEVELOPER, ADMIN
    }

    // ----- Getters and Setters -----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isGithubConnected() { return githubConnected; }
    public void setGithubConnected(boolean githubConnected) { this.githubConnected = githubConnected; }

    public String getGithubUserId() { return githubUserId; }
    public void setGithubUserId(String githubUserId) { this.githubUserId = githubUserId; }

    public String getGithubUsername() { return githubUsername; }
    public void setGithubUsername(String githubUsername) { this.githubUsername = githubUsername; }

    public String getGithubName() { return githubName; }
    public void setGithubName(String githubName) { this.githubName = githubName; }

    public String getGithubEmail() { return githubEmail; }
    public void setGithubEmail(String githubEmail) { this.githubEmail = githubEmail; }

    public String getGithubAvatarUrl() { return githubAvatarUrl; }
    public void setGithubAvatarUrl(String githubAvatarUrl) { this.githubAvatarUrl = githubAvatarUrl; }

    public String getGithubProfileUrl() { return githubProfileUrl; }
    public void setGithubProfileUrl(String githubProfileUrl) { this.githubProfileUrl = githubProfileUrl; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
