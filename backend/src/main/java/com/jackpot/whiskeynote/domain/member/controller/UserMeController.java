package com.jackpot.whiskeynote.domain.member.controller;

import com.jackpot.whiskeynote.domain.member.dto.UpdateUserMeRequest;
import com.jackpot.whiskeynote.domain.member.dto.UserMeDto;
import com.jackpot.whiskeynote.domain.member.service.UserMeService;
import com.jackpot.whiskeynote.global.exception.UnauthorizedException;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.JwtProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserMeController {

    private final UserMeService userMeService;
    private final JwtProvider jwtProvider;

    // MVP: Authorization 헤더에서 userId를 추출해 처리합니다.
    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid Authorization header.");
        }
        String token = authHeader.substring("Bearer ".length());
        return jwtProvider.getUserId(token);
    }

    // USER-01: 내 프로필 조회
    @GetMapping("/me")
    public ApiResponse<UserMeDto> getMe(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ApiResponse.ok(userMeService.getMe(userId));
    }

    // USER-02: 내 프로필 수정
    @PatchMapping("/me")
    public ApiResponse<UserMeDto> updateMe(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateUserMeRequest request
    ) {
        Long userId = extractUserId(authHeader);
        return ApiResponse.ok(userMeService.updateMe(userId, request));
    }

    // USER-04: 탈퇴
    @DeleteMapping("/me")
    public ApiResponse<Void> deleteMe(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        userMeService.deleteMe(userId);
        return ApiResponse.ok(null);
    }
}

