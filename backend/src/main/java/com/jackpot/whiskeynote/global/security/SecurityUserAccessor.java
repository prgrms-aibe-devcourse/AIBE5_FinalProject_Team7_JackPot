package com.jackpot.whiskeynote.global.security;

import com.jackpot.whiskeynote.global.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * SecurityContext에서 로그인 사용자 ID를 꺼내는 유틸.
 */
public final class SecurityUserAccessor {

    private SecurityUserAccessor() {
    }

    public static Long currentUserIdOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof JwtUserPrincipal jwtUser) {
            return jwtUser.userId();
        }
        return null;
    }

    public static Long requireUserId() {
        Long userId = currentUserIdOrNull();
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return userId;
    }

    public static JwtUserPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof JwtUserPrincipal jwtUser) {
            return jwtUser;
        }
        throw new UnauthorizedException("로그인이 필요합니다.");
    }
}
