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
 * 인증 API 컨트롤러 (AUTH-01 ~ AUTH-05)
 *
 * <p>프론트 연동 요약:
 * <ul>
 *   <li>이메일 로그인/회원가입 → {@code authApi.login/register} → {@code TokenResponse}를 localStorage에 저장</li>
 *   <li>소셜 로그인(AUTH-03) → 2단계 흐름 (아래 참고)</li>
 *   <li>로그아웃 → Authorization Bearer + {@code POST /auth/logout}</li>
 *   <li>토큰 갱신 → {@code POST /auth/refresh} (아직 프론트 자동 갱신 미구현)</li>
 * </ul>
 *
 * <p>소셜 로그인 흐름 (프론트·백엔드 협업):
 * <ol>
 *   <li>프론트: {@code window.location.href = '/api/v1/auth/oauth/kakao'} (LoginPage.handleOauth)</li>
 *   <li>백엔드: {@code OauthRedirectService}가 provider Authorization URL로 302 redirect</li>
 *   <li>Provider: 사용자 동의 후 {@code /oauth/kakao/callback?code=...} 로 redirect (프론트 라우트)</li>
 *   <li>프론트: {@code OauthCallbackPage}가 code를 읽어 {@code POST /auth/oauth/kakao/callback} 호출</li>
 *   <li>백엔드: {@code OauthLoginService} → JWT 발급 → 프론트가 localStorage 저장 후 라운지/온보딩 이동</li>
 * </ol>
 *
 * <p>설정: EC2 {@code .env}의 {@code OAUTH_*_*} 값 → {@code application-prod.yaml} → {@code OauthProperties}.
 * redirect-uri는 provider 콘솔·프론트 {@code PATHS.OAUTH_CALLBACK}·백엔드 env 세 곳이 동일해야 함.
 *
 * <p>모든 응답은 프론트 {@code unwrapApiData()}와 맞춰 {@code ApiResponse} 래퍼로 반환.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OauthRedirectService oauthRedirectService;
    private final OauthLoginService oauthLoginService;

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

    // 소셜 로그인 콜백: code -> provider token 교환 -> 우리 JWT 발급
    @PostMapping("/oauth/{provider}/callback")
    public ApiResponse<TokenResponse> oauthCallback(
            @PathVariable String provider,
            @Valid @RequestBody OauthCallbackRequest request
    ) {
        AuthProvider authProvider = parseProvider(provider);
        return ApiResponse.ok(oauthLoginService.login(authProvider, request.code()));
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
