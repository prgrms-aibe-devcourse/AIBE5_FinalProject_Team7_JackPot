package com.jackpot.whiskeynote.domain.activity.dto;

public record WhiskeyViewRequest(
    Long userId,
    Long whiskeyId,
    Integer viewDuration
) {
}
