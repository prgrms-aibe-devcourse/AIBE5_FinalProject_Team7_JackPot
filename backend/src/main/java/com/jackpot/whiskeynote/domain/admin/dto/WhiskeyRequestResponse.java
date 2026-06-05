package com.jackpot.whiskeynote.domain.admin.dto;

import com.jackpot.whiskeynote.domain.admin.entity.WhiskeyRequest;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 위스키 요청 목록 조회 DTO
 * @param requestId 요청 ID
 * @param requesterNickName 요청자 닉네임
 * @param description 요청 내용
 * @param status 요청 상태(pending(요청중), approved(승인됨), rejected(반려됨))
 * @param reviewedByNickName 검토한 관리자 닉네임
 * @param createdAt 요청 시간
 */
public record WhiskeyRequestResponse(
        Long requestId,
        String requesterNickName,
        Map<String, Object> description,
        String status,
        String reviewedByNickName,
        LocalDateTime createdAt
) {
    public static WhiskeyRequestResponse from(WhiskeyRequest req) {
        return new WhiskeyRequestResponse(
                req.getId(),
                req.getRequester() != null ? req.getRequester().getNickname() : "(탈퇴한 회원)",
                req.getDescription(),
                req.getStatus().name(),
                req.getReviewedBy() != null ? req.getReviewedBy().getNickname() : null,
                req.getCreatedAt()
        );
    }
}

