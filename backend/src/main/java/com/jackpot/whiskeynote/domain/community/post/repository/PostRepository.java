// 게시글 JPA 레포지토리 - 게시판 유형·카테고리별 페이지 조회 및 삭제 필터링 쿼리 제공
package com.jackpot.whiskeynote.domain.community.post.repository;

import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * 특정 게시판(postType) 내 삭제되지 않은 게시글을 최신순 페이지 조회.
     * 카테고리 필터 없이 전체 조회 시 사용.
     */
    Page<Post> findByPostTypeAndIsDeletedFalseOrderByCreatedAtDesc(PostType postType, Pageable pageable);

    /**
     * 특정 게시판 + 카테고리 조합으로 삭제되지 않은 게시글을 최신순 페이지 조회.
     * FreeBoardService에서 category 파라미터가 있을 때 사용.
     */
    Page<Post> findByPostTypeAndCategoryAndIsDeletedFalseOrderByCreatedAtDesc(PostType postType, PostCategory category, Pageable pageable);

    /** 게시판 구분 없이 삭제되지 않은 전체 게시글 최신순 조회 (관리자/피드 등 통합 뷰에서 활용) */
    Page<Post> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    // 작성자 ID 목록으로 게시글 조회 (라운지 팔로잉 계정 게시물 조회용)
    List<Post> findByAuthorIdInAndIsDeletedFalse(List<Long> authorIds, Pageable pageable);

    /** 삭제되지 않은 게시글 중 조회수 상위 N개 조회 (커뮤니티 홈 인기 게시글 표시용) */
    List<Post> findByIsDeletedFalseOrderByViewCountDesc(Pageable pageable);
}
