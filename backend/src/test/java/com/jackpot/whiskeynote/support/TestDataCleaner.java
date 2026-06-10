package com.jackpot.whiskeynote.support;

import com.jackpot.whiskeynote.domain.admin.repository.ReportActionsRepository;
import com.jackpot.whiskeynote.domain.admin.repository.ReportsRepository;
import com.jackpot.whiskeynote.domain.admin.repository.WhiskeyRequestRepository;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListFolderRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 테스트 DB 초기화 유틸
 *
 * 새 테이블이 추가되면 이 파일만 수정하면 됩니다.
 *
 * FK 삭제 순서:
 *   wishlist_items → wishlist_folders → picks
 *   → whiskey_requests → report_actions → reports
 *   → refresh_tokens → users → whiskeys (선택)
 */
@Component
@RequiredArgsConstructor
public class TestDataCleaner {

    private final WishListItemRepository wishListItemRepository;
    private final WishListFolderRepository wishListFolderRepository;
    private final PickRepository pickRepository;
    private final WhiskeyRequestRepository whiskeyRequestRepository;
    private final ReportActionsRepository reportActionsRepository;
    private final ReportsRepository reportsRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;

    /** 기본 초기화 — users 까지 삭제 */
    public void cleanAll() {
        wishListItemRepository.deleteAll();
        wishListFolderRepository.deleteAll();
        pickRepository.deleteAll();
        whiskeyRequestRepository.deleteAll();
        reportActionsRepository.deleteAll();
        reportsRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        usersRepository.deleteAll();
    }

    /** whiskeys 포함 초기화 — Pick / Wish 테스트에서 사용 */
    public void cleanAllWithWhiskey() {
        cleanAll();
        whiskeyRepository.deleteAll();
    }
}
