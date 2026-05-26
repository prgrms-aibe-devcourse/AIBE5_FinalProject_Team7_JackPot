package com.jackpot.whiskeynote.domain.community.dto;

import com.jackpot.whiskeynote.domain.community.entity.Post;
import com.jackpot.whiskeynote.domain.community.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.entity.PostType;

import java.time.LocalDateTime;

public record PostSummaryResponse(
        Long id,
        Long authorId,
        PostType postType,
        PostCategory category,
        String title,
        int likeCount,
        int commentCount,
        LocalDateTime createdAt
) {
    public static PostSummaryResponse from(Post post, int commentCount) {
        return new PostSummaryResponse(
                post.getId(),
                post.getAuthorId(),
                post.getPostType(),
                post.getCategory(),
                post.getTitle(),
                post.getLikeCount(),
                commentCount,
                post.getCreatedAt()
        );
    }
}