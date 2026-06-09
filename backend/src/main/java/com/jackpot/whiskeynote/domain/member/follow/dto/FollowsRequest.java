package com.jackpot.whiskeynote.domain.member.follow.dto;

import jakarta.validation.constraints.NotNull;

public record FollowsRequest(
        @NotNull(message = "팔로우할 사용자 ID는 필수입니다.")
        Long targetUserId
){}