// 게시글 댓글 JPA 레포지토리 - 게시글 내 댓글 목록 조회 및 삭제되지 않은 댓글 수 집계 제공
package com.jackpot.whiskeynote.domain.community.comment.repository;

import com.jackpot.whiskeynote.domain.community.comment.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    interface PostCommentCount {
        Long getPostId();
        long getCommentCount();
    }

    /**
     * 특정 게시글의 모든 댓글을 작성 시간 오름차순으로 조회.
     * 삭제된 댓글도 포함하는 이유: CommentService에서 트리 구조를 완전히 복원한 뒤
     * 삭제 여부에 따라 응답에서 내용을 마스킹하기 때문.
     */
    List<PostComment> findByPostIdOrderByCreatedAtAsc(Long postId);

    /**
     * 삭제되지 않은 댓글 수만 집계하는 이유:
     * - likeCount 캐시와 달리 댓글 수는 항상 실시간으로 정확하게 반영해야 함
     * - 논리 삭제된 댓글은 "삭제된 댓글"로 표시되지만 실제 댓글 수에는 미포함
     */
    int countByPostIdAndIsDeletedFalse(Long postId);

    @Query("""
            SELECT c.postId AS postId, COUNT(c.id) AS commentCount
            FROM PostComment c
            WHERE c.postId IN :postIds AND c.isDeleted = false
            GROUP BY c.postId
            """)
    List<PostCommentCount> countByPostIds(List<Long> postIds);
}
