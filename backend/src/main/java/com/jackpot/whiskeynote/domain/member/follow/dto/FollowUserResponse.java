package com.jackpot.whiskeynote.domain.member.follow.dto;

import com.jackpot.whiskeynote.domain.member.entity.Users;

public record FollowUserResponse(
        Long userId,
        String nickname,
        String profileImageUrl
) {
    public static FollowUserResponse from(Users user) {
        return new FollowUserResponse(
                user.getId(),
                user.getNickname(),
                user.getProfileImageUrl()
        );
    }
}
