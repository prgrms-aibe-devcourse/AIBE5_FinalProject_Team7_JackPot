package com.jackpot.whiskeynote.domain.member.dto;

import com.jackpot.whiskeynote.domain.member.entity.Users;

/**
 * 타인 프로필 공개 조회 응답 DTO
 * - 닉네임·프로필 이미지만 노출 (email 등 민감 정보 제외)
 * - 리뷰/픽 등 다른 데이터 존재 여부와 무관하게 항상 조회 가능해야 함
 */
public record PublicUserDto(
        Long userId,
        String nickname,
        String profileImageUrl,
        String introduction
) {
    public static PublicUserDto from(Users user) {
        return new PublicUserDto(
                user.getId(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getIntroduction()
        );
    }
}
