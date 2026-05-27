package com.jackpot.whiskeynote.global.storage.dto;

public record PresignUploadResponse(
        String uploadUrl,
        String objectKey,
        /** DB/HTML 저장용 — /api/v1/media?key=... 형태 */
        String mediaUrl
) {}
