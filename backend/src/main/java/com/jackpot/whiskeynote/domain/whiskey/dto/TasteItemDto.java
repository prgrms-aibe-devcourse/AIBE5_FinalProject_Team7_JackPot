package com.jackpot.whiskeynote.domain.whiskey.dto;
// 시음 요약 점수 전달용 DTO
public record TasteItemDto(
        String key,
        String label,
        Integer score
) {
}
