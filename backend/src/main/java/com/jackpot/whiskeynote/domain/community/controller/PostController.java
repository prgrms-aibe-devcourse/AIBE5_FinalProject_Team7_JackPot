package com.jackpot.whiskeynote.domain.community.controller;

import com.jackpot.whiskeynote.domain.community.dto.*;
import com.jackpot.whiskeynote.domain.community.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.entity.PostType;
import com.jackpot.whiskeynote.domain.community.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // 칼럼 게시판 목록
    @GetMapping("/api/v1/community/columns")
    public Page<PostSummaryResponse> getColumns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return postService.getCommunityPosts(PostType.COLUMN, page, size);
    }

    // 자유게시판 목록 (카테고리 필터 선택)
    @GetMapping("/api/v1/community/free")
    public Page<PostSummaryResponse> getFreePosts(
            @RequestParam(required = false) PostCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return postService.getFreePosts(category, page, size);
    }

    // QnA 게시판 목록
    @GetMapping("/api/v1/community/qna")
    public Page<PostSummaryResponse> getQnaPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return postService.getCommunityPosts(PostType.QA, page, size);
    }

    // POST-01: 글 상세
    @GetMapping("/api/v1/posts/{postId}")
    public PostDetailDto getPost(
            @PathVariable Long postId,
            @RequestParam(required = false) Long userId
    ) {
        return postService.getPost(postId, userId);
    }

    // POST-02: 글 작성
    @PostMapping("/api/v1/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public Long createPost(
            @RequestParam Long userId,
            @Valid @RequestBody PostCreateRequest request
    ) {
        return postService.createPost(userId, request);
    }

    // POST-03: 글 수정
    @PatchMapping("/api/v1/posts/{postId}")
    public PostDetailDto updatePost(
            @PathVariable Long postId,
            @RequestParam Long userId,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        return postService.updatePost(userId, postId, request);
    }

    // POST-04: 글 삭제 (soft)
    @DeleteMapping("/api/v1/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable Long postId,
            @RequestParam Long userId
    ) {
        postService.deletePost(userId, postId);
    }

    // POST-05: 글 좋아요
    @PostMapping("/api/v1/posts/{postId}/likes")
    @ResponseStatus(HttpStatus.CREATED)
    public void likePost(
            @PathVariable Long postId,
            @RequestParam Long userId
    ) {
        postService.likePost(userId, postId);
    }

    // POST-06: 글 좋아요 취소
    @DeleteMapping("/api/v1/posts/{postId}/likes")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlikePost(
            @PathVariable Long postId,
            @RequestParam Long userId
    ) {
        postService.unlikePost(userId, postId);
    }

    // WH-02-1: 위스키 관련 게시글 (좋아요 순 최대 3개)
    @GetMapping("/api/v1/whiskeys/{whiskeyId}/related-posts")
    public List<PostSummaryResponse> getRelatedPosts(@PathVariable Long whiskeyId) {
        return postService.getRelatedPosts(whiskeyId);
    }
}