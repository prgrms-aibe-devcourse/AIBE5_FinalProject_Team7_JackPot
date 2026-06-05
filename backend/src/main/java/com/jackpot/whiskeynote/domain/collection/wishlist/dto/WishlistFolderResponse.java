package com.jackpot.whiskeynote.domain.collection.wishlist.dto;

import com.jackpot.whiskeynote.domain.collection.wishlist.entity.WishListFolder;

import java.time.LocalDateTime;

/**
 * 위시리스트 폴더 응답 DTO
 * - GET /api/v1/users/me/wishlists 응답에 사용
 * - 화면 파란색 영역 (폴더 목록)
 */
public record WishlistFolderResponse(
        Long folderId,          // 폴더 ID
        String name,            // 폴더 이름
        int sortOrder,          // 정렬 순서
        LocalDateTime createdAt // 생성 시각
) {
    public static WishlistFolderResponse from(WishListFolder folder) {
        return new WishlistFolderResponse(
                folder.getId(),
                folder.getName(),
                folder.getSortOrder(),
                folder.getCreatedAt()
        );
    }
}
