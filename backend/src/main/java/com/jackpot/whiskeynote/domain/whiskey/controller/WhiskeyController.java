package com.jackpot.whiskeynote.domain.whiskey.controller;

import com.jackpot.whiskeynote.domain.activity.service.WhiskeyViewLogService;
import com.jackpot.whiskeynote.domain.taste.review.dto.WhiskeyReviewResponse;
import com.jackpot.whiskeynote.domain.taste.review.dto.WhiskeyReviewStats;
import com.jackpot.whiskeynote.domain.taste.review.service.ReviewService;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyDetailResponse;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyFilterRequest;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.search.dto.WhiskeyKeywordCorrectionResponse;
import com.jackpot.whiskeynote.domain.whiskey.search.dto.WhiskeyKeywordSuggestResponse;
import com.jackpot.whiskeynote.domain.whiskey.search.service.WhiskeySearchService;
import com.jackpot.whiskeynote.domain.recommendation.service.WhiskeyRecommendationService;
import com.jackpot.whiskeynote.domain.whiskey.service.WhiskeyService;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WhiskeyController {
    private final WhiskeyService whiskeyService;
    private final ReviewService reviewService;
    private final WhiskeySearchService whiskeySearchService;
    private final WhiskeyRecommendationService whiskeyRecommendationService;
    private final WhiskeyViewLogService whiskeyViewLogService;

    // 위스키 전체 조회 (페이징)
    @GetMapping("/api/v1/whiskeys")
    public Page<WhiskeyCardResponse> getWhiskeys(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ){
        return whiskeyService.getWhiskeys(page, size);
    }
    // 위스키 이름 검색 (포함검색, 대소문자 구분X)
    @GetMapping("/api/v1/whiskeys/search")
    public Page<WhiskeyCardResponse> searchWhiskeys(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return whiskeyService.searchWhiskeys(q, page, size);
    }
    // 위스키 필터링 검색
    @GetMapping("/api/v1/whiskeys/filter")
    public Page<WhiskeyCardResponse> filterWhiskeys(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<WhiskeyType> types,
            @RequestParam(required = false) List<String> noseTags,
            @RequestParam(required = false) List<String> tasteTags,
            @RequestParam(required = false) Double minAbv,
            @RequestParam(required = false) Double maxAbv,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ){
        WhiskeyFilterRequest request = new WhiskeyFilterRequest(
                keyword,
                types,
                noseTags,
                tasteTags,
                minAbv,
                maxAbv,
                minAge,
                maxAge,
                page,
                size
        );

        return whiskeyService.filterWhiskeys(request);
    }
    // 위스키 상세 조회
    @GetMapping("/api/v1/whiskeys/{id}")
    public WhiskeyDetailResponse getWhiskeyDetail(@PathVariable Long id) {
        return whiskeyService.getWhiskeyDetail(id);
    }
    // 위스키 리뷰 조회
    @GetMapping("/api/v1/whiskeys/{id}/reviews")
    public Page<WhiskeyReviewResponse> getWhiskeyReviews(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return reviewService.getReviewsByWhiskey(id, userId, page, size);
    }
    // 위스키 리뷰 스탯 조회
    @GetMapping("/api/v1/whiskeys/{id}/reviewstats")
    public WhiskeyReviewStats getWhiskeyReviewStats(@PathVariable Long id) {
        return reviewService.getAverageRating(id);
    }

    // 위스키 검색 키워드 자동완성
    @GetMapping("/api/v1/whiskeys/autocomplete")
    public List<WhiskeyKeywordSuggestResponse> autocompleteKeyword(
            @RequestParam String q,
            @RequestParam(defaultValue = "8") int size
    ) {
        return whiskeySearchService.autocompleteKeyword(q, size);
     }
     // 위스키 오타 수정 검색
    @GetMapping("/api/v1/whiskeys/search/correction")
    public WhiskeyKeywordCorrectionResponse correctWhiskeyKeyword(@RequestParam String q) {
         return whiskeySearchService.correctKeyword(q);
    }

    // 위스키 페이지에서의 추천 위스키
    @GetMapping("/api/v1/whiskeys/{id}/similar")
    public List<WhiskeyRecommendationResponse> similarWhiskeys(@PathVariable Long id) {
        return whiskeyRecommendationService.recommendByWhiskey(id);
    }

    // 로그인 한 유저는, 해당 페이지에서 일정 시간 이상 머물면, 그 사실을 서버에 전달
    @PostMapping("/api/v1/whiskeys/{id}/view-logs")
    public void recordWhiskeyViewLog(
        @PathVariable Long id,
        @AuthenticationPrincipal JwtUserPrincipal principal) {
        Long userId = principal != null ? principal.userId() : null;
        whiskeyViewLogService.createWhiskeyViewLog(userId, id);
    }

}
