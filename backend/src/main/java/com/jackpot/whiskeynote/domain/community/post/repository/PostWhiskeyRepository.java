// 게시글-위스키 연결 JPA 레포지토리 - 태그 목록 조회, 일괄 삭제, 위스키 기반 인기 게시글 조회 기능 제공
package com.jackpot.whiskeynote.domain.community.post.repository;

import com.jackpot.whiskeynote.domain.community.post.entity.PostWhiskey;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostWhiskeyRepository extends JpaRepository<PostWhiskey, Long> {

    interface TrendingWhiskeyProjection {
        Long getWhiskeyId();
        String getWhiskeyName();
        long getMentionCount();
    }

    /** 게시글에 태그된 위스키 목록을 등록 순서(order) 기준으로 조회 */
    List<PostWhiskey> findByPostIdOrderByOrder(Long postId);

    /** 여러 게시글에 태그된 위스키 목록을 게시글/등록 순서 기준으로 한 번에 조회 */
    @Query("SELECT pw FROM PostWhiskey pw WHERE pw.postId IN :postIds ORDER BY pw.postId ASC, pw.order ASC")
    List<PostWhiskey> findByPostIdsOrderByPostAndOrder(@Param("postIds") List<Long> postIds);

    /**
     * 게시글 수정 시 위스키 태그를 전면 교체하기 위해 기존 태그를 일괄 삭제.
     * 부분 업데이트 방식보다 전체 삭제 후 재삽입이 구현 단순성이 높아 이 방식을 선택.
     * 단, 태그가 많거나 업데이트 빈도가 높다면 변경된 항목만 처리하는 최적화 고려 필요.
     */
    @Modifying
    void deleteByPostId(Long postId);

    /**
     * 특정 위스키가 태그된 게시글 중 삭제되지 않은 것을 좋아요 수 내림차순으로 조회.
     * 위스키 상세 페이지의 "관련 게시글" 섹션에서 상위 3개를 보여주기 위해 Pageable로 개수를 제한.
     *
     * JPQL로 Post 엔티티와 JOIN하는 이유:
     * - isDeleted 필터링을 위해 posts 테이블 정보가 필요하기 때문
     * - 반환 타입을 postId(Long)로 한정해 Post 엔티티 전체를 로딩하는 비용을 줄임
     */
    @Query("SELECT pw.postId FROM PostWhiskey pw " +
           "JOIN Post p ON p.id = pw.postId " +
           "WHERE pw.whiskeyId = :whiskeyId AND p.isDeleted = false " +
           "ORDER BY p.likeCount DESC")
    List<Long> findTopPostIdsByWhiskeyId(Long whiskeyId, Pageable pageable);

    @Query(value = """
            SELECT
                pw.whiskey_id AS whiskeyId,
                w.name AS whiskeyName,
                COUNT(pw.id) AS mentionCount
            FROM post_whiskeys pw
            JOIN posts p ON p.id = pw.post_id
            JOIN whiskeys w ON w.id = pw.whiskey_id
            WHERE p.is_deleted = false
            GROUP BY pw.whiskey_id, w.name
            ORDER BY COUNT(pw.id) DESC, MAX(p.created_at) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<TrendingWhiskeyProjection> findTrendingWhiskeys(@Param("limit") int limit);

    /** 특정 시각 이후(=오늘 등) 작성된 글 기준으로 많이 언급된 위스키 */
    @Query(value = """
            SELECT
                pw.whiskey_id AS whiskeyId,
                w.name AS whiskeyName,
                COUNT(pw.id) AS mentionCount
            FROM post_whiskeys pw
            JOIN posts p ON p.id = pw.post_id
            JOIN whiskeys w ON w.id = pw.whiskey_id
            WHERE p.is_deleted = false AND p.created_at >= :since
            GROUP BY pw.whiskey_id, w.name
            ORDER BY COUNT(pw.id) DESC, MAX(p.created_at) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<TrendingWhiskeyProjection> findTrendingWhiskeysSince(
            @Param("since") java.time.LocalDateTime since, @Param("limit") int limit);
}
