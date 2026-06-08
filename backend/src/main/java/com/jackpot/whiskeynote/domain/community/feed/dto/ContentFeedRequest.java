package com.jackpot.whiskeynote.domain.community.feed.dto;

import com.jackpot.whiskeynote.domain.community.feed.entity.FeedSourceType;

import java.time.LocalDateTime;

public record ContentFeedRequest(
        FeedSourceType sourceType,
        String title,
        String url,
        String thumbnailUrl,
        String description,
        String whiskeyKeyword,
        LocalDateTime publishedAt
) {}
