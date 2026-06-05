package com.jackpot.whiskeynote.domain.collection.cabinet.service;

import com.jackpot.whiskeynote.domain.collection.cabinet.dto.CabinetStatsResponse;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CabinetService {

    private final PickRepository pickRepository;
    private final WishListItemRepository wishListItemRepository;
    private final ReviewRepository reviewRepository;
    private final TastingNoteRepository tastingNoteRepository;

    public CabinetStatsResponse getStats(Long userId) {
        Long pickCount = pickRepository.countByUserId(userId);
        Long wishCount = wishListItemRepository.countByUserId(userId);
        Long reviewCount = reviewRepository.countByUserId(userId);
        Long noteCount = tastingNoteRepository.countByUserId(userId);

        return new CabinetStatsResponse(pickCount, wishCount, reviewCount, noteCount);
    }
}
