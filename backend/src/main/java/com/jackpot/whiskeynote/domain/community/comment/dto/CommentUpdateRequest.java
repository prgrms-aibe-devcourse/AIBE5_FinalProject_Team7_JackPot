// 댓글 수정 요청 DTO - 내용만 변경 가능하며, 빈 문자열 수정 방지를 위한 유효성 검증 포함
package com.jackpot.whiskeynote.domain.community.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 댓글 수정 요청 레코드.
 *
 * content만 수정 가능하도록 제한한 이유:
 * - 댓글의 postId나 parentCommentId는 게시글 이동이나 계층 변경에 해당하므로 허용하지 않음
 *
 * Size(max=1000): 너무 긴 수정 내용을 막기 위한 제한.
 * 생성 시 @NotBlank만 있고 Size 제한이 없는 것과 다소 불일치하므로 향후 통일 검토 필요.
 */
public record CommentUpdateRequest(
        @NotBlank @Size(max = 1000) String content
) {}
