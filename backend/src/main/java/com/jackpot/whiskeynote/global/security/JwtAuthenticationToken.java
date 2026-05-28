package com.jackpot.whiskeynote.global.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

/**
 * JwtFilter가 SecurityContext에 설정하는 인증 토큰.
 */
public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final JwtUserPrincipal principal;

    public JwtAuthenticationToken(Long userId, String role) {
        super(List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        this.principal = new JwtUserPrincipal(userId, role);
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }
}
