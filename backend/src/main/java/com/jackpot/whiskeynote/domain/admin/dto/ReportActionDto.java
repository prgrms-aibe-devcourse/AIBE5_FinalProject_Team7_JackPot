package com.jackpot.whiskeynote.domain.admin.dto;

public record ReportActionDto(
        String action,  // HIDE / RESTORE / DISMISS / BAN_USER / DELETE_CONTENT
        String note     // 처리 메모 (nullable)
) { }