// 댓글 계층 구조를 저장하는 Closure Table 엔티티 - 대댓글 트리 조회를 O(1) 쿼리로 처리하기 위해 사용
package com.jackpot.whiskeynote.domain.community.comment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Closure Table 패턴으로 댓글 계층 구조를 관리하는 엔티티.
 *
 * Closure Table을 선택한 이유:
 * - 인접 리스트(parent_id 컬럼) 방식은 재귀 쿼리 없이 다중 레벨 조회가 어려움
 * - Closure Table은 ancestor-descendant 쌍을 모두 저장하여 임의 깊이의 트리를 단순 JOIN으로 조회 가능
 *
 * 레코드 구조 예시 (댓글 A → B → C 계층일 때):
 *   ancestor=A, descendant=A, depth=0  (자기 자신)
 *   ancestor=A, descendant=B, depth=1
 *   ancestor=A, descendant=C, depth=2
 *   ancestor=B, descendant=B, depth=0
 *   ancestor=B, descendant=C, depth=1
 *   ancestor=C, descendant=C, depth=0
 *
 * 주의: 댓글 삭제 시 PostCommentTree 레코드도 함께 삭제해야 고아 경로가 남지 않음.
 * 현재 구현은 PostComment를 논리 삭제만 하고 PostCommentTree는 유지하므로 트리 조회에 영향 없음.
 */
@Entity
@Getter
@Table(name = "post_comment_tree")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostCommentTree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 경로의 시작 댓글 ID (조상) */
    @Column(name = "ancestor_id", nullable = false)
    private Long ancestorId;

    /** 경로의 끝 댓글 ID (자손) */
    @Column(name = "descendant_id", nullable = false)
    private Long descendantId;

    /** ancestor에서 descendant까지의 깊이 (자기 자신은 depth=0) */
    @Column(nullable = false)
    private int depth;

    /**
     * Closure Table 경로 엔트리 생성자.
     * CommentService.createComment에서 새 댓글 등록 시 직접 호출.
     */
    public PostCommentTree(Long ancestorId, Long descendantId, int depth) {
        this.ancestorId = ancestorId;
        this.descendantId = descendantId;
        this.depth = depth;
    }
}
