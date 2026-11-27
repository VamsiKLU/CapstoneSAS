package io.pipelinehub.controller;

import io.pipelinehub.dto.ApiError;
import io.pipelinehub.entity.User;
import io.pipelinehub.service.UserMapper;
import io.pipelinehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private static final Logger log = LoggerFactory.getLogger(AccountController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    // ------------------------------------------------------------------
    // DELETE /api/v1/account
    // Permanently deletes the current authenticated user's account and data.
    // Uses server-side session to identify user -- never trusts client-provided ID.
    // ------------------------------------------------------------------
    @DeleteMapping
    public ResponseEntity<?> deleteAccount(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Long userId = session != null ? (Long) session.getAttribute("userId") : null;

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Authentication is required."));
        }

        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError("AUTH_REQUIRED", "Session is no longer valid. Please sign in again."));
        }

        if (user.getRole() != User.Role.DEVELOPER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiError("FORBIDDEN", "Admin accounts cannot be deleted through this endpoint."));
        }

        try {
            userService.deleteAccount(userId);
            session.invalidate();
            SecurityContextHolder.clearContext();
            log.info("[AccountController] Account deleted for user id={}", userId);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception e) {
            log.error("[AccountController] Account deletion error for user id={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiError("ACCOUNT_DELETION_FAILED", "Unable to delete your account. Please try again."));
        }
    }
}
