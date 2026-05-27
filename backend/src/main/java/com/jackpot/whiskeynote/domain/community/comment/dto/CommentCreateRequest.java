package com.jackpot.whiskeynote.domain.community.comment.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentCreateRequest(
        @NotBlank String content,
        Long parentCommentId
) {}
