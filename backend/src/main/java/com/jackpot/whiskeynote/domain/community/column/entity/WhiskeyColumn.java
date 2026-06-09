package com.jackpot.whiskeynote.domain.community.column.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "whiskey_columns")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WhiskeyColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private ColumnSourceType sourceType;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(nullable = false, length = 1024)
    private String url;

    @Column(name = "thumbnail_url", length = 1024)
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "whiskey_keyword", length = 255)
    private String whiskeyKeyword;

    @Column(length = 200)
    private String author;

    @Column(name = "source_name", length = 200)
    private String sourceName;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static WhiskeyColumn create(ColumnSourceType sourceType, String title, String url,
                                       String thumbnailUrl, String description,
                                       String whiskeyKeyword, LocalDateTime publishedAt) {
        WhiskeyColumn col = new WhiskeyColumn();
        col.sourceType = sourceType;
        col.title = title;
        col.url = url;
        col.thumbnailUrl = thumbnailUrl;
        col.description = description;
        col.whiskeyKeyword = whiskeyKeyword;
        col.publishedAt = publishedAt;
        col.createdAt = LocalDateTime.now();
        return col;
    }
}
