package com.jackpot.whiskeynote.domain.collection.wishlist.repository;

import com.jackpot.whiskeynote.domain.collection.wishlist.entity.WishListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishListItemRepository extends JpaRepository<WishListItem, Long> {

    /**
     * 특정 폴더의 아이템 목록 조회 (노란색 카드들)
     * @param folderId
     * @return
     */
    @Query("SELECT i FROM WishListItem i JOIN FETCH i.whiskey WHERE i.folder.id = :folderId")
    List<WishListItem> findAllByFolderIdWithWhiskey(@Param("folderId") Long folderId);

    /**
     * 같은 폴더에 같은 위스키 중복 확인 (다른 폴더에는 저장 가능)
     * @param userId 유저 ID
     * @param whiskeyId 위스키 ID
     * @param folderId 폴더 ID
     * @return
     */
    boolean existsByUserIdAndWhiskeyIdAndFolderId(Long userId, Long whiskeyId, Long folderId);

    /**
     * 특정 위스키가 저장된 모든 폴더 ID 조회 (모달에서 등록 여부 표시용)
     * @param userId 유저 ID
     * @param whiskeyId 위스키 ID
     * @return
     */
    @Query("SELECT i.folder.id FROM WishListItem i WHERE i.user.id = :userId AND i.whiskey.id = :whiskeyId")
    List<Long> findFolderIdsByUserIdAndWhiskeyId(@Param("userId") Long userId, @Param("whiskeyId") Long whiskeyId);

    /**
     * 위시 삭제용 단건 조회
     * @param userId 유저 ID
     * @param whiskeyId 위스키 ID
     * @return
     */
    Optional<WishListItem> findByUserIdAndWhiskeyId(Long userId, Long whiskeyId);

    /**
     * 폴더 삭제 시 해당 폴더의 모든 아이템 삭제
     * @param folderId 폴더 ID
     */
    @Modifying
    @Query("DELETE FROM WishListItem i WHERE i.folder.id = :folderId")
    void deleteAllByFolderId(@Param("folderId") Long folderId);

    // 유저 매칭용 — 유저의 모든 위시리스트 (위스키 포함)
    @Query("SELECT i FROM WishListItem i JOIN FETCH i.whiskey WHERE i.user.id = :userId")
    List<WishListItem> findAllByUserIdWithWhiskey(@Param("userId") Long userId);

    //캐비넷 위시 집계용
    Long countByUserId(Long userId);
}
