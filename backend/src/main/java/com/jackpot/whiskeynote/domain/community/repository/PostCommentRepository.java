package com.jackpot.whiskeynote.domain.community.repository;

import com.jackpot.whiskeynote.domain.community.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findByPostIdOrderByCreatedAtAsc(Long postId);
    int countByPostIdAndIsDeletedFalse(Long postId);
}