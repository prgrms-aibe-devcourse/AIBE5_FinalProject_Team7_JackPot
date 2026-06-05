package com.jackpot.whiskeynote.domain.member.dto;

/**
 * AUTH-01 / AUTH-02 토큰 응답 DTO
 * - accessToken:  Authorization 헤더에 사용 (30분)
 * - refreshToken: 토큰 재발급 시 사용 (14일, MySQL 저장)
 * - isNewUser:    true(1)면 온보딩 화면으로 이동 / false(0)면 메인으로 이동 (FN-008)
 */
public record TokenResponse(
        String accessToken,
        String refreshToken,
        Long userId,
        boolean isNewUser,
        String nickname,
        String profileImageUrl,
        String role
) {}
