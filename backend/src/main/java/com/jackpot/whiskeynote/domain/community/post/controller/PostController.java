package com.jackpot.whiskeynote.domain.community.post.controller;

import com.jackpot.whiskeynote.domain.community.post.dto.PostCreateRequest;
import com.jackpot.whiskeynote.domain.community.post.dto.PostDetailDto;
import com.jackpot.whiskeynote.domain.community.post.dto.PostSummaryResponse;
import com.jackpot.whiskeynote.domain.community.post.dto.PostUpdateRequest;
import com.jackpot.whiskeynote.domain.community.post.service.PostService;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // POST-01: 글 상세 (비로그인 시 isLiked=false, isOwner=false)
    @GetMapping("/api/v1/posts/{postId}")
    public PostDetailDto getPost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        Long userId = principal != null ? principal.userId() : null;
        return postService.getPost(postId, userId);
    }

    // POST-02: 글 작성
    @PostMapping("/api/v1/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public Long createPost(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody PostCreateRequest request
    ) {
        return postService.createPost(principal.userId(), request);
    }

    // POST-03: 글 수정
    @PatchMapping("/api/v1/posts/{postId}")
    public PostDetailDto updatePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        return postService.updatePost(principal.userId(), postId, request);
    }

    // POST-04: 글 삭제 (soft)
    @DeleteMapping("/api/v1/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        postService.deletePost(principal.userId(), postId);
    }

    // POST-05: 글 좋아요
    @PostMapping("/api/v1/posts/{postId}/likes")
    @ResponseStatus(HttpStatus.CREATED)
    public void likePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        postService.likePost(principal.userId(), postId);
    }

    // POST-06: 글 좋아요 취소
    @DeleteMapping("/api/v1/posts/{postId}/likes")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlikePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        postService.unlikePost(principal.userId(), postId);
    }

    // WH-02-1: 위스키 관련 게시글 (좋아요 순 최대 3개)
    @GetMapping("/api/v1/whiskeys/{whiskeyId}/related-posts")
    public List<PostSummaryResponse> getRelatedPosts(@PathVariable Long whiskeyId) {
        return postService.getRelatedPosts(whiskeyId);
    }
}
