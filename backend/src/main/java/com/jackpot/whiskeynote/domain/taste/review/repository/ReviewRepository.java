package com.jackpot.whiskeynote.domain.taste.review.repository;

import com.jackpot.whiskeynote.domain.taste.review.dto.WhiskeyReviewStats;
import com.jackpot.whiskeynote.domain.taste.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review,Long> {

    @EntityGraph(attributePaths = {"user"}) // Review 엔티티를 조회할 때 User 엔티티도 함께 조회하도록 설정
    Page<Review> findByWhiskeyIdOrderByCreatedAtDesc(Long whiskeyId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "whiskey"}) // Review 엔티티를 조회할 때 User와 Whiskey 엔티티도 함께 조회하도록 설정
    Optional<Review> findWithUserAndWhiskeyById(Long id);

    @EntityGraph(attributePaths = {"user", "whiskey"})
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // 리뷰 생성 전 중복 작성 여부 확인용. user_id + whiskey_id 조합은 서비스 정책상 1건만 허용한다.
    boolean existsByUserIdAndWhiskeyId(Long userId, Long whiskeyId);

    // 유저 매칭용 — 유저의 모든 리뷰 (위스키 포함)
    @Query("SELECT r FROM Review r JOIN FETCH r.whiskey WHERE r.user.id = :userId")
    List<Review> findAllByUserIdWithWhiskey(@Param("userId") Long userId);

    // 유저 매칭용 (배치) — 여러 유저의 리뷰를 한 번에 조회 (N+1 방지)
    @Query("SELECT r FROM Review r JOIN FETCH r.whiskey JOIN FETCH r.user WHERE r.user.id IN :userIds")
    List<Review> findAllByUserIdInWithWhiskey(@Param("userIds") Collection<Long> userIds);

    // 캐비넷 리뷰수 조회용
    long countByUserId(Long userId);

    // 리뷰에 첨부된 공개 시음 노트 조회 허용 판별
    boolean existsByAttachedNoteId(Long attachedNoteId);

    @Query("SELECT count(r) as reviewCount, avg(r.rating) as avgRating " +
        "FROM Review r " +
        "WHERE r.whiskey.id = :whiskeyId")
    WhiskeyReviewStats calculateAvgScoreByWhiskeyId(Long whiskeyId);
}
