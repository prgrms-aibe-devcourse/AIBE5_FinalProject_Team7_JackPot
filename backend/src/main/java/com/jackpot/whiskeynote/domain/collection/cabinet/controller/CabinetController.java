package com.jackpot.whiskeynote.domain.collection.cabinet.controller;

import com.jackpot.whiskeynote.domain.collection.cabinet.dto.CabinetStatsResponse;
import com.jackpot.whiskeynote.domain.collection.cabinet.service.CabinetService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.SecurityUserAccessor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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
}
