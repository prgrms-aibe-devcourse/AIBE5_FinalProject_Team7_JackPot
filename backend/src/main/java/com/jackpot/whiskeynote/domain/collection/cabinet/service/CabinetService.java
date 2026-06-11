package com.jackpot.whiskeynote.domain.collection.cabinet.service;

import com.jackpot.whiskeynote.domain.collection.cabinet.dto.CabinetStatsResponse;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import com.jackpot.whiskeynote.global.exception.BannedUserException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
@Service
@RequiredArgsConstructor
public class CabinetService {

    private final PickRepository pickRepository;
    private final WishListItemRepository wishListItemRepository;
    private final ReviewRepository reviewRepository;
    private final TastingNoteRepository tastingNoteRepository;
    private final UsersRepository usersRepository;

    public CabinetStatsResponse getStats(Long userId) {
        Long pickCount = pickRepository.countByUserId(userId);
        Long wishCount = wishListItemRepository.countByUserId(userId);
        Long reviewCount = reviewRepository.countByUserId(userId);
        Long noteCount = tastingNoteRepository.countByUserId(userId);

        return new CabinetStatsResponse(pickCount, wishCount, reviewCount, noteCount);
    }

    // 타인 캐비넷 조회 — 밴·탈퇴 계정 차단
    public CabinetStatsResponse getStatsByUserId(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."));
        if (user.isBanned() || user.isDeleted()) {
            throw new BannedUserException();
        }
        return getStats(userId);
    }
}
