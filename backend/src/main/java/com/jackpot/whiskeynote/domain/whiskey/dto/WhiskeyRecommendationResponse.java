package com.jackpot.whiskeynote.domain.whiskey.dto;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;

public record WhiskeyRecommendationResponse(
    Long whiskeyId,
    String name,
    Double score
) {
    public static WhiskeyRecommendationResponse from(WhiskeysNoteCache cache, Double score) {
        return new WhiskeyRecommendationResponse(
            cache.getWhiskey().getId(),
            cache.getWhiskey().getName(),
            score
        );
    }
}
