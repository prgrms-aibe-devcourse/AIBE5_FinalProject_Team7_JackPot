package com.jackpot.whiskeynote.global.storage.dto;

import com.jackpot.whiskeynote.global.storage.MediaPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PresignUploadRequest(
        @NotNull MediaPurpose purpose,
        @NotBlank @Size(max = 100) String contentType,
        @Size(max = 128) String fileName
) {}
