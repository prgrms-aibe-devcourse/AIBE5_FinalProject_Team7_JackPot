package com.jackpot.whiskeynote.domain.taste.review.controller;

import com.jackpot.whiskeynote.domain.taste.review.dto.ReviewCreateRequest;
import com.jackpot.whiskeynote.domain.taste.review.dto.ReviewUpdateRequest;
import com.jackpot.whiskeynote.domain.taste.review.dto.WhiskeyReviewResponse;
import com.jackpot.whiskeynote.domain.taste.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    // 내 리뷰 조회
    @GetMapping("/api/v1/reviews")
    public Page<WhiskeyReviewResponse> getMyReviews(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return reviewService.getMyReviews(userId, page, size);
    }
    // 특정 위스키 리뷰 조회
    @PostMapping("/api/v1/whiskeys/{whiskeyId}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public WhiskeyReviewResponse createReview(
            @PathVariable Long whiskeyId,
            @RequestParam Long userId,
            @Valid @RequestBody ReviewCreateRequest request
    ) {
        return reviewService.createReview(userId, whiskeyId, request);
    }
    // 리뷰 수정
    @PatchMapping("/api/v1/reviews/{reviewId}")
    public WhiskeyReviewResponse updateReview(
            @PathVariable Long reviewId,
            @RequestParam Long userId,
            @Valid @RequestBody ReviewUpdateRequest request
    ) {
        return reviewService.updateReview(userId, reviewId, request);
    }
    // 리뷰 삭제
    @DeleteMapping("/api/v1/reviews/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(
            @PathVariable Long reviewId,
            @RequestParam Long userId
    ) {
        reviewService.deleteReview(userId, reviewId);
    }
}
