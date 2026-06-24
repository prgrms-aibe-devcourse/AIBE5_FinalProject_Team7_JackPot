// 게시글 핵심 비즈니스 로직 서비스 - CRUD, 좋아요/취소, 위스키 관련 게시글 조회를 처리
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
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
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
    private final UsersRepository usersRepository;

    /** 작성자 ID로 닉네임 조회. 탈퇴/삭제 등으로 사용자가 없으면 기본 문구 반환. */
    private String resolveAuthorNickname(Long authorId) {
        return usersRepository.findById(authorId)
                .filter(user -> !user.isDeleted())
                .map(Users::getNickname)
                .orElse("알 수 없는 사용자");
    }

    /** 작성자 ID로 프로필 이미지 URL(S3 key) 조회. */
    private String resolveAuthorProfileImageUrl(Long authorId) {
        return usersRepository.findById(authorId)
                .filter(user -> !user.isDeleted())
                .map(Users::getProfileImageUrl)
                .orElse(null);
    }

    // POST-01: 글 상세
    /**
     * 게시글 단건 상세 조회 — 매 요청마다 viewCount를 1 증가.
     * 현재는 중복 제거 없이 단순 증가 (TODO: Redis + 세션/쿠키 기반 중복 차단으로 확장 예정).
     * readOnly = false 로 변경한 이유: viewCount 쓰기가 필요하기 때문.
     */
    @Transactional
    public PostDetailDto getPost(Long postId, Long userId) {
        Post post = findActivePostOrThrow(postId);
        post.incrementViewCount();

        boolean isLiked = userId != null && postLikeRepository.existsByUserIdAndPostId(userId, postId);
        boolean isOwner = userId != null && post.getAuthorId().equals(userId);

        List<Long> whiskeyIds = postWhiskeyRepository.findByPostIdOrderByOrder(postId)
                .stream().map(PostWhiskey::getWhiskeyId).toList();

        int commentCount = postCommentRepository.countByPostIdAndIsDeletedFalse(postId);

        return PostDetailDto.from(post, resolveAuthorNickname(post.getAuthorId()),
                resolveAuthorProfileImageUrl(post.getAuthorId()),
                isLiked, isOwner, whiskeyIds, commentCount);
    }

    /** 조회수 상위 N개 게시글 반환 (커뮤니티 홈 인기 게시글용) */
    @Transactional(readOnly = true)
    public List<PostSummaryResponse> getTopPosts(int limit) {
        return postRepository.findByIsDeletedFalseOrderByViewCountDesc(PageRequest.of(0, limit))
                .stream()
                .map(p -> PostSummaryResponse.from(p,
                        postCommentRepository.countByPostIdAndIsDeletedFalse(p.getId())))
                .toList();
    }

    // POST-02: 글 작성
    /**
     * 게시글 생성 후 생성된 게시글 ID를 반환.
     * whiskeyIds는 선택값이며, 리스트 인덱스를 1-based order로 저장해 순서를 보존.
     */
    @Transactional
    public Long createPost(Long userId, PostCreateRequest request) {
        Post post = Post.create(userId, request.postType(), request.category(),
                request.title(), request.context());
        postRepository.save(post);

        // 위스키 태그가 있을 때만 저장, 순서는 요청 리스트의 인덱스+1 로 설정
        if (request.whiskeyIds() != null) {
            for (int i = 0; i < request.whiskeyIds().size(); i++) {
                postWhiskeyRepository.save(
                        PostWhiskey.create(post.getId(), request.whiskeyIds().get(i), i + 1));
            }
        }

        return post.getId();
    }

    // POST-03: 글 수정
    /**
     * 게시글 수정 후 갱신된 상세 정보를 반환.
     *
     * 위스키 태그 수정 전략: "전체 삭제 후 재삽입"
     * - 변경된 항목만 추적하는 복잡한 로직 없이 일관된 결과를 보장
     * - 수정 응답의 isLiked는 항상 false로 반환 (조회 없이 빠르게 응답하기 위한 타협)
     */
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

        // 수정 시 isLiked=false 고정: 좋아요 상태 재조회를 생략해 DB 쿼리를 줄이기 위한 선택
        return PostDetailDto.from(post, resolveAuthorNickname(post.getAuthorId()),
                resolveAuthorProfileImageUrl(post.getAuthorId()), false, true, whiskeyIds,
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
    /**
     * 좋아요 추가.
     * 서비스 레이어에서 중복 체크 후 충돌 시 409 반환.
     * DB의 UniqueConstraint가 최후 방어선 역할을 하지만, 사용자 친화적 메시지를 위해 사전 체크를 유지.
     */
    @Transactional
    public void likePost(Long userId, Long postId) {
        Post post = findActivePostOrThrow(postId);
        if (postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 좋아요한 게시글입니다.");
        }
        postLikeRepository.save(PostLike.create(userId, postId));
        // PostLike 저장과 likeCount 증가를 같은 트랜잭션에서 처리해 일관성 유지
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
    /**
     * 위스키 상세 페이지용 관련 게시글 조회 (최대 3개, 좋아요 내림차순).
     *
     * postWhiskeyRepository에서 postId 목록을 먼저 가져온 뒤 각각 Post를 조회하는 이유:
     * - JPQL 쿼리에서 이미 isDeleted 필터와 likeCount 정렬을 처리했으나,
     *   findById 재조회 시 다시 isDeleted를 체크해 혹시 모를 Race Condition 방어
     * - 단, N+1 가능성이 있으므로 결과 수(최대 3개)가 작을 때만 적합한 방식
     */
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

    /**
     * 게시글 존재 여부 및 논리 삭제 여부를 함께 검증하는 공통 헬퍼.
     * 여러 메서드에서 동일 패턴이 반복되어 추출; public으로 열어 다른 서비스에서도 재사용 가능.
     */
    public Post findActivePostOrThrow(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
        if (post.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "삭제된 게시글입니다.");
        }
        return post;
    }

    /** 요청자가 작성자와 다를 경우 403 Forbidden 발생 */
    private void checkOwnership(Long ownerId, Long requesterId) {
        if (!ownerId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다.");
        }
    }
}
