package com.jackpot.whiskeynote.global.storage;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class MediaUploadServiceTest {

    @Test
    void validateObjectKey_acceptsAllowedPrefixes() {
        assertDoesNotThrow(() -> MediaUploadService.validateObjectKey("posts/1/uuid.jpg"));
        assertDoesNotThrow(() -> MediaUploadService.validateObjectKey("whiskeys/2/uuid.png"));
        assertDoesNotThrow(() -> MediaUploadService.validateObjectKey("whiskey/그란츠_트리플_우드.webp"));
        assertDoesNotThrow(() -> MediaUploadService.validateObjectKey("profiles/3/uuid.webp"));
    }

    @Test
    void validateObjectKey_rejectsUnsafePaths() {
        assertThrows(IllegalArgumentException.class, () -> MediaUploadService.validateObjectKey("../etc/passwd"));
        assertThrows(IllegalArgumentException.class, () -> MediaUploadService.validateObjectKey("secret/file.jpg"));
        assertThrows(IllegalArgumentException.class, () -> MediaUploadService.validateObjectKey("/posts/1.jpg"));
    }

    @Test
    void validateProfileObjectKeyForUser_acceptsOwnPrefixOnly() {
        assertDoesNotThrow(() -> MediaUploadService.validateProfileObjectKeyForUser(3L, "profiles/3/uuid.webp"));
        assertThrows(IllegalArgumentException.class,
                () -> MediaUploadService.validateProfileObjectKeyForUser(3L, "profiles/99/uuid.webp"));
    }
}
