package com.jackpot.whiskeynote.domain.admin.dto;

import com.jackpot.whiskeynote.domain.member.entity.Users;

import java.time.LocalDateTime;
import java.time.LocalDate;

/**
 * 관리자용 사용자 목록 응답 Dto
 */
public record AdminUserDto(
        Long   id,
        String email,
        String name,
        String nickname,
        LocalDate birthday,
        String role,
        boolean isDeleted,
        boolean isBanned,
        LocalDateTime bannedAt,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        boolean isNewUser        // 온보딩 미완료 여부
) {
    public static AdminUserDto from(Users user) {
        return new AdminUserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getBirthday(),
                user.getRole().name(),
                user.isDeleted(),
                user.isBanned(),
                user.getBannedAt(),
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.isNewUser()
        );
    }
}
