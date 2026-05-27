package com.jackpot.whiskeynote.domain.community.post.service;

import com.jackpot.whiskeynote.domain.community.comment.repository.PostCommentRepository;
import com.jackpot.whiskeynote.domain.community.post.dto.PostCreateRequest;
import com.jackpot.whiskeynote.domain.community.post.dto.PostDetailDto;
import com.jackpot.whiskeynote.domain.community.post.dto.PostSummaryResponse;
import com.jackpot.whiskeynote.domain.community.post.dto.PostUpdateRequest;
import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostLike;
import com.jackpot.whiskeynote.domain.community.post.entity.PostWhiskey;
import com.jackpot.whiskeynote.domain.community.post.repository.PostLikeRepository;
import com.jackpot.whiskeynote.domain.community.post.repository.PostRepository;
import com.jackpot.whiskeynote.domain.community.post.repository.PostWhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostWhiskeyRepository postWhiskeyRepository;
    private final PostCommentRepository postCommentRepository;

    // POST-01: 글 상세
    @Transactional(readOnly = true)
    public PostDetailDto getPost(Long postId, Long userId) {
        Post post = findActivePostOrThrow(postId);

        boolean isLiked = userId != null && postLikeRepository.existsByUserIdAndPostId(userId, postId);
        boolean isOwner = userId != null && post.getAuthorId().equals(userId);

        List<Long> whiskeyIds = postWhiskeyRepository.findByPostIdOrderByOrder(postId)
                .stream().map(PostWhiskey::getWhiskeyId).toList();

        int commentCount = postCommentRepository.countByPostIdAndIsDeletedFalse(postId);

        return PostDetailDto.from(post, isLiked, isOwner, whiskeyIds, commentCount);
    }

    // POST-02: 글 작성
    @Transactional
    public Long createPost(Long userId, PostCreateRequest request) {
        Post post = Post.create(userId, request.postType(), request.category(),
                request.title(), request.context());
        postRepository.save(post);

        if (request.whiskeyIds() != null) {
            for (int i = 0; i < request.whiskeyIds().size(); i++) {
                postWhiskeyRepository.save(
                        PostWhiskey.create(post.getId(), request.whiskeyIds().get(i), i + 1));
            }
        }

        return post.getId();
    }

    // POST-03: 글 수정
    @Transactional
    public PostDetailDto updatePost(Long userId, Long postId, PostUpdateRequest request) {
        Post post = findActivePostOrThrow(postId);
        checkOwnership(post.getAuthorId(), userId);

        post.update(request.title(), request.context(), request.category());

        if (request.whiskeyIds() != null) {
            postWhiskeyRepository.deleteByPostId(postId);
            for (int i = 0; i < request.whiskeyIds().size(); i++) {
                postWhiskeyRepository.save(
                        PostWhiskey.create(postId, request.whiskeyIds().get(i), i + 1));
            }
        }

        List<Long> whiskeyIds = postWhiskeyRepository.findByPostIdOrderByOrder(postId)
                .stream().map(PostWhiskey::getWhiskeyId).toList();

        return PostDetailDto.from(post, false, true, whiskeyIds,
                postCommentRepository.countByPostIdAndIsDeletedFalse(postId));
    }

    // POST-04: 글 삭제 (soft delete)
    @Transactional
    public void deletePost(Long userId, Long postId) {
        Post post = findActivePostOrThrow(postId);
        checkOwnership(post.getAuthorId(), userId);
        post.softDelete();
    }

    // POST-05: 글 좋아요
    @Transactional
    public void likePost(Long userId, Long postId) {
        Post post = findActivePostOrThrow(postId);
        if (postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 좋아요한 게시글입니다.");
        }
        postLikeRepository.save(PostLike.create(userId, postId));
        post.incrementLikeCount();
    }

    // POST-06: 글 좋아요 취소
    @Transactional
    public void unlikePost(Long userId, Long postId) {
        Post post = findActivePostOrThrow(postId);
        if (!postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "좋아요 기록이 없습니다.");
        }
        postLikeRepository.deleteByUserIdAndPostId(userId, postId);
        post.decrementLikeCount();
    }

    // WH-02-1: 위스키 관련 게시글 (좋아요 순 최대 3개)
    @Transactional(readOnly = true)
    public List<PostSummaryResponse> getRelatedPosts(Long whiskeyId) {
        List<Long> postIds = postWhiskeyRepository.findTopPostIdsByWhiskeyId(
                whiskeyId, PageRequest.of(0, 3));

        return postIds.stream()
                .map(id -> postRepository.findById(id).orElse(null))
                .filter(p -> p != null && !p.isDeleted())
                .map(p -> PostSummaryResponse.from(p,
                        postCommentRepository.countByPostIdAndIsDeletedFalse(p.getId())))
                .toList();
    }

    public Post findActivePostOrThrow(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
        if (post.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "삭제된 게시글입니다.");
        }
        return post;
    }

    private void checkOwnership(Long ownerId, Long requesterId) {
        if (!ownerId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다.");
        }
    }
}
