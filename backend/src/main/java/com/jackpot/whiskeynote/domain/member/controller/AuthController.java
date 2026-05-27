package com.jackpot.whiskeynote.domain.member.controller;

import com.jackpot.whiskeynote.domain.member.dto.LoginRequest;
import com.jackpot.whiskeynote.domain.member.dto.RefreshRequest;
import com.jackpot.whiskeynote.domain.member.dto.RegisterRequest;
import com.jackpot.whiskeynote.domain.member.dto.TokenResponse;
import com.jackpot.whiskeynote.domain.member.service.AuthService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.JwtProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 API 컨트롤러
 * - AUTH-01: POST /api/v1/auth/register (회원가입)
 * - AUTH-02: POST /api/v1/auth/login    (로그인)
 * - AUTH-05: POST /api/v1/auth/logout   (로그아웃)
 *
 * 모든 응답은 프론트 unwrapApiData() 와 맞춰 ApiResponse 래퍼로 반환
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtProvider jwtProvider;

    // AUTH-01: 회원가입
    // 성공 응답: { success: true, data: { accessToken, refreshToken, userId, isNewUser }, error: null }
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    // AUTH-02: 로그인
    // isNewUser = true  → 프론트에서 /onboarding 으로 이동
    // isNewUser = false → 프론트에서 /lounge 로 이동
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    // AUTH-05: 로그아웃
    // TODO: JWT 필터 구현 후 @AuthenticationPrincipal로 userId 추출하도록 교체
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader("Authorization") String authHeader) {
        // Bearer {token} 에서 userId 추출
        String token = authHeader.replace("Bearer ", "");
        Long userId = jwtProvider.getUserId(token);
        authService.logout(userId);
    }

    // AUTH-06: AccessToken 재발급
    // RefreshToken이 유효하면 새 AccessToken 발급
    // RefreshToken 만료 시 401 → 프론트에서 로그인 페이지로 이동
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.ok(authService.refresh(request));
    }
}
