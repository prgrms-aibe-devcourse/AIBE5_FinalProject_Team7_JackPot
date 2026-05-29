package com.jackpot.whiskeynote.domain.taste.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TastingNoteCreateRequest(
    Long whiskeyId,
    Integer bodyScore,
    Integer finishScore,
    Integer smokyScore,
    Integer spicyScore,
    Integer sweetScore,
    String memo,

    @NotNull
    Boolean isDraft,
    List<Long> tagIds
) {}