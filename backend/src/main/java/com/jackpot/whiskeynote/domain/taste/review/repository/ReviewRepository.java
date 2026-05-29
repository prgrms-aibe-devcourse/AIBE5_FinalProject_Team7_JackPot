package com.jackpot.whiskeynote.domain.taste.review.repository;

import com.jackpot.whiskeynote.domain.taste.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review,Long> {

    @EntityGraph(attributePaths = {"user"}) // Review 엔티티를 조회할 때 User 엔티티도 함께 조회하도록 설정
    Page<Review> findByWhiskeyIdOrderByCreatedAtDesc(Long whiskeyId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "whiskey"}) // Review 엔티티를 조회할 때 User와 Whiskey 엔티티도 함께 조회하도록 설정
    Optional<Review> findWithUserAndWhiskeyById(Long id);

    @EntityGraph(attributePaths = {"user", "whiskey"})
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
