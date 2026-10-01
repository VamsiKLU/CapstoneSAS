package io.pipelinehub.service;

import io.pipelinehub.dto.RegisterRequest;
import io.pipelinehub.entity.User;
import io.pipelinehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.email:}")
    private String adminEmail;

    @Value("${admin.password:}")
    private String adminPassword;

    // ----- ApplicationRunner: seed admin on startup -----

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("[UserService] ADMIN_EMAIL or ADMIN_PASSWORD not configured -- admin login disabled");
            return;
        }
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("[UserService] Admin account already exists for: {}", adminEmail);
            return;
        }
        User admin = new User();
        admin.setName("Platform Administrator");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(User.Role.ADMIN);
        admin.setGithubConnected(false);
        userRepository.save(admin);
        log.info("[UserService] Admin account seeded for: {}", adminEmail);
    }

    // ----- Developer Registration -----

    @Transactional
    public User registerDeveloper(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email address already exists");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.DEVELOPER);
        user.setGithubConnected(false);
        return userRepository.save(user);
    }

    // ----- GitHub connection -----

    @Transactional
    public User connectGitHub(Long userId, String githubUserId, String githubUsername,
                              String githubName, String githubEmail,
                              String githubAvatarUrl, String githubProfileUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        user.setGithubConnected(true);
        user.setGithubUserId(githubUserId);
        user.setGithubUsername(githubUsername);
        user.setGithubName(githubName);
        user.setGithubEmail(githubEmail);
        user.setGithubAvatarUrl(githubAvatarUrl);
        user.setGithubProfileUrl(githubProfileUrl);
        return userRepository.save(user);
    }

    @Transactional
    public void disconnectGitHub(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        user.setGithubConnected(false);
        user.setGithubUserId(null);
        user.setGithubUsername(null);
        user.setGithubName(null);
        user.setGithubEmail(null);
        user.setGithubAvatarUrl(null);
        user.setGithubProfileUrl(null);
        userRepository.save(user);
    }

    // ----- Account deletion -----

    @Transactional
    public void deleteAccount(Long userId) {
        userRepository.deleteById(userId);
    }

    // ----- Finders -----

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
