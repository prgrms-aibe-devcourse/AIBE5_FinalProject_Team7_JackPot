package com.jackpot.whiskeynote.domain.recommendation.service;

import com.jackpot.whiskeynote.domain.recommendation.dto.NoteVector;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyCandidate;
import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.taste.review.service.ReviewService;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfile;
import com.jackpot.whiskeynote.domain.taste.survey.repository.UserTasteProfileRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class WhiskeyRecommendationService {
    private static final int WHISKEY_RECOMMENDATION_SIZE = 3;

    private final WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    private final ReviewService reviewService;
    private final RecommendationScoreService recommendationScoreService;
    private final UserTasteProfileRepository userTasteProfileRepository;
    private final WhiskeyCandidateCache whiskeyCandidateCache;

    private static final Set<Long> advertisementWhiskeyIds = Set.of(
        37L, 51L, 67L, 78L, 107L, 164L, 188L, 209L, 213L
    );

    public List<WhiskeyRecommendationResponse> recommendAdvertisementWhiskey(Set<Long> excludeIds) {
        List<WhiskeysNoteCache> candidates =
            whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey(advertisementWhiskeyIds).stream()
                .filter(c -> !excludeIds.contains(c.getWhiskey().getId()))
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.shuffle(candidates);
        return candidates.stream().limit(2)
            .map(cache -> {
                WhiskeyRecommendationResponse res = WhiskeyRecommendationResponse.from(cache, 0.0);
                Double avg = reviewService.getAverageRating(res.id()).getAvgRating();
                return res.withAvgRating(avg == null ? 0.0 : avg);
            })
            .toList();
    }

    // @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendByAll(Long userId) {
        if (userId == null) return Collections.emptyList();

        List<WhiskeyCandidate> candidates = whiskeyCandidateCache.get();
        NoteVector targetVector = recommendationScoreService.calculateScoreByUser(userId);

        return getRecommendListFromCandidates(targetVector, candidates, WHISKEY_RECOMMENDATION_SIZE);
    }

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendByWhiskeyLog(Long userId) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        NoteVector targetVector = recommendationScoreService.calculateScoreFromLog(userId);

        return getRecommendList(targetVector, caches, Collections.emptySet(), WHISKEY_RECOMMENDATION_SIZE);
    }

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendBySurvey(double[] scoreVec, Set<Long> allTagIdSet) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        NoteVector targetVector = NoteVector.fromSurvey(scoreVec, allTagIdSet);

        return getRecommendList(targetVector, caches, Collections.emptySet(), WHISKEY_RECOMMENDATION_SIZE);
    }

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendBySurvey(double[] scoreVec, Set<Long> allTagIdSet, Integer ageMin, Integer ageMax) {
        List<WhiskeysNoteCache> caches;
        if (ageMin == null && ageMax == null) {
            caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        } else {
            caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskeyInAgeRange(ageMin, ageMax);
            if (caches.size() < WHISKEY_RECOMMENDATION_SIZE) {
                caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
            }
        }

        NoteVector targetVector = NoteVector.fromSurvey(scoreVec, allTagIdSet);

        return getRecommendList(targetVector, caches, Collections.emptySet(), WHISKEY_RECOMMENDATION_SIZE);
    }

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendByWhiskey(Long targetWhiskeyId) {
        Optional<WhiskeysNoteCache> targetOpt =
            whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(targetWhiskeyId);
        if (targetOpt.isEmpty()) return Collections.emptyList();
        NoteVector targetVector = NoteVector.fromCache(targetOpt.get());

        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        Set<Long> excludes = new HashSet<>();
        excludes.add(targetWhiskeyId);

        return getRecommendList(targetVector, caches, excludes, WHISKEY_RECOMMENDATION_SIZE);
    }

    /** 캐시된 후보(WhiskeyCandidate)로 점수 계산 — recommendByAll 전용 경로 */
    private List<WhiskeyRecommendationResponse> getRecommendListFromCandidates(
            NoteVector targetVector, List<WhiskeyCandidate> candidates, int limit) {
        if (targetVector == null) return new ArrayList<>();

        List<WhiskeyRecommendationResponse> responses = new ArrayList<>();
        for (WhiskeyCandidate candidate : candidates) {
            double score = recommendationScoreService.calcScore(targetVector, candidate.vector());
            responses.add(candidate.base().withScore(score));
        }
        responses.sort(Comparator.comparingDouble(WhiskeyRecommendationResponse::score).reversed());

        List<WhiskeyRecommendationResponse> res = new ArrayList<>();
        for (WhiskeyRecommendationResponse response : responses.subList(0, Integer.min(responses.size(), limit))) {
            Double avgScore = reviewService.getAverageRating(response.id()).getAvgRating();
            if (avgScore == null) avgScore = 0.0;
            res.add(response.withAvgRating(avgScore));
        }

        return res;
    }

    private List<WhiskeyRecommendationResponse> getRecommendList(NoteVector targetVector, List<WhiskeysNoteCache> caches, Set<Long> excludes, int limit) {
        // 추천이 불가능한 상황 -> 빈 list 반환
        if (targetVector == null) return new ArrayList<>();

        // 계산
        List<WhiskeyRecommendationResponse> responses = new ArrayList<>();
        for (WhiskeysNoteCache cache : caches) {
            if (excludes.contains(cache.getWhiskey().getId())) continue;

            NoteVector noteVector = NoteVector.fromCache(cache);
            double score = recommendationScoreService.calcScore(targetVector, noteVector);
            responses.add(WhiskeyRecommendationResponse.from(cache, score));
        }
        responses.sort(Comparator.comparingDouble(WhiskeyRecommendationResponse::score).reversed());

        // 변환
        List<WhiskeyRecommendationResponse> res = new ArrayList<>();
        for (WhiskeyRecommendationResponse response : responses.subList(0, Integer.min(responses.size(), limit))) {
            Double avgScore = reviewService.getAverageRating(response.id()).getAvgRating();
            if (avgScore == null) avgScore = 0.0;
            res.add(response.withAvgRating(avgScore));
        }

        return res;
    }

}
