package com.jackpot.whiskeynote.domain.taste.dto;

import com.jackpot.whiskeynote.domain.taste.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.entity.TastingNote;

import java.time.LocalDateTime;
import java.util.List;

public record TastingNoteResponse(
    Long id,
    Long whiskeyId,
    String whiskeyName,
    Integer bodyScore,
    Integer finishScore,
    Integer smokyScore,
    Integer spicyScore,
    Integer sweetScore,
    String memo,
    Boolean isDraft,
    List<String> tags,
    LocalDateTime createdAt
) {
    public static TastingNoteResponse from(TastingNote note, List<Tag> tags) {
        return new TastingNoteResponse(
            note.getId(),
            note.getWhiskey().getId(),
            note.getWhiskey().getName(),
            note.getBodyScore(),
            note.getFinishScore(),
            note.getSmokyScore(),
            note.getSpicyScore(),
            note.getSweetScore(),
            note.getMemo(),
            note.getIsDraft(),
            tags.stream()
                .map(Tag::getName)
                .toList(),
            note.getCreatedAt()
        );
    }

}
