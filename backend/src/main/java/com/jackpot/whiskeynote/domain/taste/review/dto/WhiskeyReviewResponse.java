package com.jackpot.whiskeynote.domain.taste.review.dto;

import com.jackpot.whiskeynote.domain.taste.review.entity.Review;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WhiskeyReviewResponse(
        Long id,
        Long userId,
        String nickname,
        String profileImageUrl,
        BigDecimal rating,
        String publicText,
        boolean hasAttachedNote,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static WhiskeyReviewResponse from(Review review) {
        return new WhiskeyReviewResponse(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getNickname(),
                review.getUser().getProfileImageUrl(),
                review.getRating(),
                review.getPublicText(),
                review.getAttachedNoteId() != null,
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}