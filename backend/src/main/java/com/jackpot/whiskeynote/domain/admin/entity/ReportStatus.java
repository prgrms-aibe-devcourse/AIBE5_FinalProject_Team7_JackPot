package com.jackpot.whiskeynote.domain.admin.entity;

/**
 * 신고 상태
 */
public enum ReportStatus {
    PENDING,    // 검토 대기
    DISMISSED,  // 기각
    HIDDEN,     // 숨김/삭제 처리 완료
    RESTORED    // 복구 완료
}
