package com.jackpot.whiskeynote.domain.taste.survey.dto;

import java.util.List;

public record SurveyResultResponse(
        FlavorProfile profile,
        String userType,
        String userTypeDescription,
        List<WhiskeyRecommendation> recommendations
) {
    public record FlavorProfile(
            int sweetScore,
            int bodyScore,
            int smokyScore,
            int spicyScore,
            int finishScore,
            List<TagInfo> noseTags,
            List<TagInfo> tasteTags
    ) {}

    public record TagInfo(Long id, String name, String imageUrl) {}

    public record WhiskeyRecommendation(
            int rank,
            Long whiskeyId,
            String whiskeyName,
            String imageUrl,
            double score,
            String reason
    ) {}
}
