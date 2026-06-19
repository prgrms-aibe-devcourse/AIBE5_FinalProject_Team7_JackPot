package com.jackpot.whiskeynote.domain.member.dto;

/**
 * USER-01 내 프로필 조회 응답 DTO
 * - MVP: flavorProfile은 스키마/계산 로직 확정 전까지 null 로 반환
 */
public record UserMeDto(
        Long userId,
        String email,
        String nickname,
        String profileImageUrl,
        String introduction,
        Object flavorProfile
) {
    public static UserMeDto from( com.jackpot.whiskeynote.domain.member.entity.Users user) {
        return new UserMeDto(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getIntroduction(),
                null
        );
    }
}
