package com.jackpot.whiskeynote.domain.whiskey.dto;

import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;

public record TagSummaryDto(
        Long tagId,
        String name,
        TagCategory category,
        String imageUrl,
        Integer count
) {
}
