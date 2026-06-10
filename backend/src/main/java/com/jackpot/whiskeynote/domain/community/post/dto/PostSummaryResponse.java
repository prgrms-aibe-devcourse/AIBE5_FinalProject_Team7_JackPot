// 게시글 목록 응답 DTO - 목록 조회 시 불필요한 본문(context)을 제외한 요약 정보만 반환
package com.jackpot.whiskeynote.domain.community.post.dto;

import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 게시글 목록 응답 레코드.
 *
 * PostDetailDto와 달리 isLiked/isOwner를 포함하지 않음.
 * thumbnailUrl은 context 첫 이미지 URL을 추출해 칼럼 목록 카드에 표시하기 위해 추가.
 */
public record PostSummaryResponse(
        Long id,
        Long authorId,
        PostType postType,
        PostCategory category,
        String title,
        int likeCount,
        int viewCount,
        int commentCount,
        LocalDateTime createdAt,
        String thumbnailUrl
) {
    private static final Pattern MD_IMG = Pattern.compile("!\\[.*?]\\((.+?)\\)");
    private static final Pattern HTML_IMG = Pattern.compile("<img[^>]+src=[\"']([^\"']+)[\"']");

    /** context에서 첫 번째 이미지 URL 추출 — 마크다운 우선, 없으면 HTML img 탐색 */
    private static String extractThumbnail(String context) {
        if (context == null || context.isBlank()) return null;
        Matcher md = MD_IMG.matcher(context);
        if (md.find()) return md.group(1);
        Matcher html = HTML_IMG.matcher(context);
        if (html.find()) return html.group(1);
        return null;
    }

    public static PostSummaryResponse from(Post post, int commentCount) {
        return new PostSummaryResponse(
                post.getId(),
                post.getAuthorId(),
                post.getPostType(),
                post.getCategory(),
                post.getTitle(),
                post.getLikeCount(),
                post.getViewCount(),
                commentCount,
                post.getCreatedAt(),
                extractThumbnail(post.getContext())
        );
    }
}
