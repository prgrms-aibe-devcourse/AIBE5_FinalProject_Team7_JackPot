// 게시글 상세 응답 DTO - 단건 조회 시 클라이언트에 필요한 모든 정보를 담아 반환
package com.jackpot.whiskeynote.domain.community.post.dto;

import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 게시글 상세 조회 응답 레코드.
 *
 * isLiked / isOwner 는 현재 요청자의 상태에 따라 달라지는 동적 필드.
 * - 비로그인 사용자의 경우 두 값 모두 false 로 반환 (PostController 에서 userId=null 처리)
 * - 수정 API 응답으로 재사용할 때는 isLiked=false 로 고정하여 반환하므로,
 *   수정 직후 좋아요 상태가 리셋되어 보이지 않도록 클라이언트가 별도 처리 필요
 *
 * commentCount는 DB 쿼리로 실시간 집계하므로 likeCount(캐시 컬럼)와 달리 항상 정확함.
 */
public record PostDetailDto(
        Long id,
        Long authorId,
        String authorNickname,
        String authorProfileImageUrl,
        PostType postType,
        PostCategory category,
        String title,
        String context,
        int likeCount,
        int viewCount,
        boolean isLiked,
        boolean isOwner,
        List<Long> whiskeyIds,
        int commentCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PostDetailDto from(Post post, String authorNickname, String authorProfileImageUrl,
                                     boolean isLiked, boolean isOwner,
                                     List<Long> whiskeyIds, int commentCount) {
        return new PostDetailDto(
                post.getId(),
                post.getAuthorId(),
                authorNickname,
                authorProfileImageUrl,
                post.getPostType(),
                post.getCategory(),
                post.getTitle(),
                post.getContext(),
                post.getLikeCount(),
                post.getViewCount(),
                isLiked,
                isOwner,
                whiskeyIds,
                commentCount,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
