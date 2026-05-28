package com.jackpot.whiskeynote.domain.member.service;

import com.jackpot.whiskeynote.domain.member.dto.TokenResponse;
import com.jackpot.whiskeynote.domain.member.entity.RefreshToken;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TokenIssuer {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public TokenResponse issueTokens(Users user) {
        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());

        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(jwtProvider.getRefreshTokenExpiryMs() / 1000);

        RefreshToken tokenEntity = refreshTokenRepository.findByUserId(user.getId())
                .map(existing -> {
                    existing.updateToken(refreshToken, expiresAt);
                    return existing;
                })
                .orElseGet(() -> RefreshToken.builder()
                        .userId(user.getId())
                        .token(refreshToken)
                        .expiresAt(expiresAt)
                        .build()
                );

        refreshTokenRepository.saveAndFlush(tokenEntity);

        return new TokenResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.isNewUser(),
                user.getNickname(),
                user.getProfileImageUrl()
        );
    }
}

