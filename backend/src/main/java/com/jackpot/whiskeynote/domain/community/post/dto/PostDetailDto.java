package com.jackpot.whiskeynote.domain.community.post.dto;

import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;

import java.time.LocalDateTime;
import java.util.List;

public record PostDetailDto(
        Long id,
        Long authorId,
        PostType postType,
        PostCategory category,
        String title,
        String context,
        int likeCount,
        boolean isLiked,
        boolean isOwner,
        List<Long> whiskeyIds,
        int commentCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PostDetailDto from(Post post, boolean isLiked, boolean isOwner,
                                     List<Long> whiskeyIds, int commentCount) {
        return new PostDetailDto(
                post.getId(),
                post.getAuthorId(),
                post.getPostType(),
                post.getCategory(),
                post.getTitle(),
                post.getContext(),
                post.getLikeCount(),
                isLiked,
                isOwner,
                whiskeyIds,
                commentCount,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
