package com.jackpot.whiskeynote.domain.admin.controller;

import com.jackpot.whiskeynote.domain.admin.dto.WhiskeyRequestForm;
import com.jackpot.whiskeynote.domain.admin.dto.WhiskeyRequestResponse;
import com.jackpot.whiskeynote.domain.admin.service.WhiskeyRequestService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.SecurityUserAccessor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/whiskey-requests")
@RequiredArgsConstructor
public class WhiskeyRequestController {
    private final WhiskeyRequestService wService;

    // 위스키 등록 요청 목록 조회(사용자, 관리자)
    @GetMapping
    public ApiResponse<Page<WhiskeyRequestResponse>> getRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = SecurityUserAccessor.requireUserId();

        if(status == null || status.equals("all") || status.isBlank()) {
            return ApiResponse.ok(wService.findAllByUserId(userId, page, size));
        } else {
            return ApiResponse.ok(wService.findAllByUserIdAndStatus(userId, status, page, size));
        }
    }
    // 위스키 등록 요청 상세 조회(사용자, 관리자)
    @GetMapping("/{requestId}")
    public ApiResponse<WhiskeyRequestResponse> findById(
            @PathVariable Long requestId
    ) {
        Long userId = SecurityUserAccessor.requireUserId();

        return ApiResponse.ok(wService.findById(userId, requestId));
    }

    // 위스키 등록 요청 등록
    @PostMapping
    public ApiResponse<WhiskeyRequestResponse> createRequest(
            @RequestBody WhiskeyRequestForm form
    ) {
        Long userId = SecurityUserAccessor.requireUserId();

        return ApiResponse.ok(wService.createRequest(userId, form));
    }

    // 위스키 등록 요청 상세 수정
    @PatchMapping("/{requestId}")
    public ApiResponse<WhiskeyRequestResponse> updateRequest(
            @PathVariable Long requestId,
            @RequestBody WhiskeyRequestForm form
    ) {
        Long userId = SecurityUserAccessor.requireUserId();

        return ApiResponse.ok(wService.updateRequest(userId, requestId, form));
    }

    // 위스키 등록 요청 삭제
    @DeleteMapping("/{requestId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRequest(
            @PathVariable Long requestId
    ) {
        Long userId = SecurityUserAccessor.requireUserId();

        wService.deleteRequest(userId, requestId);
    }
}
