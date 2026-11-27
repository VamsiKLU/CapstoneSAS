package io.pipelinehub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Encrypts and decrypts GitHub OAuth access tokens at rest using AES-256-GCM.
 * Fails safely if the encryption key is missing or invalid; never falls back to plaintext.
 */
@Service
public class TokenEncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int KEY_BYTES = 32;
    private static final int IV_BYTES = 12;
    private static final int TAG_BITS = 128;
    private static final String VERSION_PREFIX = "v1";

    private final SecureRandom secureRandom = new SecureRandom();
    private final String configuredKeyBase64;

    public TokenEncryptionService(@Value("${github.token-encryption-key:}") String configuredKeyBase64) {
        this.configuredKeyBase64 = configuredKeyBase64;
    }

    public boolean isConfigured() {
        return tryResolveKey() != null;
    }

    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isBlank()) {
            throw new IllegalArgumentException("Token value must not be empty");
        }
        SecretKey key = requireKey();
        try {
            byte[] iv = new byte[IV_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            return VERSION_PREFIX
                    + ":" + Base64.getEncoder().encodeToString(iv)
                    + ":" + Base64.getEncoder().encodeToString(ciphertext);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Unable to encrypt GitHub access token", e);
        }
    }

    public String decrypt(String encryptedPayload) {
        if (encryptedPayload == null || encryptedPayload.isBlank()) {
            throw new IllegalArgumentException("Encrypted token payload must not be empty");
        }
        SecretKey key = requireKey();
        String[] parts = encryptedPayload.split(":", 3);
        if (parts.length != 3 || !VERSION_PREFIX.equals(parts[0])) {
            throw new IllegalStateException("Unsupported encrypted token format");
        }
        try {
            byte[] iv = Base64.getDecoder().decode(parts[1]);
            byte[] ciphertext = Base64.getDecoder().decode(parts[2]);
            if (iv.length != IV_BYTES) {
                throw new IllegalStateException("Invalid encrypted token IV length");
            }
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException | GeneralSecurityException e) {
            throw new IllegalStateException("Unable to decrypt GitHub access token", e);
        }
    }

    private SecretKey requireKey() {
        SecretKey key = tryResolveKey();
        if (key == null) {
            throw new IllegalStateException("GitHub token encryption key is not configured or invalid");
        }
        return key;
    }

    private SecretKey tryResolveKey() {
        if (configuredKeyBase64 == null || configuredKeyBase64.isBlank()) {
            return null;
        }
        try {
            byte[] raw = Base64.getDecoder().decode(configuredKeyBase64.trim());
            if (raw.length != KEY_BYTES) {
                return null;
            }
            return new SecretKeySpec(raw, ALGORITHM);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
