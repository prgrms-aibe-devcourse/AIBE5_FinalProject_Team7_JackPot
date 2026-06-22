package com.jackpot.whiskeynote.domain.recommendation.dto;

import com.jackpot.whiskeynote.domain.member.entity.Users;

/**
 * 취향 비슷한 유저 응답 DTO
 * - userId          : 상대 유저 ID
 * - nickname        : 닉네임
 * - profileImageUrl : 프로필 이미지
 * - similarity      : 유사도 (0~100, 소수점 한 자리)
 */
public record TasteMatchDto(
        Long userId,
        String nickname,
        String profileImageUrl,
        double similarity
) {
    public static TasteMatchDto create(Users user, double score) {
        return new TasteMatchDto(
            user.getId(),
            user.getNickname(),
            user.getProfileImageUrl(),
            score);
    }
}
