package com.jackpot.whiskeynote.domain.taste.tag.dto;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;

public record TagResponse(
    Long id,
    TagCategory category,
    String name,
    String nameEng,
    String description,
    String example,
    Integer displayOrder,
    String imageUrl
) {
    public static TagResponse from(Tag t) {
        return new TagResponse(
            t.getId(), t.getCategory(), t.getName(), t.getNameEng(),
            t.getDescription(), t.getExample(), t.getDisplayOrder(), t.getImageUrl()
        );
    }
}
