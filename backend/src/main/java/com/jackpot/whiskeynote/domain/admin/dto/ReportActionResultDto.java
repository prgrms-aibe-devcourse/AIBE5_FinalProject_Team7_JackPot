package com.jackpot.whiskeynote.domain.admin.dto;

import com.jackpot.whiskeynote.domain.admin.entity.ReportActions;

import java.time.LocalDateTime;

public record ReportActionResultDto(
        Long actionId,
        Long adminId,
        String action,
        String note,
        LocalDateTime createdAt
) {
    public static ReportActionResultDto from(ReportActions action) {
        return new ReportActionResultDto(
                action.getId(),
                action.getAdmin().getId(),
                action.getAction().name(),
                action.getNote(),
                action.getCreatedAt()
        );
    }
}
