package com.jackpot.whiskeynote.domain.collection.wishlist.dto;

import java.util.List;

/**
 * 폴더 순서 변경 요청 DTO
 * <pre>
 * - PATCH /api/v1/users/me/wishlists/folders/reorder
 * - folderIds: 변경할 순서대로 폴더 ID 목록
 *   예) [3, 1, 2] → folderId 3이 0번, 1이 1번, 2가 2번 순서
 * </pre>
 */
public record WishlistFolderReorderRequest(
        List<Long> folderIds
) { }
