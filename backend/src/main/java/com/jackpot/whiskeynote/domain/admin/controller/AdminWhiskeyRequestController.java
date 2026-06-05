package com.jackpot.whiskeynote.domain.admin.controller;

import com.jackpot.whiskeynote.domain.admin.dto.WhiskeyRequestResponse;
import com.jackpot.whiskeynote.domain.admin.dto.WhiskeyRequestReviewRequest;
import com.jackpot.whiskeynote.domain.admin.service.WhiskeyRequestService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.SecurityUserAccessor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/whiskey-requests")
@RequiredArgsConstructor
public class AdminWhiskeyRequestController {
    private final WhiskeyRequestService wService;

    // 위스키 등록 요청 목록 조회(관리자 전용 — 전체 조회)
    @GetMapping
    public ApiResponse<Page<WhiskeyRequestResponse>> getRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (status == null || status.equals("all") || status.isBlank()) {
            return ApiResponse.ok(wService.findAllForAdmin(page, size));
        } else {
            return ApiResponse.ok(wService.findAllByStatusForAdmin(status, page, size));
        }
    }

    // 위스키 등록 요청 상세 조회(사용자, 관리자)
    @GetMapping("/{requestId}")
    public ApiResponse<WhiskeyRequestResponse> getRequest(@PathVariable Long requestId) {
        Long userId = SecurityUserAccessor.requireUserId();

        return ApiResponse.ok(wService.findById(userId, requestId));
    }

    // 위스키 등록 요청 승인/반려 처리(관리자)
    @PatchMapping("/{requestId}")
    public ApiResponse<WhiskeyRequestResponse> reviewRequest(
            @PathVariable Long requestId,
            @RequestBody WhiskeyRequestReviewRequest req
    ) {
        Long userId = SecurityUserAccessor.requireUserId();

        return ApiResponse.ok(wService.reviewRequest(userId, requestId, req));
    }
}
