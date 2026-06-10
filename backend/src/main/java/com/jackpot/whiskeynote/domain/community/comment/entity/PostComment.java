// 게시글 댓글 엔티티 - 댓글 내용 저장 및 논리 삭제를 담당하며, 계층 구조는 PostCommentTree가 별도 관리
package com.jackpot.whiskeynote.domain.community.comment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "post_comments")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    // 작성자는 FK 없이 userId만 보관 - 회원 탈퇴 후에도 댓글 레코드 유지 정책
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // 댓글 본문은 긴 텍스트를 허용하기 위해 MEDIUMTEXT 사용 (최대 약 16MB)
    // VARCHAR 대신 MEDIUMTEXT를 선택한 이유: 게시글 본문처럼 마크다운/HTML이 들어올 수 있는 점을 고려
    @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 논리 삭제 플래그: 삭제된 댓글도 트리 구조 유지를 위해 레코드를 남겨야 하므로 물리 삭제 불가
    // 클라이언트에는 "삭제된 댓글입니다." 메시지만 노출 (CommentTreeResponse 참고)
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    public static PostComment create(Long postId, Long userId, String content) {
        PostComment comment = new PostComment();
        comment.postId = postId;
        comment.userId = userId;
        comment.content = content;
        comment.isDeleted = false;
        comment.createdAt = LocalDateTime.now();
        comment.updatedAt = LocalDateTime.now();
        return comment;
    }

    /**
     * 논리 삭제 처리: 트리 구조(PostCommentTree)의 연결 관계는 유지하고 내용만 숨김 처리.
     * updatedAt을 갱신해 클라이언트가 삭제 시점을 알 수 있도록 함.
     */
    public void softDelete() {
        this.isDeleted = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String content) {
        this.content = content;
        this.updatedAt = LocalDateTime.now();
    }

    public void restore() {
        this.isDeleted = false;
        this.updatedAt = LocalDateTime.now();
    }
}
