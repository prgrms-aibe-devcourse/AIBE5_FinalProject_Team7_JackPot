package com.jackpot.whiskeynote.domain.taste.note.dto;

import java.util.List;

public record TastingNoteUpdateRequest(
    Short bodyScore,
    Short finishScore,
    Short smokyScore,
    Short spicyScore,
    Short sweetScore,
    String memo,
    Boolean isDraft,
    List<Long> tagIds
) {}