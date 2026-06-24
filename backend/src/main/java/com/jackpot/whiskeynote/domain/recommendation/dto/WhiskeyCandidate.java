package com.jackpot.whiskeynote.domain.recommendation.dto;

/**
 * 추천 후보 위스키의 캐시 단위.
 * 엔티티(WhiskeysNoteCache)를 그대로 캐싱하면 detached/동시성 문제가 있으므로,
 * 점수 계산에 필요한 NoteVector와 응답 기본 정보만 담은 불변 형태로 보관한다.
 */
public record WhiskeyCandidate(
    NoteVector vector,
    WhiskeyRecommendationResponse base
) {
}
