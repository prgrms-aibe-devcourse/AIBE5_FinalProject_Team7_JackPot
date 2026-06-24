package com.jackpot.whiskeynote.domain.recommendation.dto;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;

public record WhiskeyRecommendationResponse(
    Long id,
    String name,
    String type,
    String imageUrl,
    Double adv,
    String country,
    Integer ageYears,
    Double avgRating,
    Double score,
    String reason
) {
    public static WhiskeyRecommendationResponse from(WhiskeysNoteCache cache, Double score) {
        return new WhiskeyRecommendationResponse(
            cache.getWhiskey().getId(),
            cache.getWhiskey().getName(),
            cache.getWhiskey().getType().name(),
            cache.getWhiskey().getImageUrl(),
            cache.getWhiskey().getAbv(),
            cache.getWhiskey().getCountry(),
            cache.getWhiskey().getAgeYears(),
            0.0,
            score,
            ""
        );
    }

    public WhiskeyRecommendationResponse withAvgRating(Double avgRating) {
        return new WhiskeyRecommendationResponse(
            id, name, type, imageUrl, adv, country, ageYears,
            avgRating, score, reason
        );
    }

    public WhiskeyRecommendationResponse withScore(Double score) {
        return new WhiskeyRecommendationResponse(
            id, name, type, imageUrl, adv, country, ageYears,
            avgRating, score, reason
        );
    }

}
