package com.jackpot.whiskeynote.domain.taste.note.dto;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;

public record TastingNoteTagResponse(
        Long id,
        TagCategory category,
        String name,
        String imageUrl
) {
    public static TastingNoteTagResponse from(Tag tag) {
        return new TastingNoteTagResponse(
                tag.getId(),
                tag.getCategory(),
                tag.getName(),
                tag.getImageUrl()
        );
    }
}
