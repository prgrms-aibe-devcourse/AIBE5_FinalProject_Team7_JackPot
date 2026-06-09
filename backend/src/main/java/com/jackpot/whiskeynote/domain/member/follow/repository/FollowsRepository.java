package com.jackpot.whiskeynote.domain.member.follow.repository;

import com.jackpot.whiskeynote.domain.member.follow.entity.Follows;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowsRepository extends JpaRepository<Follows, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    Optional<Follows> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    int countByFollowingId(Long followedId);
    int countByFollowerId(Long followerId);

    List<Follows> findByFollowingIdOrderByCreatedAtDesc(Long followingId);

    List<Follows> findByFollowerIdOrderByCreatedAtDesc(Long followerId);
}
