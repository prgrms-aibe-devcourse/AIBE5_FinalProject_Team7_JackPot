package com.jackpot.whiskeynote.domain.collection.pick.controller;

import com.jackpot.whiskeynote.domain.collection.pick.dto.PickResponse;
import com.jackpot.whiskeynote.domain.collection.pick.dto.PickStatusResponse;
import com.jackpot.whiskeynote.domain.collection.pick.service.PickService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.SecurityUserAccessor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PickController {
    private final PickService pickService;

    // Pick 목록 조회
    @GetMapping("/api/v1/users/{userId}/picks")
    public ApiResponse<Page<PickResponse>> getMyPick(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok( pickService.findAllByUserId(userId, page, size));
    }
    // 픽 여부 조회 (로그인 필요)
    @GetMapping("/api/v1/whiskeys/{whiskeyId}/pick")
    public ApiResponse<PickStatusResponse> getPickStatus(
            @PathVariable Long whiskeyId
    ) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(pickService.getPickStatus(userId, whiskeyId));
    }

    // Pick 등록
    @PostMapping("/api/v1/whiskeys/{whiskeyId}/pick")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PickResponse> createPick(
            @PathVariable Long whiskeyId
    ) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(pickService.createPick(userId, whiskeyId));
    }

    // Pick 삭제
    @DeleteMapping("/api/v1/whiskeys/{whiskeyId}/pick")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePick(
            @PathVariable Long whiskeyId
    ) {
        Long userId = SecurityUserAccessor.requireUserId();
        pickService.deletePick(userId, whiskeyId);
    }
}
