package com.jackpot.whiskeynote.global.security;

/**
 * JWT 인증 후 SecurityContext에 저장되는 로그인 사용자 정보.
 */
public record JwtUserPrincipal(Long userId, String role) {
}
