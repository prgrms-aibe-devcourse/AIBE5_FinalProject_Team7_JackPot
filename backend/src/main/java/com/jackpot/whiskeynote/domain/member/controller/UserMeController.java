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
 * 내 계정 API 컨트롤러
 * - USER-01: GET    /api/v1/users/me           (내 프로필 조회)
 * - USER-02: PATCH  /api/v1/users/me           (내 프로필 수정)
 * - USER-04: DELETE /api/v1/users/me           (탈퇴)
 * - SET-01:  PATCH  /api/v1/users/me/password   (비밀번호 변경, LOCAL만)
 *
 * 공통: Authorization Bearer 필수, userId는 JWT에서 주입 (body에 userId 넣지 않음)
 * 프론트: userApi (MyPage) — profileImageUrl은 S3 object key
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
