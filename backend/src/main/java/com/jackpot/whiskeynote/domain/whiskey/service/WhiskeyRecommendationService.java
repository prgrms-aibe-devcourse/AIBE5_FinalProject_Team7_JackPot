package com.jackpot.whiskeynote.domain.whiskey.service;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyRecommendationResponse;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class WhiskeyRecommendationService {
    private static final double JACCARD_THRESHOLD = 0.5;

    private final WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendByWhiskey(Long targetWhiskeyId) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        WhiskeysNoteCache target = whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(targetWhiskeyId)
            .orElseThrow(() -> new EntityNotFoundException("whiskey not found"));

        List<WhiskeyRecommendationResponse> res = new ArrayList<>();
        for (WhiskeysNoteCache cache : caches) {
            if (cache.getWhiskey().getId().equals(targetWhiskeyId)) continue;

            double score = calcScore(target, cache);
            res.add(WhiskeyRecommendationResponse.from(cache, score));
        }
        res.sort(Comparator.comparingDouble(WhiskeyRecommendationResponse::score).reversed());
        return res.subList(0, 3);
    }

    private double calcScore(WhiskeysNoteCache a, WhiskeysNoteCache b) {
        double cosineScore = cosineSimilarityScore(a, b);
        double cosineTag = cosineSimilarityTag(a, b);
        double jaccard = jaccardSimilarity(a, b);

        return 0.6 * cosineScore + 0.2 * cosineTag + 0.2 * jaccard;
    }

    private double cosineSimilarityScore(WhiskeysNoteCache a, WhiskeysNoteCache b) {
        double[] vecA = normalizeScore(a);
        double[] vecB = normalizeScore(b);
        return cosine(vecA, vecB);
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

    private double cosineSimilarityTag(WhiskeysNoteCache a, WhiskeysNoteCache b) {
        Map<Long, Double> tagA = getTagVector(a);
        Map<Long, Double> tagB = getTagVector(b);

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

    private double jaccardSimilarity(WhiskeysNoteCache a, WhiskeysNoteCache b) {
        Set<Long> setA = getTagSet(getTagVector(a));
        Set<Long> setB = getTagSet(getTagVector(b));

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
}
