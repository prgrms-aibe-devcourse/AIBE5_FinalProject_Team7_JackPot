package com.jackpot.whiskeynote.domain.collection.wishlist.repository;

import com.jackpot.whiskeynote.domain.collection.wishlist.entity.WishListFolder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishListFolderRepository extends JpaRepository<WishListFolder, Long> {

    /**
     * 특정 유저의 모든 폴더 조회
     * @param userId
     * @return
     */
    List<WishListFolder> findByUserIdOrderBySortOrderAscNameAsc(Long userId);
}
