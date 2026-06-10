// 게시글 수정 요청 DTO - PATCH 의미론을 지원하기 위해 모든 필드가 선택값(null 허용)
package com.jackpot.whiskeynote.domain.community.post.dto;

import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 게시글 수정 요청 레코드.
 *
 * 모든 필드가 null 허용인 이유:
 * - PATCH 방식으로 변경된 필드만 업데이트하는 정책을 따르기 때문
 * - 서비스 레이어(Post.update)에서 null 체크 후 비-null 필드만 반영
 *
 * 주의: postType은 수정 불가 - 게시판 이동을 허용하지 않는 정책.
 *
 * whiskeyIds가 null이면 기존 태그를 유지,
 * 빈 리스트([])로 보내면 기존 태그를 전부 삭제하는 동작이 되도록 서비스에서 처리.
 */
public record PostUpdateRequest(
        @Size(max = 512) String title,
        String context,
        PostCategory category,
        List<Long> whiskeyIds
) {}
