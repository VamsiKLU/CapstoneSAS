package io.pipelinehub;

import io.pipelinehub.service.TokenEncryptionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class TokenEncryptionServiceTest {

    private static final String TEST_KEY = Base64.getEncoder().encodeToString(
            "0123456789abcdef0123456789abcdef".getBytes());
    private static final String OTHER_KEY = Base64.getEncoder().encodeToString(
            "fedcba9876543210fedcba9876543210".getBytes());

    @Test
    @DisplayName("AES-GCM encryption round trip returns original token with randomized IV")
    void encryptDecryptRoundTrip() {
        TokenEncryptionService service = new TokenEncryptionService(TEST_KEY);
        assertTrue(service.isConfigured());

        String plaintext = "gho_example_secret_access_token_12345";
        String encrypted1 = service.encrypt(plaintext);
        String encrypted2 = service.encrypt(plaintext);

        assertNotNull(encrypted1);
        assertNotEquals(plaintext, encrypted1);
        assertNotEquals(encrypted1, encrypted2);
        assertFalse(encrypted1.contains(plaintext));
        assertEquals(plaintext, service.decrypt(encrypted1));
        assertEquals(plaintext, service.decrypt(encrypted2));
    }

    @Test
    @DisplayName("Missing or invalid encryption key fails safely without plaintext fallback")
    void missingOrInvalidKeyFailsSafely() {
        TokenEncryptionService blankService = new TokenEncryptionService("");
        assertFalse(blankService.isConfigured());
        assertThrows(IllegalStateException.class, () -> blankService.encrypt("gho_token"));
        assertThrows(IllegalStateException.class, () -> blankService.decrypt("v1:abc:def"));

        String shortKey = Base64.getEncoder().encodeToString("too-short".getBytes());
        TokenEncryptionService shortService = new TokenEncryptionService(shortKey);
        assertFalse(shortService.isConfigured());
        assertThrows(IllegalStateException.class, () -> shortService.encrypt("gho_token"));

        TokenEncryptionService badBase64 = new TokenEncryptionService("not-valid-base64!!!");
        assertFalse(badBase64.isConfigured());
        assertThrows(IllegalStateException.class, () -> badBase64.encrypt("gho_token"));
    }

    @Test
    @DisplayName("Wrong key or tampered ciphertext fails decryption safely")
    void wrongKeyAndTamperedCiphertextFail() {
        TokenEncryptionService writer = new TokenEncryptionService(TEST_KEY);
        TokenEncryptionService wrongReader = new TokenEncryptionService(OTHER_KEY);

        String encrypted = writer.encrypt("gho_sensitive_token");
        assertThrows(IllegalStateException.class, () -> wrongReader.decrypt(encrypted));

        String tampered = encrypted.substring(0, encrypted.length() - 2) + "AA";
        assertThrows(IllegalStateException.class, () -> writer.decrypt(tampered));
    }
}
