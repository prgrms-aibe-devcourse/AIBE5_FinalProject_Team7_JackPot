package com.jackpot.whiskeynote.domain.community.comment.controller;

import com.jackpot.whiskeynote.domain.community.comment.dto.CommentCreateRequest;
import com.jackpot.whiskeynote.domain.community.comment.dto.CommentTreeResponse;
import com.jackpot.whiskeynote.domain.community.comment.dto.CommentUpdateRequest;
import com.jackpot.whiskeynote.domain.community.comment.service.CommentService;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // CMT-01: 댓글 목록 (tree)
    @GetMapping("/api/v1/posts/{postId}/comments")
    public List<CommentTreeResponse> getComments(@PathVariable Long postId) {
        return commentService.getComments(postId);
    }

    // CMT-02: 댓글 작성 (대댓글 포함)
    @PostMapping("/api/v1/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public Long createComment(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody CommentCreateRequest request
    ) {
        return commentService.createComment(principal.userId(), postId, request);
    }

    // CMT-03: 댓글 삭제 (soft)
    @DeleteMapping("/api/v1/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        commentService.deleteComment(principal.userId(), commentId);
    }

    // CMT-04: 댓글 수정
    @PatchMapping("/api/v1/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody CommentUpdateRequest request
    ) {
        commentService.updateComment(principal.userId(), commentId, request);
    }
}
