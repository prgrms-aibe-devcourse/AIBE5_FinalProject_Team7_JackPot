package com.jackpot.whiskeynote.domain.community.column.dto;

import com.jackpot.whiskeynote.domain.community.column.entity.ColumnSourceType;

import java.time.LocalDateTime;

public record WhiskeyColumnRequest(
        ColumnSourceType sourceType,
        String title,
        String url,
        String thumbnailUrl,
        String description,
        String whiskeyKeyword,
        LocalDateTime publishedAt
) {}
