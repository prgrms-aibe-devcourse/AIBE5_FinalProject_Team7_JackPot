package com.jackpot.whiskeynote.domain.taste.review.repository;

import com.jackpot.whiskeynote.domain.taste.review.entity.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike,Long> {
    // 리뷰 좋아요는 user_id + review_id 조합으로 1건만 허용한다. (이미 좋아요를 눌렀는지 확인용)
    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);
    // 좋아요 취소 시 삭제할 엔티티 조회용
    Optional <ReviewLike> findByUserIdAndReviewId(Long userId, Long reviewId);
    // 리뷰 좋아요 수 조회용
    long countByReviewId(Long reviewId);
    // 좋아요 취소 시 삭제용
    void deleteByUserIdAndReviewId(Long userId, Long reviewId);
}
