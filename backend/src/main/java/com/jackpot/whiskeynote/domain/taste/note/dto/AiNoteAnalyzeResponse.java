package com.jackpot.whiskeynote.domain.taste.note.dto;

import java.util.List;

/**
 * AI 테이스팅 노트 분석 응답 DTO
 * - scores: 5가지 속성별 점수 (null 가능 — AI가 판단 불가 시)
 * - noseTagIds: 향(nose) 태그 ID 목록
 * - palateTagIds: 맛(taste) 태그 ID 목록
 */
public record AiNoteAnalyzeResponse(
        Scores scores,
        List<Long> noseTagIds,
        List<Long> palateTagIds
) {
    public record Scores(
            Short body,
            Short finish,
            Short smoky,
            Short spicy,
            Short sweet
    ) {}
}
