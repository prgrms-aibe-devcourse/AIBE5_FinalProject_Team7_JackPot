package com.jackpot.whiskeynote.domain.member.dto;

public record NicknameAvailabilityResponse(
        String nickname,
        boolean available
) {
    public static NicknameAvailabilityResponse of(String nickname, boolean available) {
        return new NicknameAvailabilityResponse(nickname, available);
    }
}

