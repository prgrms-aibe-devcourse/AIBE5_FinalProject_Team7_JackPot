package com.jackpot.whiskeynote.domain.recommendation.service;

import com.jackpot.whiskeynote.domain.activity.entity.WhiskeyViewLog;
import com.jackpot.whiskeynote.domain.activity.repository.WhiskeyViewLogRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import com.jackpot.whiskeynote.domain.taste.review.service.ReviewService;
import com.jackpot.whiskeynote.domain.recommendation.dto.CacheVector;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class WhiskeyRecommendationService {
    private static final double JACCARD_THRESHOLD = 0.5;
    private static final double MAX_EUCLIDEAN_DIST = Math.sqrt(5 * 100.0 * 100.0); // ≈ 223.6

    private static final int BODY_SCORE_INDEX = 0;
    private static final int FINISH_SCORE_INDEX = 1;
    private static final int SMOKY_SCORE_INDEX = 2;
    private static final int SPICY_SCORE_INDEX = 3;
    private static final int SWEET_SCORE_INDEX = 4;

    private final WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    private final ReviewService reviewService;
    private final UsersRepository usersRepository;
    private final WhiskeyViewLogRepository whiskeyViewLogRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendByWhiskeyLog(Long userId) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        CacheVector targetVector = calculateScoreFromLog(userId);

        // 추천이 불가능한 상황: 점수가 기준치 미달 -> 빈 list 반환
        for (double value : targetVector.scoreVec()) {
            if (value == 0.0) return new ArrayList<>();
        }

        // 계산
        List<WhiskeyRecommendationResponse> responses = new ArrayList<>();
        for (WhiskeysNoteCache cache : caches) {
            CacheVector cacheVector = CacheVector.fromCache(cache);
            double score = calcScore(targetVector, cacheVector);
            responses.add(WhiskeyRecommendationResponse.from(cache, score));
        }
        responses.sort(Comparator.comparingDouble(WhiskeyRecommendationResponse::score).reversed());

        // 변환
        List<WhiskeyRecommendationResponse> res = new ArrayList<>();
        for (WhiskeyRecommendationResponse response : responses.subList(0, Integer.min(responses.size(), 3))) {
            Double avgScore = reviewService.getAverageRating(response.id()).getAvgRating();
            res.add(response.withAvgRating(avgScore));
        }

        return res;
    }

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendBySurvey(WhiskeyScoreVo scoreVo, Set<Long> allTagIdSet) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        CacheVector targetVector = CacheVector.fromSurvey(scoreVo, allTagIdSet);

        // 계산
        List<WhiskeyRecommendationResponse> responses = new ArrayList<>();
        for (WhiskeysNoteCache cache : caches) {
            CacheVector cacheVector = CacheVector.fromCache(cache);
            double score = calcScore(targetVector, cacheVector);
            responses.add(WhiskeyRecommendationResponse.from(cache, score));
        }
        responses.sort(Comparator.comparingDouble(WhiskeyRecommendationResponse::score).reversed());

        // 변환
        List<WhiskeyRecommendationResponse> res = new ArrayList<>();
        for (WhiskeyRecommendationResponse response : responses.subList(0, 3)) {
            Double avgScore = reviewService.getAverageRating(response.id()).getAvgRating();
            res.add(response.withAvgRating(avgScore));
        }

        return res;
    }

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendByWhiskey(Long targetWhiskeyId) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        WhiskeysNoteCache target = whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(targetWhiskeyId)
            .orElseThrow(() -> new EntityNotFoundException("whiskey not found"));
        CacheVector targetVector = CacheVector.fromCache(target);

        // 계산
        List<WhiskeyRecommendationResponse> responses = new ArrayList<>();
        for (WhiskeysNoteCache cache : caches) {
            if (cache.getWhiskey().getId().equals(targetWhiskeyId)) continue;

            CacheVector cacheVector = CacheVector.fromCache(cache);
            double score = calcScore(targetVector, cacheVector);
            responses.add(WhiskeyRecommendationResponse.from(cache, score));
        }
        responses.sort(Comparator.comparingDouble(WhiskeyRecommendationResponse::score).reversed());

        // 변환
        List<WhiskeyRecommendationResponse> res = new ArrayList<>();
        for (WhiskeyRecommendationResponse response : responses.subList(0, 3)) {
            Double avgScore = reviewService.getAverageRating(response.id()).getAvgRating();
            res.add(response.withAvgRating(avgScore));
        }
        return res;
    }

    private double calcScore(CacheVector a, CacheVector b) {
        double cosineScore = cosineSimilarityScore(a, b);
        double euclideanScore = euclideanSimilarityScore(a, b);
        double cosineTag = cosineSimilarityTag(a, b);
        double jaccard = jaccardSimilarity(a, b);

        return 0.2 * cosineScore + 0.4 * euclideanScore
            + 0.2 * cosineTag + 0.2 * jaccard;
    }

    private double cosineSimilarityScore(CacheVector a, CacheVector b) {
        return cosine(a.scoreVec(), b.scoreVec());
    }

    private double euclideanSimilarityScore(CacheVector a, CacheVector b) {
        double[] vecA = a.scoreVec();
        double[] vecB = b.scoreVec();

        double sumSq = 0;
        for (int i = 0; i < vecA.length; i++) {
            sumSq += Math.pow(vecA[i] - vecB[i], 2);
        }
        double dist = Math.sqrt(sumSq);
        return 1.0 - (dist / MAX_EUCLIDEAN_DIST);
    }

    private double manhattanSimilarity(CacheVector a, CacheVector b) {
        double[] vecA = a.scoreVec();
        double[] vecB = b.scoreVec();

        double sum = 0;
        for (int i = 0; i < vecA.length; i++) {
            sum += Math.abs(vecA[i] - vecB[i]);
        }
        // 최대 맨하탄 거리 = 5축 × 100 = 500
        return 1.0 - (sum / 500.0);
    }

    private double[] normalizeScore(WhiskeysNoteCache cache) {
        double[] res = new double[5];

        res[0] = ((double) cache.getBodyScore() / cache.getCount() - 1) / 9 * 100;
        res[1] = ((double) cache.getFinishScore() / cache.getCount() - 1) / 9 * 100;
        res[2] = ((double) cache.getSmokyScore() / cache.getCount() - 1) / 9 * 100;
        res[3] = ((double) cache.getSpicyScore() / cache.getCount() - 1) / 9 * 100;
        res[4] = ((double) cache.getSweetScore() / cache.getCount() - 1) / 9 * 100;

        return res;
    }

    private double cosineSimilarityTag(CacheVector a, CacheVector b) {
        Map<Long, Double> tagA = a.tagVector();
        Map<Long, Double> tagB = b.tagVector();

        // 두 tag의 합집합
        Set<Long> union = new HashSet<>();
        union.addAll(tagA.keySet());
        union.addAll(tagB.keySet());

        List<Long> tagIndex = new ArrayList<>(union);

        double[] vecA = tagIndex.stream()
            .mapToDouble(tag -> tagA.getOrDefault(tag, 0.0))
            .toArray();
        double[] vecB = tagIndex.stream()
            .mapToDouble(tag -> tagB.getOrDefault(tag, 0.0))
            .toArray();
        return cosine(vecA, vecB);
    }

    private Map<Long, Double> getTagVector(WhiskeysNoteCache cache) {
        Map<Long, Double> res = new HashMap<>();
        for (AvgWhiskeyTag avgTag : cache.getAvgWhiskeyTags()) {
            res.put(avgTag.getTag().getId(), (double) avgTag.getCount() / cache.getCount());
        }
        return res;
    }

    private double cosine(double[] a, double[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) return 0.0; // 0벡터 예외처리
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private double jaccardSimilarity(CacheVector a, CacheVector b) {
        Set<Long> setA = getTagSet(a.tagVector());
        Set<Long> setB = getTagSet(b.tagVector());

        if (setA.isEmpty() && setB.isEmpty()) return 0.0;

        Set<Long> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<Long> union = new HashSet<>(setA);
        union.addAll(setB);

        return (double) intersection.size() / union.size();
    }

    private Set<Long> getTagSet(Map<Long, Double> tagVector) {
        Set<Long> res = new HashSet<>();
        for (Map.Entry<Long, Double> entry : tagVector.entrySet()) {
            if (entry.getValue() < JACCARD_THRESHOLD) continue;
            res.add(entry.getKey());
        }
        return res;
    }

    private CacheVector calculateScoreFromLog(Long userId) {
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Not found User"));
        List<WhiskeyViewLog> logs = whiskeyViewLogRepository.findAllByUserIdWithWhiskey(userId);

        double[] scores = new double[5];
        Map<Long, Double> tagScores = new HashMap<>();

        // TODO: 아래의 과정은 Whiskey가 WhiskeyNoteCache와 1:1 mapping된 상태면 간략화됨.
        Set<Long> whiskeyIds = new HashSet<>();
        for (WhiskeyViewLog log : logs) {
            // 이미 삭제된 위스키를 봤다면, 반영하지 않음
            if (log.getWhiskey() == null) continue;
            whiskeyIds.add(log.getWhiskey().getId());
        }
        List<WhiskeysNoteCache> noteCacheList = whiskeysNoteCacheRepository.findAllByWhiskeyIdWithTags(whiskeyIds);
        Map<Long, WhiskeysNoteCache> noteCacheMap = new HashMap<>();
        for (WhiskeysNoteCache cache : noteCacheList) {
            noteCacheMap.put(cache.getWhiskey().getId(), cache);
        }

        // 방문 시점에 따른 점수 반영
        // 지수 감쇠 사용 -> e ^ (-x/60)
        double totalWeight = 0;
        for (WhiskeyViewLog log : logs) {
            // 이미 삭제된 위스키를 봤다면, 반영하지 않음
            if (log.getWhiskey() == null) continue;

            double days = Duration.between(
                log.getCreatedAt(),
                LocalDateTime.now()
            ).toDays();
            double weight = Math.exp(-days / 30.0);
            totalWeight += weight;

            WhiskeysNoteCache noteCache = noteCacheMap.get(log.getWhiskey().getId());
            scores[BODY_SCORE_INDEX] += weight * noteCache.getBodyScore();
            scores[FINISH_SCORE_INDEX] += weight * noteCache.getFinishScore();
            scores[SMOKY_SCORE_INDEX] += weight * noteCache.getSmokyScore();
            scores[SPICY_SCORE_INDEX] += weight * noteCache.getSpicyScore();
            scores[SWEET_SCORE_INDEX] += weight * noteCache.getSweetScore();

            for (AvgWhiskeyTag whiskeyTag : noteCache.getAvgWhiskeyTags()) {
                tagScores.merge(whiskeyTag.getTag().getId(), weight, Double::sum);
            }
        }

        // 실제 점수로 변환
        if (totalWeight != 0.0) {
            for (int i = 0; i < scores.length; i++) {
                scores[i] /= totalWeight;
            }
            for (Long key : tagScores.keySet()) {
                tagScores.put(key, tagScores.get(key) / totalWeight);
            }
        }

        // 점수가 1 ~ 10점 이내에 존재하는 지 확인
        for (int i = 0; i < scores.length; i++) {
            if (0.5 < scores[i] && scores[i] < 1.0) scores[i] = 1.0;
            else if (scores[i] < 0.5) scores[i] = 0.0;
            if (10.0 < scores[i]) scores[i] = 10.0;
        }

        return CacheVector.from(scores, tagScores);
    }
}
