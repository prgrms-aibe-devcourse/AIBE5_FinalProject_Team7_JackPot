// 게시글 생성 요청 DTO - 클라이언트로부터 받은 입력값을 검증하고 서비스 레이어로 전달
package com.jackpot.whiskeynote.domain.community.post.dto;

import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 게시글 작성 요청 레코드.
 *
 * whiskeyIds는 선택 필드(nullable) - 위스키를 태그하지 않아도 게시글 작성 가능.
 * postType과 category는 클라이언트가 직접 지정하는 구조이므로,
 * 향후 권한별 게시판 접근 제어가 필요하다면 서비스 레이어에서 postType 유효성을 별도 검증해야 함.
 */
public record PostCreateRequest(
        @NotNull PostType postType,
        @NotNull PostCategory category,
        @NotBlank @Size(max = 512) String title,
        @NotBlank String context,
        List<Long> whiskeyIds  // null 허용: 위스키 태그 없는 게시글도 작성 가능
) {}
