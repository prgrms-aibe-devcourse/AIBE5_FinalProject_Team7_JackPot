package com.jackpot.whiskeynote.domain.member.repository;

import com.jackpot.whiskeynote.domain.member.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * RefreshToken MySQL JPA Repository
 *
 * Redis → MySQL 변경 이유: MVP 기간 내 빠른 개발
 * 추후 Redis로 교체 시 이 파일만 수정하면 됨
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // userId로 토큰 조회 (로그인 시 기존 토큰 갱신 여부 확인)
    Optional<RefreshToken> findByUserId(Long userId);

    // token 값으로 조회 (재발급 시 사용)
    Optional<RefreshToken> findByToken(String token);

    // 로그아웃 시 토큰 삭제
    void deleteByUserId(Long userId);
}
