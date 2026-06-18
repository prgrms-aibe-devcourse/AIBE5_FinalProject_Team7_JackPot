package com.jackpot.whiskeynote.domain.lounge.dto;

import com.jackpot.whiskeynote.domain.collection.pick.entity.MyPick;
import com.jackpot.whiskeynote.domain.taste.review.entity.Review;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfile;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfileTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.global.util.SimilarityUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 유저 취향 벡터 — CacheVector 와 동일한 구조
 *
 * scoreVec  : 정규화된 5개 점수 배열 [body, finish, smoky, spicy, sweet] (0~100)
 * tagVector : 태그별 가중치 맵 { tagId → 비율(0~1) }
 *
 * ── 데이터 소스별 조합 ────────────────────────────────────────────────
 *
 * [점수 벡터]
 *   설문 + 행동(pick/4점↑ 리뷰) 모두 있음 → 행동 × 0.6 + 설문 × 0.4
 *   행동만 있음 (설문 없음)              → 행동 × 1.0
 *   설문만 있음 (행동 없음)              → 설문 × 1.0
 *   셋 다 없음                           → null 반환 (매칭 불가)
 *
 * [태그 벡터]
 *   설문 태그 있으면 사용, 없으면 빈 맵
 *
 * ── 제외 이유 ──────────────────────────────────────────────────────────
 *   테이스팅 노트 : 위스키에 대한 객관적 기록 → 선호와 무관
 *   위시리스트    : 경험 전 관심 표현 → 선호 신호 불명확
 *   중립/부정 리뷰 : 3.9 이하 → 선호 여부 불명확
 */
public record UserVector(double[] scoreVec, Map<Long, Double> tagVector) {

    public static UserVector build(
            UserTasteProfile profile,            // null 허용 (설문 미완료 유저)
            List<UserTasteProfileTag> profileTags,
            List<MyPick> picks,
            List<Review> reviews,
            Map<Long, WhiskeysNoteCache> cacheMap
    ) {
        // 리뷰는 4점 이상만 선호 신호로 사용 (1~5 스케일 기준)
        List<Review> preferredReviews = reviews.stream()
                .filter(r -> r.getRating().compareTo(new BigDecimal("4")) >= 0)
                .toList();

        boolean hasSurvey   = profile != null;
        boolean hasBehavior = !picks.isEmpty() || !preferredReviews.isEmpty();

        // 설문, pick, 리뷰 모두 없으면 매칭 불가 → null 반환
        if (!hasSurvey && !hasBehavior) return null;

        double[] surveyVec   = hasSurvey ? buildSurveyScoreVec(profile) : null;
        double[] behaviorVec = hasBehavior
                ? buildBehaviorScoreVec(picks, preferredReviews, cacheMap) : null;

        // ── 점수 벡터 조합 ───────────────────────────────────────
        double[] scoreVec;
        if (hasSurvey && hasBehavior) {
            // 설문 + 행동: 행동 0.6 + 설문 0.4
            scoreVec = blend(new double[][]{ behaviorVec, surveyVec }, new double[]{ 0.6, 0.4 });
        } else if (hasBehavior) {
            // pick/리뷰만: 행동 100%
            scoreVec = behaviorVec;
        } else {
            // 설문만: 설문 100%
            scoreVec = surveyVec;
        }

        // ── 태그 벡터: 설문 태그만 (설문 없으면 빈 맵) ────────────
        Map<Long, Double> tagVector = hasSurvey
                ? buildSurveyTagVec(profileTags)
                : new HashMap<>();

        return new UserVector(scoreVec, tagVector);
    }

    // ==========================================================================
    // 점수 벡터 빌더
    // ==========================================================================

    /** 설문 점수 → 0~100 벡터 */
    private static double[] buildSurveyScoreVec(UserTasteProfile p) {
        return new double[]{
            p.getBodyScore(),
            p.getFinishScore(),
            p.getSmokyScore(),
            p.getSpicyScore(),
            p.getSweetScore()
        };
    }

    /**
     * pick + 긍정 리뷰 기반 위스키 캐시 평균 점수 벡터
     * reviews 는 이미 4점 이상으로 필터링된 목록
     */
    private static double[] buildBehaviorScoreVec(List<MyPick> picks, List<Review> reviews,
                                                   Map<Long, WhiskeysNoteCache> cacheMap) {
        double[] sum = new double[5];
        double total = 0;

        for (MyPick pick : picks) {
            WhiskeysNoteCache cache = cacheMap.get(pick.getWhiskey().getId());
            if (cache == null || cache.getCount() == 0) continue;
            addCacheToSum(sum, cache, 1.0);
            total += 1.0;
        }

        for (Review review : reviews) {
            WhiskeysNoteCache cache = cacheMap.get(review.getWhiskey().getId());
            if (cache == null || cache.getCount() == 0) continue;
            addCacheToSum(sum, cache, 1.0);
            total += 1.0;
        }

        if (total == 0) return new double[5];
        for (int i = 0; i < 5; i++) sum[i] /= total;
        return sum;
    }

    // ==========================================================================
    // 태그 벡터 빌더
    // ==========================================================================

    /** 설문 태그 → 선택 여부 (1.0) */
    private static Map<Long, Double> buildSurveyTagVec(List<UserTasteProfileTag> tags) {
        Map<Long, Double> map = new HashMap<>();
        tags.forEach(t -> map.put(t.getTag().getId(), 1.0));
        return map;
    }

    // ==========================================================================
    // 내부 유틸
    // ==========================================================================

    /** 캐시 점수(합산값/노트수)를 정규화해서 sum 배열에 가중치로 누적 */
    private static void addCacheToSum(double[] sum, WhiskeysNoteCache cache, double weight) {
        int cnt = cache.getCount();
        sum[0] += weight * SimilarityUtils.normalizeNoteScore((double) cache.getBodyScore()   / cnt);
        sum[1] += weight * SimilarityUtils.normalizeNoteScore((double) cache.getFinishScore() / cnt);
        sum[2] += weight * SimilarityUtils.normalizeNoteScore((double) cache.getSmokyScore()  / cnt);
        sum[3] += weight * SimilarityUtils.normalizeNoteScore((double) cache.getSpicyScore()  / cnt);
        sum[4] += weight * SimilarityUtils.normalizeNoteScore((double) cache.getSweetScore()  / cnt);
    }

    /** 여러 점수 벡터를 가중 평균으로 합산 */
    private static double[] blend(double[][] vecs, double[] weights) {
        double[] result = new double[5];
        for (int k = 0; k < vecs.length; k++) {
            for (int i = 0; i < 5; i++) {
                result[i] += vecs[k][i] * weights[k];
            }
        }
        return result;
    }
}
