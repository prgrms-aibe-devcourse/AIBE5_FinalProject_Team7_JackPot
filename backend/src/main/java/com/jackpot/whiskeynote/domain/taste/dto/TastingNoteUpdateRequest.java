package com.jackpot.whiskeynote.domain.taste.dto;

import java.util.List;

public record TastingNoteUpdateRequest(
    Integer bodyScore,
    Integer finishScore,
    Integer smokyScore,
    Integer spicyScore,
    Integer sweetScore,
    String memo,
    Boolean isDraft,
    List<Long> tagIds
) {}