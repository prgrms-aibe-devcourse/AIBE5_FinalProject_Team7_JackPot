package com.jackpot.whiskeynote.domain.member.follow.dto;

import com.jackpot.whiskeynote.domain.member.follow.entity.Follows;

import java.time.LocalDateTime;

public record FollowsResponse(
        Long id,
        Long followerId,
        Long followingId,
        LocalDateTime createdAt
) {
    public static FollowsResponse from(Follows follows) {
        return new FollowsResponse(
                follows.getId(),
                follows.getFollowerId(),
                follows.getFollowingId(),
                follows.getCreatedAt()
        );
    }
}