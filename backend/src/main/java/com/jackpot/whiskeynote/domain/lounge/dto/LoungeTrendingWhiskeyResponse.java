package com.jackpot.whiskeynote.domain.lounge.dto;

public record LoungeTrendingWhiskeyResponse(
        Long whiskeyId,
        String whiskeyName,
        long mentionCount
) {
}
