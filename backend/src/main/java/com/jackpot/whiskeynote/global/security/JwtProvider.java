package com.jackpot.whiskeynote.global.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT AccessToken / RefreshToken 생성 및 검증
 *
 * - AccessToken:  MySQL users.id + role 담아서 발급 → 만료 30분
 * - RefreshToken: userId만 담아서 발급 → 만료 14일, Redis에 저장
 */
@Component
public class JwtProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiryMs;
    private final long refreshTokenExpiryMs;

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiry-ms}") long accessTokenExpiryMs,
            @Value("${jwt.refresh-token-expiry-ms}") long refreshTokenExpiryMs
    ) {
        // 시크릿 키는 최소 32자 이상이어야 HS256에서 안전
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiryMs = accessTokenExpiryMs;
        this.refreshTokenExpiryMs = refreshTokenExpiryMs;
    }

    // AccessToken 생성
    public String createAccessToken(Long userId, String role) {
        return Jwts.builder()
                .subject(String.valueOf(userId))  // sub: userId
                .claim("role", role)              // 권한 클레임
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiryMs))
                .signWith(secretKey)
                .compact();
    }

    // RefreshToken 생성
    public String createRefreshToken(Long userId) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiryMs))
                .signWith(secretKey)
                .compact();
    }

    // 토큰에서 userId 추출
    public Long getUserId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    // 토큰에서 role 추출
    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // 토큰 유효성 검증 (만료 여부 포함)
    public boolean isValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // RefreshToken 만료 시간 (ms) 반환 — Redis TTL 설정에 사용
    public long getRefreshTokenExpiryMs() {
        return refreshTokenExpiryMs;
    }

    // 내부 Claims 파싱
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
