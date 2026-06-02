package com.jackpot.whiskeynote.domain.taste.review.dto;

public record ReviewLikeResponse(
        Long reviewId,
        long likeCount,
        boolean likedByMe
) {
}
