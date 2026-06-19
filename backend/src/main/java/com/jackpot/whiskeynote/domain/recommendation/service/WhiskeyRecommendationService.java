package com.jackpot.whiskeynote.domain.recommendation.service;

import com.jackpot.whiskeynote.domain.recommendation.dto.NoteVector;
import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.taste.review.service.ReviewService;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;
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
    private static final int WHISKEY_RECOMMENDATION_SIZE = 3;

    private final WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    private final ReviewService reviewService;
    private final RecommendationScoreService recommendationScoreService;

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendByWhiskeyLog(Long userId) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        NoteVector targetVector = recommendationScoreService.calculateScoreFromLog(userId);

        return getRecommendList(targetVector, caches, Collections.emptySet(), WHISKEY_RECOMMENDATION_SIZE);
    }

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendBySurvey(WhiskeyScoreVo scoreVo, Set<Long> allTagIdSet) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        NoteVector targetVector = NoteVector.fromSurvey(scoreVo, allTagIdSet);

        return getRecommendList(targetVector, caches, Collections.emptySet(), WHISKEY_RECOMMENDATION_SIZE);
    }

    @Transactional(readOnly = true)
    public List<WhiskeyRecommendationResponse> recommendByWhiskey(Long targetWhiskeyId) {
        List<WhiskeysNoteCache> caches = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();
        WhiskeysNoteCache target = whiskeysNoteCacheRepository.findByWhiskeyIdWithAvgTags(targetWhiskeyId)
            .orElseThrow(() -> new EntityNotFoundException("whiskey not found"));
        NoteVector targetVector = NoteVector.fromCache(target);

        Set<Long> excludes = new HashSet<>();
        excludes.add(targetWhiskeyId);

        return getRecommendList(targetVector, caches, excludes, WHISKEY_RECOMMENDATION_SIZE);
    }

    private List<WhiskeyRecommendationResponse> getRecommendList(NoteVector targetVector, List<WhiskeysNoteCache> caches, Set<Long> excludes, int limit) {
        // 추천이 불가능한 상황: 점수가 기준치 미달 -> 빈 list 반환
        for (double value : targetVector.scoreVec()) {
            if (value == 0.0) return new ArrayList<>();
        }

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
