package com.jackpot.whiskeynote.domain.member.controller;

import com.jackpot.whiskeynote.domain.member.dto.UpdateUserMeRequest;
import com.jackpot.whiskeynote.domain.member.dto.UpdateMyPasswordRequest;
import com.jackpot.whiskeynote.domain.member.dto.UserMeDto;
import com.jackpot.whiskeynote.domain.member.service.UserMeService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 내 계정 API (USER-01, USER-02, USER-04, SET-01)
 *
 * <p>공통: {@code Authorization: Bearer {accessToken}} 필수 ({@link SecurityConfig}).
 * userId는 JWT에서 {@link JwtUserPrincipal}로 주입 — 요청 body에 userId 넣지 않음.
 *
 * <p>프론트 연동:
 * <ul>
 *   <li>조회/수정 → {@code userApi.getMe / updateMe} (MyPage)</li>
 *   <li>프로필 이미지 → presign 업로드 후 {@code profileImageUrl}에 S3 object key 전달</li>
 *   <li>비밀번호 변경(SET-01) → {@code PATCH /users/me/password}, LOCAL 계정만 가능</li>
 *   <li>탈퇴(USER-04) → {@code DELETE /users/me} 후 프론트 {@code clearAuthSession()}</li>
 * </ul>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserMeController {

    private final UserMeService userMeService;

    // USER-01: 내 프로필 조회
    @GetMapping("/me")
    public ApiResponse<UserMeDto> getMe(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ApiResponse.ok(userMeService.getMe(principal.userId()));
    }

    // USER-02: 내 프로필 수정
    @PatchMapping("/me")
    public ApiResponse<UserMeDto> updateMe(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody UpdateUserMeRequest request
    ) {
        return ApiResponse.ok(userMeService.updateMe(principal.userId(), request));
    }

    // USER-04: 탈퇴
    @DeleteMapping("/me")
    public ApiResponse<Void> deleteMe(@AuthenticationPrincipal JwtUserPrincipal principal) {
        userMeService.deleteMe(principal.userId());
        return ApiResponse.ok(null);
    }

    // SET-01: 비밀번호 변경
    @PatchMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateMyPassword(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody UpdateMyPasswordRequest request
    ) {
        userMeService.updateMyPassword(principal.userId(), request);
    }
}
