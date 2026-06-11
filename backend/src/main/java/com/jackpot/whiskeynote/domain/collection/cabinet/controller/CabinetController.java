package com.jackpot.whiskeynote.domain.collection.cabinet.controller;

import com.jackpot.whiskeynote.domain.collection.cabinet.dto.CabinetStatsResponse;
import com.jackpot.whiskeynote.domain.collection.cabinet.service.CabinetService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.SecurityUserAccessor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CabinetController {

    private final CabinetService cabinetService;

    @GetMapping("/api/v1/users/me/cabinet/stats")
    public ApiResponse<CabinetStatsResponse> getStats() {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(cabinetService.getStats(userId));
    }

    // 타인 캐비넷 통계 — 밴·탈퇴 계정 차단
    @GetMapping("/api/v1/users/{id}/cabinet/stats")
    public ApiResponse<CabinetStatsResponse> getCabinetStatsByUserId(
            @PathVariable Long id
    ) {
        return ApiResponse.ok(cabinetService.getStatsByUserId(id));
    }
}
