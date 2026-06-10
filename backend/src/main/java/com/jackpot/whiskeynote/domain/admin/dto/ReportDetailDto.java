package com.jackpot.whiskeynote.domain.admin.dto;

import com.jackpot.whiskeynote.domain.admin.entity.ReportActions;
import com.jackpot.whiskeynote.domain.admin.entity.Reports;

import java.time.LocalDateTime;
import java.util.List;

public record ReportDetailDto(
        Long reportId,
        String reporterNickname,
        Long targetId,
        Long postId,          // 댓글 신고 시 원본 게시글 ID (POST 신고면 null)
        String targetType,
        String reason,
        String detail,
        String status,
        List<ReportActionResultDto> actions,
        LocalDateTime createdAt
) {
    public static ReportDetailDto from(Reports report) {
        return new ReportDetailDto(
                report.getId(),
                report.getReporter().getNickname(),
                report.getTargetId(),
                null,
                report.getTargetType().name(),
                report.getReason().name(),
                report.getDetail(),
                report.getStatus().name(),
                List.of(),
                report.getCreatedAt()
        );
    }

    public void actions(List<ReportActions> allByReportOrderByCreatedAtDesc) {
        List<ReportActionResultDto> reportActionResultDtos = allByReportOrderByCreatedAtDesc.stream()
                .map(ReportActionResultDto::from)
                .toList();
    }
}
