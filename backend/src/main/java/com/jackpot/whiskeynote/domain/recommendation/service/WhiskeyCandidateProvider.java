package com.jackpot.whiskeynote.domain.recommendation.service;

import com.jackpot.whiskeynote.domain.recommendation.dto.NoteVector;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyCandidate;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 추천 후보(위스키 전체)를 DB에서 읽어 불변 DTO로 변환한다.
 * 캐시 미스 시점에만 호출되며, 트랜잭션 안에서 fetch join된 연관을 모두 변환해
 * 세션 종료 후에도 안전하게 공유할 수 있는 형태로 만든다.
 */
@Service
@RequiredArgsConstructor
public class WhiskeyCandidateProvider {

    private final WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;

    @Transactional(readOnly = true)
    public List<WhiskeyCandidate> load() {
        return whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey().stream()
            .map(cache -> new WhiskeyCandidate(
                NoteVector.fromCache(cache),
                WhiskeyRecommendationResponse.from(cache, 0.0)
            ))
            .toList();
    }
}
