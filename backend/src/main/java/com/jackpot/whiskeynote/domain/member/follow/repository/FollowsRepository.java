package com.jackpot.whiskeynote.domain.member.follow.repository;

import com.jackpot.whiskeynote.domain.member.follow.entity.Follows;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FollowsRepository extends JpaRepository<Follows, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    Optional<Follows> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    int countByFollowingId(Long followedId);
    int countByFollowerId(Long followerId);

    List<Follows> findByFollowingIdOrderByCreatedAtDesc(Long followingId);

    List<Follows> findByFollowerIdOrderByCreatedAtDesc(Long followerId);
    // 팔로잉한 유저 목록 조회용(라운지 게시글 추천용)
    // JPA로 ID 목록만 조회 가능할지 애매해서
    @Query("SELECT f.followingId FROM Follows f WHERE f.followerId = :followerId")
    List<Long> findFollowingIdsByFollowerId(Long followerId);

}
