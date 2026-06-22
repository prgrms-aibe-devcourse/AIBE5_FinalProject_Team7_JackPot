package com.jackpot.whiskeynote.domain.lounge.controller;

import com.jackpot.whiskeynote.domain.lounge.dto.LoungePostResponse;
import com.jackpot.whiskeynote.domain.lounge.dto.LoungeSuggestedUserResponse;
import com.jackpot.whiskeynote.domain.lounge.dto.LoungeTodayResponse;
import com.jackpot.whiskeynote.domain.lounge.dto.LoungeTrendingWhiskeyResponse;
import com.jackpot.whiskeynote.domain.lounge.service.LoungeService;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;
import com.jackpot.whiskeynote.domain.recommendation.service.WhiskeyRecommendationService;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@RestController
@RequiredArgsConstructor
public class LoungeController {
    private final LoungeService loungeService;
    private final WhiskeyRecommendationService whiskeyRecommendationService;

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

    @GetMapping("/api/v1/lounge/recommend-whiskey")
    public List<WhiskeyRecommendationResponse> getRecommendWhiskeys(
        @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        // 동시 갱신으로 낙관적 락 충돌이 나면 재시도. 재시도 시엔 프로필이 이미 fresh라
        // calculateScoreByUser가 재계산 없이 통과 → 정상 추천 반환.
        // StaleObjectState는 트랜잭션 커밋(=서비스 메서드 반환) 시점에 던져지므로 여기서 잡힌다.
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                return whiskeyRecommendationService.recommendByAll(principal.userId());
            } catch (ObjectOptimisticLockingFailureException e) {
                log.warn("추천 낙관적 락 충돌, 재시도 {}/3 userId={}", attempt, principal.userId());
            } catch (Exception e) {
                log.warn("추천 계산 실패 userId={}", principal.userId(), e);
                return List.of();
            }
        }
        // 재시도 모두 실패 시에도 500 대신 빈 목록
        return List.of();
    }

    @GetMapping("/api/v1/lounge/ad-whiskey")
    public List<WhiskeyRecommendationResponse> getAdvertisementWhiskeys(
        @RequestParam(required = false) List<Long> excludeIds) {
        Set<Long> excludes = excludeIds == null ? Set.of() : new HashSet<>(excludeIds);
        return whiskeyRecommendationService.recommendAdvertisementWhiskey(excludes);
    }

    // 오늘의 라운지 — 오늘 새 글 수 / 인기 글 / 화제의 위스키
    @GetMapping("/api/v1/lounge/today")
    public LoungeTodayResponse getToday() {
        return loungeService.getTodaySnapshot();
    }

    // 팔로우 추천 — 본인/이미 팔로우한 유저 제외, 활동 많은 작성자 추천
    @GetMapping("/api/v1/lounge/suggested-users")
    public List<LoungeSuggestedUserResponse> getSuggestedUsers(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return loungeService.getSuggestedUsers(principal.userId(), limit);
    }
}
