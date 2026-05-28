package com.jackpot.whiskeynote.domain.community.post.controller;

import com.jackpot.whiskeynote.domain.community.post.dto.PostCreateRequest;
import com.jackpot.whiskeynote.domain.community.post.dto.PostDetailDto;
import com.jackpot.whiskeynote.domain.community.post.dto.PostSummaryResponse;
import com.jackpot.whiskeynote.domain.community.post.dto.PostUpdateRequest;
import com.jackpot.whiskeynote.domain.community.post.service.PostService;
import com.jackpot.whiskeynote.global.security.SecurityUserAccessor;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // POST-01: 글 상세 (로그인 시 isLiked/isOwner 반영)
    @GetMapping("/api/v1/posts/{postId}")
    public PostDetailDto getPost(@PathVariable Long postId) {
        return postService.getPost(postId, SecurityUserAccessor.currentUserIdOrNull());
    }

    // POST-02: 글 작성
    @PostMapping("/api/v1/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public Long createPost(@Valid @RequestBody PostCreateRequest request) {
        return postService.createPost(SecurityUserAccessor.requireUserId(), request);
    }

    // POST-03: 글 수정
    @PatchMapping("/api/v1/posts/{postId}")
    public PostDetailDto updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        Long userId = SecurityUserAccessor.requireUserId();
        return postService.updatePost(userId, postId, request);
    }

    // POST-04: 글 삭제 (soft)
    @DeleteMapping("/api/v1/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable Long postId) {
        postService.deletePost(SecurityUserAccessor.requireUserId(), postId);
    }

    // POST-05: 글 좋아요
    @PostMapping("/api/v1/posts/{postId}/likes")
    @ResponseStatus(HttpStatus.CREATED)
    public void likePost(@PathVariable Long postId) {
        postService.likePost(SecurityUserAccessor.requireUserId(), postId);
    }

    // POST-06: 글 좋아요 취소
    @DeleteMapping("/api/v1/posts/{postId}/likes")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlikePost(@PathVariable Long postId) {
        postService.unlikePost(SecurityUserAccessor.requireUserId(), postId);
    }

    // WH-02-1: 위스키 관련 게시글 (좋아요 순 최대 3개)
    @GetMapping("/api/v1/whiskeys/{whiskeyId}/related-posts")
    public List<PostSummaryResponse> getRelatedPosts(@PathVariable Long whiskeyId) {
        return postService.getRelatedPosts(whiskeyId);
    }
}
