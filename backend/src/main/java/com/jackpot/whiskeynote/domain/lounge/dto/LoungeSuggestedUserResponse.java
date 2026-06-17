package com.jackpot.whiskeynote.domain.lounge.dto;

/** 라운지 팔로우 추천 유저 응답 */
public record LoungeSuggestedUserResponse(
        Long userId,
        String nickname,
        String profileImageUrl
) {
}
