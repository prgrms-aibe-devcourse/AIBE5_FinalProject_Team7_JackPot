package com.jackpot.whiskeynote.domain.community.comment.dto;

import com.jackpot.whiskeynote.domain.community.comment.entity.PostComment;

import java.time.LocalDateTime;
import java.util.List;

public record CommentTreeResponse(
        Long id,
        Long userId,
        String nickname,
        String content,
        boolean isDeleted,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CommentTreeResponse> replies
) {
    private static final String DELETED_CONTENT = "삭제된 댓글입니다.";

    public static CommentTreeResponse from(PostComment comment, String nickname, List<CommentTreeResponse> replies) {
        boolean deleted = comment.isDeleted();
        return new CommentTreeResponse(
                comment.getId(),
                deleted ? null : comment.getUserId(),
                deleted ? null : nickname,
                deleted ? DELETED_CONTENT : comment.getContent(),
                deleted,
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replies
        );
    }
}
