package com.jackpot.whiskeynote.domain.community.repository;

import com.jackpot.whiskeynote.domain.community.entity.PostWhiskey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostWhiskeyRepository extends JpaRepository<PostWhiskey, Long> {
    List<PostWhiskey> findByPostIdOrderByOrder(Long postId);

    @Modifying
    void deleteByPostId(Long postId);

    // WH-02-1: 특정 위스키가 태그된 게시글 ID 목록 (좋아요 순 상위 3개)
    @Query("SELECT pw.postId FROM PostWhiskey pw " +
           "JOIN Post p ON p.id = pw.postId " +
           "WHERE pw.whiskeyId = :whiskeyId AND p.isDeleted = false " +
           "ORDER BY p.likeCount DESC")
    List<Long> findTopPostIdsByWhiskeyId(Long whiskeyId, org.springframework.data.domain.Pageable pageable);
}