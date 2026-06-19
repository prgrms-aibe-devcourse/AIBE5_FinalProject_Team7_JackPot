package com.jackpot.whiskeynote.domain.lounge.controller;

import com.jackpot.whiskeynote.domain.recommendation.dto.TasteMatchDto;
import com.jackpot.whiskeynote.domain.lounge.service.TasteMatchService;
import com.jackpot.whiskeynote.domain.recommendation.service.UserRecommendationService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lounge/match")
@RequiredArgsConstructor
public class TasteMatchController {

    private final TasteMatchService tasteMatchService;
    private final UserRecommendationService userRecommendationService;

    /**
     * 라운지 위젯용 — 랜덤 1명
     * GET /api/v1/taste/match/random
     */
    @GetMapping("/random")
    public ApiResponse<TasteMatchDto> getRandom(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        // null이면 매칭 유저 없음 — 빈 data로 200 반환 (프론트에서 isError 없이 처리 가능)
        TasteMatchDto result = tasteMatchService.getRandomMatch(principal.userId());
        return result != null ? ApiResponse.ok(result) : ApiResponse.ok(null);
    }

    /**
     * 취향 비슷한 유저 목록 — 상위 10명
     * GET /api/v1/taste/match
     */
    @GetMapping
    public ApiResponse<List<TasteMatchDto>> getList(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ApiResponse.ok(userRecommendationService.recommendByAll(principal.userId()));
    }
}
