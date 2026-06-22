package com.jackpot.whiskeynote.domain.taste.survey.dto;

import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;

import java.util.List;

public record SurveyResultResponse(
        FlavorSummary summary,
        String userType,
        String userTypeDescription,
        List<WhiskeyRecommendationResponse> recommendations
) {
    public record FlavorSummary(
            int sweetScore,
            int bodyScore,
            int smokyScore,
            int spicyScore,
            int finishScore,
            List<TagInfo> noseTags,
            List<TagInfo> tasteTags
    ) {}

    public record TagInfo(Long id, String name, String imageUrl) {}
}
