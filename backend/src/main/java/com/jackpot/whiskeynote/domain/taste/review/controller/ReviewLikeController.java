package com.jackpot.whiskeynote.domain.taste.review.controller;

import com.jackpot.whiskeynote.domain.taste.review.dto.ReviewLikeResponse;
import com.jackpot.whiskeynote.domain.taste.review.service.ReviewLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;

    @PostMapping("/api/v1/reviews/{reviewId}/likes")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewLikeResponse likeReview(
            @PathVariable Long reviewId,
            @RequestParam Long userId
    ) {
        return reviewLikeService.likeReview(reviewId, userId);
    }

    @DeleteMapping("/api/v1/reviews/{reviewId}/likes")
    public ReviewLikeResponse unlikeReview(
            @PathVariable Long reviewId,
            @RequestParam Long userId
    ) {
        return reviewLikeService.unlikeReview(reviewId, userId);
    }

    @GetMapping("/api/v1/reviews/{reviewId}/likes")
    public ReviewLikeResponse getReviewLikeStatus(
            @PathVariable Long reviewId,
            @RequestParam(required = false) Long userId
    ) {
        return reviewLikeService.getReviewLikeStatus(reviewId, userId);
    }
}
