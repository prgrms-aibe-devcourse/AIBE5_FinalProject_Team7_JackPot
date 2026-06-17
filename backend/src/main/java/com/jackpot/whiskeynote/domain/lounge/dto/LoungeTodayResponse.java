package com.jackpot.whiskeynote.domain.lounge.dto;

/**
 * 오늘의 라운지 스냅샷 응답.
 * - newPostCount: 오늘 올라온 비삭제 글 수
 * - topPost: 오늘의 인기 글(조회수 1위), 없으면 null
 * - topWhiskeyName: 오늘 가장 많이 언급된 위스키명, 없으면 null
 */
public record LoungeTodayResponse(
        long newPostCount,
        LoungePostResponse topPost,
        String topWhiskeyName
) {
}
