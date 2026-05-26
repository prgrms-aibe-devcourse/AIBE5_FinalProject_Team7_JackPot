package com.jackpot.whiskeynote.domain.member.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * RefreshToken 엔티티 — MySQL 저장
 *
 * Redis 대신 MySQL을 사용하는 이유 (MVP 결정):
 * - Redis 설치/설정 없이 바로 동작
 * - MVP 기간 내 빠른 개발 가능
 * - 추후 Redis로 교체 시 이 클래스만 제거하면 됨
 *
 * 만료된 토큰 정리:
 * - 로그아웃 시 즉시 삭제
 * - 만료 시각(expiresAt) 지난 토큰은 로그인 시 자동 교체
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 토큰 소유자 (users.id 참조)
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // RefreshToken 문자열
    @Column(nullable = false, length = 512)
    private String token;

    // 만료 시각 (발급 시각 + 14일)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // 토큰 갱신 (재발급 시 호출)
    public void updateToken(String newToken, LocalDateTime newExpiresAt) {
        this.token = newToken;
        this.expiresAt = newExpiresAt;
    }
}
