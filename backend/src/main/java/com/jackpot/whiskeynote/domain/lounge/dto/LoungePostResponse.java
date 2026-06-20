package com.jackpot.whiskeynote.domain.lounge.dto;

import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;

import java.util.List;

public record LoungePostResponse(
        Long postId,
        Long authorId,
        String authorNickname,
        String authorProfileImageUrl,
        String title,
        String context,
        String createdAt,
        PostType postType,
        PostCategory category,
        int likeCount,
        int viewCount,
        int commentCount,
        List<String> whiskeyNames
) {
    public static LoungePostResponse from(Post post, String authorNickname, String authorProfileImageUrl,
                                          int commentCount, List<String> whiskeyNames) {
        return new LoungePostResponse(
                post.getId(),
                post.getAuthorId(),
                authorNickname,
                authorProfileImageUrl,
                post.getTitle(),
                post.getContext(),
                post.getCreatedAt().toString(),
                post.getPostType(),
                post.getCategory(),
                post.getLikeCount(),
                post.getViewCount(),
                commentCount,
                whiskeyNames
        );
    }
}
