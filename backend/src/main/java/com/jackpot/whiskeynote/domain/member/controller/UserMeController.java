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
