package com.jackpot.whiskeynote.domain.taste.note.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TastingNoteCreateRequest(
    Long whiskeyId,
    Short bodyScore,
    Short finishScore,
    Short smokyScore,
    Short spicyScore,
    Short sweetScore,
    String memo,

    @NotNull
    Boolean isDraft,
    List<Long> tagIds
) {}