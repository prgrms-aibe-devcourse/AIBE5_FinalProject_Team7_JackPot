package com.jackpot.whiskeynote.domain.collection.wishlist.dto;

import java.util.List;

public record WishlistMoveResponse(
        List<WishlistFolderResponse> folders, // 바뀐 폴더 목록
        List<WishlistItemResponse> items // 바뀐 아이템 목록
) { }
