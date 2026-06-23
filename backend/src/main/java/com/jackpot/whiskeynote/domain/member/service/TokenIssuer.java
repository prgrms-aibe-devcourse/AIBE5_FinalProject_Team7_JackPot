package com.jackpot.whiskeynote.domain.member.service;

import com.jackpot.whiskeynote.domain.member.dto.TokenResponse;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * JWT 발급 공통 (로컬·소셜 공용)
 * - 호출: AuthService.register/login, OauthLoginService.login
 * - 반환: accessToken, refreshToken, userId, isNewUser, nickname, profileImageUrl
 * - refresh 재발급은 AuthService.refresh에서 별도 처리
 */
@Component
@RequiredArgsConstructor
public class TokenIssuer {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * JWT 발급 및 refresh_tokens upsert
     *
     * 기존 findByUserId → saveAndFlush 패턴은 동시 로그인 시 레이스 컨디션 발생:
     *   두 트랜잭션이 동시에 "토큰 없음"으로 읽고 둘 다 INSERT 시도
     *   → Duplicate entry for key 'UK_user_id' (500 에러)
     *
     * 해결: MySQL ON DUPLICATE KEY UPDATE로 원자적 upsert 처리
     *   INSERT 시도 → user_id 충돌 시 자동으로 UPDATE로 전환 (단일 쿼리, 락 불필요)
     */
    @Transactional
    public TokenResponse issueTokens(Users user) {
        String accessToken  = jwtProvider.createAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());

        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(jwtProvider.getRefreshTokenExpiryMs() / 1000);

        // 원자적 upsert — 동시 요청에도 Duplicate entry 에러 없음
        refreshTokenRepository.upsertToken(user.getId(), refreshToken, expiresAt);

        return new TokenResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.isNewUser(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getRole().name()
        );
    }
}

