package com.jackpot.whiskeynote.domain.member.controller;

import com.jackpot.whiskeynote.domain.member.dto.LoginRequest;
import com.jackpot.whiskeynote.domain.member.dto.OauthCallbackRequest;
import com.jackpot.whiskeynote.domain.member.dto.RefreshRequest;
import com.jackpot.whiskeynote.domain.member.dto.RegisterRequest;
import com.jackpot.whiskeynote.domain.member.dto.TokenResponse;
import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.oauth.OauthRedirectService;
import com.jackpot.whiskeynote.domain.member.oauth.OauthLoginService;
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
 * - AUTH-03: POST /api/v1/auth/oauth/{provider}/callback (소셜 code → JWT)
 * - AUTH-04: POST /api/v1/auth/refresh  (AccessToken 재발급)
 * - AUTH-05: POST /api/v1/auth/logout   (로그아웃)
 *
 * 소셜 로그인: LoginPage → GET oauth/{provider} → provider → /oauth/{provider}/callback → POST callback
 * OAuth 설정: .env OAUTH_* → application-prod.yaml → OauthProperties (redirect-uri 3곳 일치)
 *
 * 모든 응답은 프론트 unwrapApiData() 와 맞춰 ApiResponse 래퍼로 반환
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OauthRedirectService oauthRedirectService;
    private final OauthLoginService oauthLoginService;

    // AUTH-01: 회원가입
    // 의도: 가입 직후 별도 login 없이 JWT 반환 → 온보딩/라운지로 바로 진입
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    // AUTH-03: 소셜 로그인 (Authorization endpoint redirect)
    // 의도: 프론트가 provider URL·client_id를 몰라도 되게 백엔드가 302로 넘김
    @GetMapping("/oauth/{provider}")
    public ResponseEntity<Void> oauthRedirect(@PathVariable String provider) {
        AuthProvider authProvider = parseProvider(provider);
        String location = oauthRedirectService.buildAuthorizationUrl(authProvider);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, location)
                .build();
    }

    // 소셜 로그인 콜백: code → provider token 교환 → 우리 JWT 발급
    // 의도: code→token 교환을 서버에서 처리 (client_secret 프론트 노출 방지)
    @PostMapping("/oauth/{provider}/callback")
    public ApiResponse<TokenResponse> oauthCallback(
            @PathVariable String provider,
            @Valid @RequestBody OauthCallbackRequest request
    ) {
        AuthProvider authProvider = parseProvider(provider);
        return ApiResponse.ok(oauthLoginService.login(authProvider, request.code()));
    }

    // AUTH-02: 로그인
    // 의도: 이메일·비밀번호 검증 후 JWT 발급
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    // AUTH-05: 로그아웃
    // 의도: RefreshToken 삭제 → 탈취·재사용된 refresh로 재발급 불가
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal JwtUserPrincipal principal) {
        authService.logout(principal.userId());
    }

    // AUTH-04: AccessToken 재발급
    // 의도: Access 만료 시 재로그인 없이 갱신 (Refresh는 DB에 유지)
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.ok(authService.refresh(request));
    }

    // provider path 파싱
    // 의도: URL path(kakao 등)를 enum으로 변환, LOCAL·잘못된 값 차단
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
