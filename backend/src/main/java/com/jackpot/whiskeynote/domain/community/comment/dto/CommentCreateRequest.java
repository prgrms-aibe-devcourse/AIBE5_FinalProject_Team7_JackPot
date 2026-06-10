// 댓글/대댓글 생성 요청 DTO - 본문과 선택적 부모 댓글 ID를 담아 계층형 댓글 작성을 지원
package com.jackpot.whiskeynote.domain.community.comment.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 댓글 생성 요청 레코드.
 *
 * parentCommentId:
 * - null이면 최상위 댓글(루트 댓글)
 * - 값이 있으면 해당 댓글의 대댓글(답글)
 * - 서비스 레이어에서 존재 여부를 검증하므로 잘못된 ID 전달 시 404 반환
 *
 * 현재 댓글 깊이 제한이 없으므로 무한 중첩이 가능한 점을 주의.
 * 향후 UI/UX 요구에 따라 depth 제한 로직 추가가 필요할 수 있음.
 */
public record CommentCreateRequest(
        @NotBlank String content,
        Long parentCommentId  // null이면 최상위 댓글, 값이 있으면 대댓글
) {}
