package com.jackpot.whiskeynote.global.util;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * 추천/매칭 공통 유사도 계산 유틸리티
 *
 * WhiskeyRecommendationService, TasteMatchService 에서 공통으로 사용.
 *
 * calcScore() 가중치:
 *   코사인(점수벡터)  × 0.2
 *   유클리드(점수벡터) × 0.4  ← 메인
 *   코사인(태그벡터)  × 0.2
 *   자카드(태그집합)  × 0.2
 */
public final class SimilarityUtils {

    // 5개 축 × 100점 기준 최대 유클리드 거리
    private static final double MAX_EUCLIDEAN_DIST = Math.sqrt(5 * 100.0 * 100.0);

    // 자카드 필터 임계값 (이 비율 이상인 태그만 집합에 포함)
    private static final double JACCARD_THRESHOLD = 0.5;

    private SimilarityUtils() {}

    /**
     * 최종 유사도 점수 계산 (0~1)
     * scoreVec   : 정규화된 5개 점수 배열 (0~100)
     * tagVector  : 태그별 가중치 맵 { tagId → 비율(0~1) }
     */
    public static double calcScore(double[] scoreA, Map<Long, Double> tagA,
                                   double[] scoreB, Map<Long, Double> tagB) {
        double cosineScore    = cosineSimilarity(scoreA, scoreB);
        double euclideanScore = euclideanSimilarity(scoreA, scoreB);
        double cosineTag      = cosineSimilarityTag(tagA, tagB);
        double jaccard        = jaccardSimilarity(tagA, tagB);

        return 0.2 * cosineScore + 0.4 * euclideanScore
             + 0.2 * cosineTag   + 0.2 * jaccard;
    }

    // ── 점수 유사도 ──────────────────────────────────────────────

    /** 코사인 유사도 — 벡터 방향의 유사성 */
    public static double cosineSimilarity(double[] a, double[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot   += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /** 유클리드 유사도 — 벡터 거리 기반 (1 - 거리/최대거리) */
    public static double euclideanSimilarity(double[] a, double[] b) {
        double sumSq = 0;
        for (int i = 0; i < a.length; i++) {
            sumSq += Math.pow(a[i] - b[i], 2);
        }
        return 1.0 - (Math.sqrt(sumSq) / MAX_EUCLIDEAN_DIST);
    }

    // ── 태그 유사도 ──────────────────────────────────────────────

    /** 태그 벡터 코사인 유사도 */
    public static double cosineSimilarityTag(Map<Long, Double> tagA, Map<Long, Double> tagB) {
        Set<Long> union = new HashSet<>(tagA.keySet());
        union.addAll(tagB.keySet());

        double dot = 0, normA = 0, normB = 0;
        for (Long tagId : union) {
            double a = tagA.getOrDefault(tagId, 0.0);
            double b = tagB.getOrDefault(tagId, 0.0);
            dot   += a * b;
            normA += a * a;
            normB += b * b;
        }
        if (normA == 0 || normB == 0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /** 자카드 유사도 — JACCARD_THRESHOLD 이상 태그만 집합에 포함 */
    public static double jaccardSimilarity(Map<Long, Double> tagA, Map<Long, Double> tagB) {
        Set<Long> setA = toTagSet(tagA);
        Set<Long> setB = toTagSet(tagB);

        if (setA.isEmpty() && setB.isEmpty()) return 0.0;

        Set<Long> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<Long> union = new HashSet<>(setA);
        union.addAll(setB);

        return (double) intersection.size() / union.size();
    }

    // ── 정규화 ───────────────────────────────────────────────────

    /**
     * 테이스팅 노트 점수 (1~10) → 0~100 정규화
     * CacheVector.normalizeScore() 와 동일한 방식
     */
    public static double normalizeNoteScore(double avgScore) {
        return (avgScore - 1.0) / 9.0 * 100.0;
    }

    // ── 내부 ─────────────────────────────────────────────────────

    private static Set<Long> toTagSet(Map<Long, Double> tagVector) {
        Set<Long> set = new HashSet<>();
        tagVector.forEach((id, weight) -> {
            if (weight >= JACCARD_THRESHOLD) set.add(id);
        });
        return set;
    }
}
