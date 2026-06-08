package com.jackpot.whiskeynote.domain.community.feed.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "content_feeds")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentFeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private FeedSourceType sourceType;

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

    public static ContentFeed create(FeedSourceType sourceType, String title, String url,
                                     String thumbnailUrl, String description,
                                     String whiskeyKeyword, LocalDateTime publishedAt) {
        ContentFeed feed = new ContentFeed();
        feed.sourceType = sourceType;
        feed.title = title;
        feed.url = url;
        feed.thumbnailUrl = thumbnailUrl;
        feed.description = description;
        feed.whiskeyKeyword = whiskeyKeyword;
        feed.publishedAt = publishedAt;
        feed.createdAt = LocalDateTime.now();
        return feed;
    }
}
