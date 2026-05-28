package com.jackpot.whiskeynote.domain.member.controller;

import com.jackpot.whiskeynote.domain.member.dto.LoginRequest;
import com.jackpot.whiskeynote.domain.member.dto.RefreshRequest;
import com.jackpot.whiskeynote.domain.member.dto.RegisterRequest;
import com.jackpot.whiskeynote.domain.member.dto.TokenResponse;
import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.oauth.OauthRedirectService;
import com.jackpot.whiskeynote.domain.member.service.AuthService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 API 컨트롤러
 * - AUTH-01: POST /api/v1/auth/register (회원가입)
 * - AUTH-02: POST /api/v1/auth/login    (로그인)
 * - AUTH-03: GET  /api/v1/auth/oauth/{provider} (소셜 로그인 redirect)
 * - AUTH-05: POST /api/v1/auth/logout   (로그아웃)
 *
 * 모든 응답은 프론트 unwrapApiData() 와 맞춰 ApiResponse 래퍼로 반환
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OauthRedirectService oauthRedirectService;

    // AUTH-01: 회원가입
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    // AUTH-03: 소셜 로그인 (Authorization endpoint redirect)
    @GetMapping("/oauth/{provider}")
    public ResponseEntity<Void> oauthRedirect(@PathVariable String provider) {
        AuthProvider authProvider = parseProvider(provider);
        String location = oauthRedirectService.buildAuthorizationUrl(authProvider);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, location)
                .build();
    }

    // AUTH-02: 로그인
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    // AUTH-05: 로그아웃
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal JwtUserPrincipal principal) {
        authService.logout(principal.userId());
    }

    // AUTH-04: AccessToken 재발급
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.ok(authService.refresh(request));
    }

    private AuthProvider parseProvider(String provider) {
        if (provider == null) {
            throw new IllegalArgumentException("provider는 필수입니다.");
        }
        try {
            AuthProvider parsed = AuthProvider.valueOf(provider.trim().toUpperCase());
            if (parsed == AuthProvider.LOCAL) {
                throw new IllegalArgumentException("지원하지 않는 provider 입니다.");
            }
            return parsed;
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("지원하지 않는 provider 입니다.");
        }
    }
}
