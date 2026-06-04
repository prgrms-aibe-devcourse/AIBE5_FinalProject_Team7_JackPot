package com.jackpot.whiskeynote.domain.collection.wishlist.controller;

import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistFolderCreateRequest;
import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistFolderReorderRequest;
import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistFolderResponse;
import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistItemResponse;
import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistMoveResponse;
import com.jackpot.whiskeynote.domain.collection.wishlist.service.WishService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.SecurityUserAccessor;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class WishController {

    private final WishService wishService;

    /**
     * 내 위시리스트 폴더 목록 조회
     * @return
     */
    @GetMapping("/api/v1/users/me/wishlists")
    public ApiResponse<List<WishlistFolderResponse>> getFolderList() {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.findFolderAllByUserId(userId));
    }

    /**
     * 폴더 생성
     * @param request 폴더 이름
     * @return
     */
    @PostMapping("/api/v1/users/me/wishlists")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<WishlistFolderResponse>> createFolder(@RequestBody @Valid WishlistFolderCreateRequest request) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.createFolder(userId, request));
    }

    /**
     * 폴더 이름 수정
     * @param folderId 폴더 ID
     * @param body 폴더 이름
     * @return
     */
    @PatchMapping("/api/v1/users/me/wishlists/folders/{folderId}")
    public ApiResponse<List<WishlistFolderResponse>> updateFolderName(@PathVariable Long folderId, @RequestBody Map<String, String> body) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.updateFolderName(userId, folderId, body.get("name")));
    }

    /**
     * 폴더 순서 변경
     * @param request folderIds: 변경할 순서대로 폴더 ID 목록
     * @return 변경된 폴더 목록
     */
    @PatchMapping("/api/v1/users/me/wishlists/folders/reorder")
    public ApiResponse<List<WishlistFolderResponse>> reorderFolders(@RequestBody WishlistFolderReorderRequest request) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.reorderFolders(userId, request));
    }

    /**
     * 폴더 삭제
     * @param folderId 폴더 ID
     * @return
     */
    @DeleteMapping("/api/v1/users/me/wishlists/folders/{folderId}")
    public ApiResponse<List<WishlistFolderResponse>> deleteFolder(@PathVariable Long folderId) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.deleteFolder(userId, folderId));
    }

    /**
     * 폴더 내 아이템 목록 조회
     * @param folderId 폴더 ID
     * @return
     */
    @GetMapping("/api/v1/users/me/wishlists/{folderId}/items")
    public ApiResponse<List<WishlistItemResponse>> getItemList(@PathVariable Long folderId) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.findItemAllByFolderId(userId, folderId));
    }

    /** 특정 위스키가 등록된 폴더 ID 목록 조회 */
    @GetMapping("/api/v1/whiskeys/{whiskeyId}/wish/folders")
    public ApiResponse<List<Long>> getWishedFolderIds(@PathVariable Long whiskeyId) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.getWishedFolderIds(userId, whiskeyId));
    }

    /** 위시 추가 */
    @PostMapping("/api/v1/whiskeys/{whiskeyId}/wish")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<WishlistItemResponse>> addWish(@PathVariable Long whiskeyId, @RequestParam Long folderId) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.addWish(userId, whiskeyId, folderId));
    }

    /**
     * 위시 삭제
     * @param wishItemId 위시 아이템 ID
     * @param folderId 폴더 ID
     * @return
     */
    @DeleteMapping("/api/v1/whiskeys/wish/{wishItemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<List<WishlistItemResponse>> removeWish(@PathVariable Long wishItemId, @RequestParam Long folderId) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.removeWish(userId, folderId, wishItemId));
    }

    /**
     * 위시 아이템 폴더 이동
     * @param itemId 위시 아이템 ID
     * @param targetFolderId 이동할 폴더 ID
     * @return
     */
    @PatchMapping("/api/v1/users/me/wishlists/items/{itemId}/move")
    public ApiResponse<WishlistMoveResponse> moveItem(@PathVariable Long itemId, @RequestParam Long targetFolderId) {
        Long userId = SecurityUserAccessor.requireUserId();
        return ApiResponse.ok(wishService.moveItem(userId, itemId, targetFolderId));
    }
}
