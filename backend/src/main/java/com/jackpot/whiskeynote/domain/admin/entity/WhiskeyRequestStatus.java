package com.jackpot.whiskeynote.domain.admin.entity;

/**
 * 위스키 등록 요청 상태
 * - DB ENUM: pending / approved / rejected
 */
public enum WhiskeyRequestStatus {
    pending,    // 검토 대기
    approved,   // 승인됨
    rejected    // 반려됨
}
