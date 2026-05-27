package com.jackpot.whiskeynote.domain.community.post.repository;

import com.jackpot.whiskeynote.domain.community.post.entity.PostWhiskey;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostWhiskeyRepository extends JpaRepository<PostWhiskey, Long> {
    List<PostWhiskey> findByPostIdOrderByOrder(Long postId);

    @Modifying
    void deleteByPostId(Long postId);

    @Query("SELECT pw.postId FROM PostWhiskey pw " +
           "JOIN Post p ON p.id = pw.postId " +
           "WHERE pw.whiskeyId = :whiskeyId AND p.isDeleted = false " +
           "ORDER BY p.likeCount DESC")
    List<Long> findTopPostIdsByWhiskeyId(Long whiskeyId, Pageable pageable);
}
