package com.jackpot.whiskeynote.domain.collection.wishlist.dto;

import com.jackpot.whiskeynote.domain.collection.wishlist.entity.WishListItem;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;

import java.time.LocalDateTime;

/**
 * 위시리스트 아이템 응답 DTO
 * - GET /api/v1/users/me/wishlists/{folderId}/items 응답에 사용
 * - 화면 노란색 영역 (폴더 내 위스키 카드들)
 */
public record WishlistItemResponse(
        Long itemId,                    // 아이템 ID
        Long folderId,                  // 소속 폴더 ID (null 가능)
        WhiskeyCardResponse whiskey,    // 위스키 정보 (Pick과 동일한 구조)
        LocalDateTime createdAt         // 위시 등록 시각
) {
    public static WishlistItemResponse from(WishListItem item) {
        return new WishlistItemResponse(
                item.getId(),
                item.getFolder() != null ? item.getFolder().getId() : null,
                WhiskeyCardResponse.from(item.getWhiskey()),
                item.getCreatedAt()
        );
    }
}
