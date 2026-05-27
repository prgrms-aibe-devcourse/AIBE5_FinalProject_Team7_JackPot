package com.jackpot.whiskeynote.domain.community.comment.repository;

import com.jackpot.whiskeynote.domain.community.comment.entity.PostCommentTree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentTreeRepository extends JpaRepository<PostCommentTree, Long> {
    List<PostCommentTree> findByDescendantId(Long descendantId);
    List<PostCommentTree> findByDepthAndDescendantIdIn(int depth, List<Long> descendantIds);
}
