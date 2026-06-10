package com.jackpot.whiskeynote.domain.lounge.dto;

import com.jackpot.whiskeynote.domain.community.post.entity.Post;

public record LoungePostResponse(
        Long postId,
        Long authorId,
        String authorNickname,
        String title,
        String context,
        String createdAt
) {
    public static LoungePostResponse from(Post post,String authorNickname){
        return new LoungePostResponse(
                post.getId(),
                post.getAuthorId(),
                authorNickname,
                post.getTitle(),
                post.getContext(),
                post.getCreatedAt().toString()
        );
    }
}
