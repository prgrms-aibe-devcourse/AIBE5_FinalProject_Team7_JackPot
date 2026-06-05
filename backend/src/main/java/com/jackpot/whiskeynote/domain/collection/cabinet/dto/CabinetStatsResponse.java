package com.jackpot.whiskeynote.domain.collection.cabinet.dto;

public record CabinetStatsResponse(
        Long pickCount,
        Long wishCount,
        Long reviewCount,
        Long noteCount
) {
}
