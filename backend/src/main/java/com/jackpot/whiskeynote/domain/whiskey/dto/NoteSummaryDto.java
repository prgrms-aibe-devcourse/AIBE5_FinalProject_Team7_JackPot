package com.jackpot.whiskeynote.domain.whiskey.dto;

import java.util.List;

// 시음요약 DTO
public record NoteSummaryDto(
        Integer noteCount,
        Integer bodyScore,
        Integer finishScore,
        Integer smokyScore,
        Integer spicyScore,
        Integer sweetScore,
        List<TasteItemDto> tasteItems
) {
}
