package com.jackpot.whiskeynote.domain.community.repository;

import com.jackpot.whiskeynote.domain.community.entity.PostCommentTree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentTreeRepository extends JpaRepository<PostCommentTree, Long> {
    // 특정 댓글의 모든 조상 경로 (self-reference 포함)
    List<PostCommentTree> findByDescendantId(Long descendantId);

    // 특정 댓글 집합의 직접 부모-자식 관계 (depth=1)
    List<PostCommentTree> findByDepthAndDescendantIdIn(int depth, List<Long> descendantIds);
}