package com.jackpot.whiskeynote.domain.lounge.controller;

import com.jackpot.whiskeynote.domain.lounge.dto.LoungePostResponse;
import com.jackpot.whiskeynote.domain.lounge.dto.LoungeTrendingWhiskeyResponse;
import com.jackpot.whiskeynote.domain.lounge.service.LoungeService;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LoungeController {
    private final LoungeService loungeService;

    // 팔로우한 사람 게시물 조회
    @GetMapping("/api/v1/lounge/feed")
    public List<LoungePostResponse> getFeed(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
            ) {
        return loungeService.getLoungeFeed(principal.userId(), page, size);
    }

    // 인기 게시물(조회수 순) — 팔로잉과 무관한 발견 탭
    @GetMapping("/api/v1/lounge/popular")
    public List<LoungePostResponse> getPopular(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return loungeService.getPopularFeed(page, size);
    }

    // 최신 게시물(작성 순) — 팔로잉과 무관한 발견 탭
    @GetMapping("/api/v1/lounge/latest")
    public List<LoungePostResponse> getLatest(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return loungeService.getLatestFeed(page, size);
    }

    @GetMapping("/api/v1/lounge/trending-whiskeys")
    public List<LoungeTrendingWhiskeyResponse> getTrendingWhiskeys(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return loungeService.getTrendingWhiskeys(limit);
    }
}
