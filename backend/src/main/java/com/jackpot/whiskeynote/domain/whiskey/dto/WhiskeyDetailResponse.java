package com.jackpot.whiskeynote.domain.whiskey.dto;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;

import java.util.List;

public record WhiskeyDetailResponse(
        Long id,
        String name,
        String nameEng,
        WhiskeyType type,
        String brand,
        String imageUrl,
        Double abv,
        Integer ageYears,
        String country,
        String cask,
        Integer volume,
        Integer price,
        String costUrl,
        String costUrlSource,

        WhiskeyDescriptionDto description,
        WhiskeyOfficialNote note,

        NoteSummaryDto noteSummary,
        List<TagSummaryDto> tastingTags
) {
}
