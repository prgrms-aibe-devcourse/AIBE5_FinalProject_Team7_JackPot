package com.jackpot.whiskeynote.domain.whiskey.dto;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;

import java.util.List;

public record WhiskeyDetailResponse(
        Long id,
        String name,
        WhiskeyType type,
        String imageUrl,
        Double abv,
        Integer ageYears,
        String region,
        String country,
        String cask,

        NoteSummaryDto noteSummary,
        List<TagSummaryDto> tastingTags
) {
}
