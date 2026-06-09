// 트리 형태의 댓글 응답 DTO - 삭제된 댓글의 민감정보를 숨기고 대댓글을 중첩 리스트로 구성하여 반환
package com.jackpot.whiskeynote.domain.community.comment.dto;

import com.jackpot.whiskeynote.domain.community.comment.entity.PostComment;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 계층형 댓글 응답 레코드 (재귀 구조).
 *
 * replies 필드에 자식 댓글을 중첩하여 트리를 표현함.
 * 클라이언트가 별도 트리 구성 없이 바로 렌더링할 수 있도록 서버에서 조립해서 내려줌.
 *
 * 삭제된 댓글 처리 전략:
 * - 물리 삭제하면 자식 댓글(대댓글)의 부모 정보가 사라져 트리가 끊김
 * - 따라서 논리 삭제 후 userId/nickname을 null로, content를 고정 문자열로 마스킹하여 응답
 * - isDeleted=true인 경우 클라이언트는 이 필드를 보고 UI에서 "삭제된 댓글" 처리 가능
 */
public record CommentTreeResponse(
        Long id,
        Long userId,       // 삭제된 댓글이면 null (개인정보 보호)
        String nickname,   // 삭제된 댓글이면 null
        String content,    // 삭제된 댓글이면 DELETED_CONTENT 상수값으로 대체
        boolean isDeleted,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CommentTreeResponse> replies  // 대댓글 목록 (없으면 빈 리스트)
) {
    // 삭제된 댓글에 표시할 고정 문자열 - 다국어 지원 시 메시지 소스로 교체 필요
    private static final String DELETED_CONTENT = "삭제된 댓글입니다.";

    /**
     * PostComment 엔티티와 닉네임, 대댓글 목록을 조합해 응답 객체를 생성.
     * 삭제된 댓글이면 작성자 정보를 은닉하고 내용을 대체 메시지로 교체.
     */
    public static CommentTreeResponse from(PostComment comment, String nickname, List<CommentTreeResponse> replies) {
        boolean deleted = comment.isDeleted();
        return new CommentTreeResponse(
                comment.getId(),
                deleted ? null : comment.getUserId(),
                deleted ? null : nickname,
                deleted ? DELETED_CONTENT : comment.getContent(),
                deleted,
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replies
        );
    }
}
