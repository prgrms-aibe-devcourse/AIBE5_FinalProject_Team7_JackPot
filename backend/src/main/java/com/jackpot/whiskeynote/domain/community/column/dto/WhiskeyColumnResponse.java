package com.jackpot.whiskeynote.domain.community.column.dto;

import com.jackpot.whiskeynote.domain.community.column.entity.ColumnSourceType;
import com.jackpot.whiskeynote.domain.community.column.entity.WhiskeyColumn;

import java.time.LocalDateTime;

public record WhiskeyColumnResponse(
        Long id,
        ColumnSourceType sourceType,
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
    public static WhiskeyColumnResponse from(WhiskeyColumn col) {
        return new WhiskeyColumnResponse(
                col.getId(),
                col.getSourceType(),
                col.getTitle(),
                col.getUrl(),
                col.getThumbnailUrl(),
                col.getDescription(),
                col.getWhiskeyKeyword(),
                col.getAuthor(),
                col.getSourceName(),
                col.getPublishedAt(),
                col.getCreatedAt()
        );
    }
}
