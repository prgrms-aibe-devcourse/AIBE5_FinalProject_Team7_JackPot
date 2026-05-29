package com.jackpot.whiskeynote.global.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Authorization: Bearer {accessToken} 검증 후 SecurityContext에 로그인 사용자를 설정합니다.
 * 토큰이 없으면 익명(비로그인)으로 통과하며, authenticated() 엔드포인트에서 401 처리됩니다.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            if (jwtProvider.isValid(token)) {
                Long userId = jwtProvider.getUserId(token);
                String role = jwtProvider.getRole(token);
                SecurityContextHolder.getContext().setAuthentication(
                        new JwtAuthenticationToken(userId, role)
                );
            }
        }

        filterChain.doFilter(request, response);
    }
}
