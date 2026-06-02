package com.jackpot.whiskeynote.domain.collection.cabinet.service;

import com.jackpot.whiskeynote.domain.collection.cabinet.dto.CabinetStatsResponse;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CabinetService {

    private final PickRepository pickRepository;
    private final ReviewRepository reviewRepository;

    public CabinetStatsResponse getStats(Long userId) {
        Long pickCount = pickRepository.countByUserId(userId);
        Long reviewCount = reviewRepository.countByUserId(userId);

        return new CabinetStatsResponse(pickCount,reviewCount);
    }
}
