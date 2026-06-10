package com.jackpot.whiskeynote.domain.admin.dto;

import com.jackpot.whiskeynote.domain.admin.entity.Reports;

import java.time.LocalDateTime;

public record ReportDto(
        Long reportId,
        Long reporterId,
        String reporterNickname,
        Long targetId,
        String targetType,
        String reason,
        String detail,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ReportDto from(Reports report) {
        return new ReportDto(
                report.getId(),
                report.getReporter() != null ? report.getReporter().getId() : null,
                report.getReporter() != null ? report.getReporter().getNickname() : "(탈퇴한 회원)",
                report.getTargetId(),
                report.getTargetType().name(),
                report.getReason().name(),
                report.getDetail(),
                report.getStatus().name(),
                report.getCreatedAt(),
                report.getUpdatedAt()
        );
    }
}
