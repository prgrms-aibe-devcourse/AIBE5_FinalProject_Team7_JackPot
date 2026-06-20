package com.jackpot.whiskeynote.domain.taste.review.dto;

import com.jackpot.whiskeynote.domain.taste.review.entity.Review;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WhiskeyReviewResponse(
        Long id,
        Long userId,
        Long whiskeyId,
        String whiskeyName,
        String whiskeyImageUrl,
        String nickname,
        String profileImageUrl,
        BigDecimal rating,
        String publicText,
        Long attachedNoteId,
        boolean hasAttachedNote,
        long likeCount,
        boolean likedByMe,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static WhiskeyReviewResponse from(
            Review review,
            long likeCount,
            boolean likedByMe
    ) {
        return new WhiskeyReviewResponse(
                review.getId(),
                review.getUser().getId(),
                review.getWhiskey().getId(),
                review.getWhiskey().getName(),
                review.getWhiskey().getImageUrl(),
                review.getUser().getNickname(),
                review.getUser().getProfileImageUrl(),
                review.getRating(),
                review.getPublicText(),
                review.getAttachedNoteId(),
                review.getAttachedNoteId() != null,
                likeCount,
                likedByMe,
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }

    public static WhiskeyReviewResponse from(Review review) {
        return from(review, 0, false);
    }
}