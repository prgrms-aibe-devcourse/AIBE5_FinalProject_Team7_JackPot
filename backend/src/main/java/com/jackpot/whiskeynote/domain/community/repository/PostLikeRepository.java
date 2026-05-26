package com.jackpot.whiskeynote.domain.community.repository;

import com.jackpot.whiskeynote.domain.community.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    boolean existsByUserIdAndPostId(Long userId, Long postId);

    @Modifying
    void deleteByUserIdAndPostId(Long userId, Long postId);
}