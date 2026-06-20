package com.jackpot.whiskeynote.domain.taste.note.dto;

import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;

import java.time.LocalDateTime;
import java.util.List;

public record TastingNoteResponse(
        Long id,
        Long whiskeyId,
        String whiskeyName,
        String whiskeyImageUrl,
        Short bodyScore,
        Short finishScore,
        Short smokyScore,
        Short spicyScore,
        Short sweetScore,
        String memo,
        List<TastingNoteTagResponse> tags,
        boolean isDraft,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TastingNoteResponse from(TastingNote note) {
        return from(note, List.of());
    }

    public static TastingNoteResponse from(TastingNote note, List<TastingNoteTagResponse> tags) {
        return new TastingNoteResponse(
                note.getId(),
                note.getWhiskey().getId(),
                note.getWhiskey().getName(),
                note.getWhiskey().getImageUrl(),
                note.getBodyScore(),
                note.getFinishScore(),
                note.getSmokyScore(),
                note.getSpicyScore(),
                note.getSweetScore(),
                note.getMemo(),
                tags,
                Boolean.TRUE.equals(note.getIsDraft()),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }
}
