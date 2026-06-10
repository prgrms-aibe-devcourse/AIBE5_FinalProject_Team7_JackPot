// 게시글 REST API 컨트롤러 - 게시글 CRUD, 좋아요/취소, 위스키 관련 게시글 엔드포인트 제공
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

    /**
     * POST-01: 게시글 단건 상세 조회.
     * @AuthenticationPrincipal은 JWT 미인증 요청에서도 null을 반환하도록 Security 설정 필요.
     * principal이 null이면 서비스에서 isLiked=false, isOwner=false 로 처리.
     */
    @GetMapping("/api/v1/posts/{postId}")
    public PostDetailDto getPost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        Long userId = principal != null ? principal.userId() : null;
        return postService.getPost(postId, userId);
    }

    // POST-02: 게시글 작성 (인증 필수) - 생성된 게시글 ID 반환, 201 Created
    @PostMapping("/api/v1/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public Long createPost(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody PostCreateRequest request
    ) {
        return postService.createPost(principal.userId(), request);
    }

    // POST-03: 게시글 부분 수정 (PATCH) - 변경된 필드만 전송 가능, 수정 후 상세 정보 반환
    @PatchMapping("/api/v1/posts/{postId}")
    public PostDetailDto updatePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        return postService.updatePost(principal.userId(), postId, request);
    }

    // POST-04: 게시글 논리 삭제 - 실제 DB 레코드는 유지하며 isDeleted=true 처리
    @DeleteMapping("/api/v1/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        postService.deletePost(principal.userId(), postId);
    }

    // POST-05: 게시글 좋아요 추가 - 이미 좋아요 상태면 409 Conflict 반환
    @PostMapping("/api/v1/posts/{postId}/likes")
    @ResponseStatus(HttpStatus.CREATED)
    public void likePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        postService.likePost(principal.userId(), postId);
    }

    // POST-06: 게시글 좋아요 취소 - 좋아요 기록이 없으면 404 반환
    @DeleteMapping("/api/v1/posts/{postId}/likes")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlikePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        postService.unlikePost(principal.userId(), postId);
    }

    /**
     * WH-02-1: 특정 위스키에 태그된 게시글 중 좋아요 순 상위 3개 반환.
     * 위스키 상세 페이지의 "관련 게시글" 섹션에서 호출하며, 인증 불필요.
     */
    @GetMapping("/api/v1/whiskeys/{whiskeyId}/related-posts")
    public List<PostSummaryResponse> getRelatedPosts(@PathVariable Long whiskeyId) {
        return postService.getRelatedPosts(whiskeyId);
    }

    /** 조회수 기준 인기 게시글 상위 N개 (기본 5개, 커뮤니티 홈 표시용) */
    @GetMapping("/api/v1/posts/top")
    public List<PostSummaryResponse> getTopPosts(
            @RequestParam(defaultValue = "5") int limit) {
        return postService.getTopPosts(limit);
    }
}
