// Closure Table 경로 JPA 레포지토리 - 댓글 계층 구조 조회 및 대댓글 등록 시 조상 경로 탐색 기능 제공
package com.jackpot.whiskeynote.domain.community.comment.repository;

import com.jackpot.whiskeynote.domain.community.comment.entity.PostCommentTree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentTreeRepository extends JpaRepository<PostCommentTree, Long> {

    /**
     * 특정 댓글의 모든 조상 경로를 조회.
     * 대댓글 작성 시 부모 댓글의 descendant_id로 이 메서드를 호출하여,
     * 새 댓글과 모든 조상 사이의 경로 엔트리를 생성하는 데 사용.
     *
     * 예) B의 대댓글 C를 추가할 때 findByDescendantId(B) → [A→B, B→B] 반환
     * → C에 대해 [A→C(depth+1), B→C(depth+1), C→C(0)] 생성
     */
    List<PostCommentTree> findByDescendantId(Long descendantId);

    /**
     * 특정 depth에서 지정된 descendantId 목록에 해당하는 경로를 한 번에 조회.
     * depth=1로 호출하면 직접 부모-자식 관계(바로 아래 레벨)만 가져옴.
     *
     * CommentService에서 직접 자식 관계만 필요한 이유:
     * - 전체 Closure Table을 로딩하면 중간 조상 경로까지 포함되어 트리 구성 로직이 복잡해짐
     * - depth=1 필터로 "바로 아래 자식" 관계만 가져와 parentToChildren 맵을 효율적으로 구성
     */
    List<PostCommentTree> findByDepthAndDescendantIdIn(int depth, List<Long> descendantIds);
}
