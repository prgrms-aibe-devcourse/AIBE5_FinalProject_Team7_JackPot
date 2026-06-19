package com.jackpot.whiskeynote.domain.recommendation.service;

import com.jackpot.whiskeynote.domain.activity.entity.WhiskeyViewLog;
import com.jackpot.whiskeynote.domain.activity.repository.WhiskeyViewLogRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.recommendation.dto.NoteVector;
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
public class RecommendationScoreService {
    private final WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyViewLogRepository whiskeyViewLogRepository;

    private static final double JACCARD_THRESHOLD = 0.5;
    private static final double MAX_EUCLIDEAN_DIST = Math.sqrt(5 * 100.0 * 100.0); // ≈ 223.6

    private static final int BODY_SCORE_INDEX = 0;
    private static final int FINISH_SCORE_INDEX = 1;
    private static final int SMOKY_SCORE_INDEX = 2;
    private static final int SPICY_SCORE_INDEX = 3;
    private static final int SWEET_SCORE_INDEX = 4;

    /** Vector 값 2개를 비교해서 그 유사도를 점수로 얻는다 */
    public double calcScore(NoteVector a, NoteVector b) {
        double euclideanScore = euclideanSimilarityScore(a, b);
        double cosineTag = cosineSimilarityTag(a, b);
        double jaccard = jaccardSimilarity(a, b);

        return 0.6 * euclideanScore
            + 0.2 * cosineTag
            + 0.2 * jaccard;
    }

    /** score의 코사인 유사도 - 부적합한 모델이므로 사용하지 않음 */
    private double cosineSimilarityScore(NoteVector a, NoteVector b) {
        return cosine(a.scoreVec(), b.scoreVec());
    }

    /** 비교했을 때 특정 값만 차이나는 형상을 막기 위해 사용 */
    private double euclideanSimilarityScore(NoteVector a, NoteVector b) {
        double[] vecA = a.scoreVec();
        double[] vecB = b.scoreVec();

        double sumSq = 0;
        for (int i = 0; i < vecA.length; i++) {
            sumSq += Math.pow(vecA[i] - vecB[i], 2);
        }
        double dist = Math.sqrt(sumSq);
        return 1.0 - (dist / MAX_EUCLIDEAN_DIST);
    }

    /** 사용 후보로 고려중인 유사도 측정 모델 */
    private double manhattanSimilarity(NoteVector a, NoteVector b) {
        double[] vecA = a.scoreVec();
        double[] vecB = b.scoreVec();

        double sum = 0;
        for (int i = 0; i < vecA.length; i++) {
            sum += Math.abs(vecA[i] - vecB[i]);
        }
        // 최대 맨하탄 거리 = 5축 × 100 = 500
        return 1.0 - (sum / 500.0);
    }

    /** 코사인 유사도 검사 */
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

    /** 자카드 유사돟 검사 */
    private double jaccardSimilarity(NoteVector a, NoteVector b) {
        Set<Long> setA = getTagSet(a.tagVector());
        Set<Long> setB = getTagSet(b.tagVector());

        if (setA.isEmpty() && setB.isEmpty()) return 0.0;

        Set<Long> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<Long> union = new HashSet<>(setA);
        union.addAll(setB);

        return (double) intersection.size() / union.size();
    }

    /** 자카드 유사도 검사를 위한 태그 평탄화 */
    private Set<Long> getTagSet(Map<Long, Double> tagVector) {
        Set<Long> res = new HashSet<>();
        for (Map.Entry<Long, Double> entry : tagVector.entrySet()) {
            if (entry.getValue() < JACCARD_THRESHOLD) continue;
            res.add(entry.getKey());
        }
        return res;
    }

    /** 태그에 대한 코사인 유사도 검사 */
    private double cosineSimilarityTag(NoteVector a, NoteVector b) {
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

    /** log to vector */
    public NoteVector calculateScoreFromLog(Long userId) {
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

        return NoteVector.from(scores, tagScores);
    }
}
