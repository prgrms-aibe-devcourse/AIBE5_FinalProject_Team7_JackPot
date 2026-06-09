// 게시글 목록 응답 DTO - 목록 조회 시 불필요한 본문(context)을 제외한 요약 정보만 반환
package com.jackpot.whiskeynote.domain.community.post.dto;

import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;

import java.time.LocalDateTime;

/**
 * 게시글 목록 응답 레코드.
 *
 * PostDetailDto와 달리 context(본문)와 isLiked/isOwner를 포함하지 않음.
 * - 목록 화면에서 본문까지 내려주면 네트워크 비용이 크고 클라이언트 렌더링 부담이 증가하기 때문
 * - 좋아요 상태/소유권 판단은 상세 조회 시에만 필요하므로 목록에서는 의도적으로 제외
 */
public record PostSummaryResponse(
        Long id,
        Long authorId,
        PostType postType,
        PostCategory category,
        String title,
        int likeCount,
        int commentCount,
        LocalDateTime createdAt
) {
    /** Post 엔티티와 댓글 수를 받아 목록용 요약 응답 생성 */
    public static PostSummaryResponse from(Post post, int commentCount) {
        return new PostSummaryResponse(
                post.getId(),
                post.getAuthorId(),
                post.getPostType(),
                post.getCategory(),
                post.getTitle(),
                post.getLikeCount(),
                commentCount,
                post.getCreatedAt()
        );
    }
}
