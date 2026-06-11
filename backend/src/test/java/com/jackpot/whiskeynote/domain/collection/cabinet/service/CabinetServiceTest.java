package com.jackpot.whiskeynote.domain.collection.cabinet.service;

import com.jackpot.whiskeynote.domain.collection.cabinet.dto.CabinetStatsResponse;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CabinetServiceTest {

    //테스트 대상
    CabinetService cabinetService;

    // 준비물
    PickRepository pickRepository;
    WishListItemRepository wishListItemRepository;
    ReviewRepository reviewRepository;
    TastingNoteRepository tastingNoteRepository;
    UsersRepository usersRepository;

    @BeforeEach
    void setUp() {
        pickRepository = mock(PickRepository.class);
        wishListItemRepository = mock(WishListItemRepository.class);
        reviewRepository = mock(ReviewRepository.class);
        tastingNoteRepository = mock(TastingNoteRepository.class);
        usersRepository = mock(UsersRepository.class);


        cabinetService = new CabinetService(
                pickRepository,
                wishListItemRepository,
                reviewRepository,
                tastingNoteRepository,
                usersRepository
        );
    }

    @Test
    void 서비스테스트() {
        // given
        // userId = 1L
        // pick count = 2
        // wish count = 3
        // review count = 4
        // note count = 5
        Long userId = 1L;

        when(pickRepository.countByUserId(userId)).thenReturn(2L);
        when(wishListItemRepository.countByUserId(userId)).thenReturn(3L);
        when(reviewRepository.countByUserId(userId)).thenReturn(4L);
        when(tastingNoteRepository.countByUserId(userId)).thenReturn(5L);

        // when
        // cabinetService.getStats(userId)
        CabinetStatsResponse response = cabinetService.getStats(userId);


        // then
        // response 값 검증
        assertThat(response.pickCount()).isEqualTo(2L);
        assertThat(response.wishCount()).isEqualTo(3L);
        assertThat(response.reviewCount()).isEqualTo(4L);
        assertThat(response.noteCount()).isEqualTo(5L);
    }

}