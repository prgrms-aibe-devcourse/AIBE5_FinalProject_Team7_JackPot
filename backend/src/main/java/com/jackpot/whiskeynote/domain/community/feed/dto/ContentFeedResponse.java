package com.jackpot.whiskeynote.domain.community.feed.dto;

import com.jackpot.whiskeynote.domain.community.feed.entity.ContentFeed;
import com.jackpot.whiskeynote.domain.community.feed.entity.FeedSourceType;

import java.time.LocalDateTime;

public record ContentFeedResponse(
        Long id,
        FeedSourceType sourceType,
        String title,
        String url,
        String thumbnailUrl,
        String description,
        String whiskeyKeyword,
        String author,
        String sourceName,
        LocalDateTime publishedAt,
        LocalDateTime createdAt
) {
    public static ContentFeedResponse from(ContentFeed feed) {
        return new ContentFeedResponse(
                feed.getId(),
                feed.getSourceType(),
                feed.getTitle(),
                feed.getUrl(),
                feed.getThumbnailUrl(),
                feed.getDescription(),
                feed.getWhiskeyKeyword(),
                feed.getAuthor(),
                feed.getSourceName(),
                feed.getPublishedAt(),
                feed.getCreatedAt()
        );
    }
}
