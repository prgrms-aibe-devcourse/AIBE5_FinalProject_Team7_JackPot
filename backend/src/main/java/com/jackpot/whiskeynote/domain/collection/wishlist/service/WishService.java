package com.jackpot.whiskeynote.domain.collection.wishlist.service;

import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistFolderCreateRequest;
import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistFolderReorderRequest;
import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistFolderResponse;
import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistItemResponse;
import com.jackpot.whiskeynote.domain.collection.wishlist.dto.WishlistMoveResponse;
import com.jackpot.whiskeynote.domain.collection.wishlist.entity.WishListFolder;
import com.jackpot.whiskeynote.domain.collection.wishlist.entity.WishListItem;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListFolderRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishService {
    private final WishListFolderRepository wishListFolderRepository;
    private final WishListItemRepository wishListItemRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;

    // 내 wish 폴더 목록 조회
    @Transactional(readOnly = true)
    public List<WishlistFolderResponse> findFolderAllByUserId(Long userId) {
        if (!usersRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }

        return wishListFolderRepository.findByUserIdOrderBySortOrderAscNameAsc(userId)
                .stream()
                .map(WishlistFolderResponse::from)
                .toList();
    }

    // 폴더 생성
    @Transactional
    public List<WishlistFolderResponse> createFolder(Long userId, WishlistFolderCreateRequest req) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        wishListFolderRepository.save(WishListFolder.create(user, req));

        return wishListFolderRepository.findByUserIdOrderBySortOrderAscNameAsc(userId)
                .stream()
                .map(WishlistFolderResponse::from)
                .toList();
    }

    // 폴더 이름 수정
    @Transactional
    public List<WishlistFolderResponse> updateFolderName(Long userId, Long folderId, String newName){
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        WishListFolder folder = wishListFolderRepository.findById(folderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "폴더를 찾을 수 없습니다."));

        if(!folder.getUser().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "폴더를 수정할 권한이 없습니다.");
        }

        if (newName == null || newName.isEmpty()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수정할 폴더 이름은 필수입니다.");
        }

        folder.updateName(newName);
        wishListFolderRepository.save(folder);

        return wishListFolderRepository.findByUserIdOrderBySortOrderAscNameAsc(userId)
                .stream()
                .map(WishlistFolderResponse::from)
                .toList();
    }

    // 폴더 삭제
    @Transactional
    public List<WishlistFolderResponse> deleteFolder(Long userId, Long folderId){
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        WishListFolder folder = wishListFolderRepository.findById(folderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "폴더를 찾을 수 없습니다."));

        if(!folder.getUser().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "폴더를 삭제할 권한이 없습니다.");
        }

        // 폴더 삭제 시 해당 폴더에 있는 모든 아이템 먼저 삭제 (FK 제약 순서)
        wishListItemRepository.deleteAllByFolderId(folderId);

        // 아이템 삭제 후 폴더 삭제
        wishListFolderRepository.delete(folder);

        return wishListFolderRepository.findByUserIdOrderBySortOrderAscNameAsc(userId)
                .stream()
                .map(WishlistFolderResponse::from)
                .toList();
    }

    // 폴더 내 아이템 목록 조회
    @Transactional(readOnly = true)
    public List<WishlistItemResponse> findItemAllByFolderId(Long userId, Long folderId){
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        WishListFolder folder = wishListFolderRepository.findById(folderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "폴더를 찾을 수 없습니다."));

        if(!folder.getUser().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 폴더외에는 열 수 없습니다.");
        }

        return wishListItemRepository.findAllByFolderIdWithWhiskey(folderId)
                .stream()
                .map(WishlistItemResponse::from)
                .toList();
    }

    // 위시 아이템 폴더 이동
    @Transactional
    public WishlistMoveResponse moveItem(Long userId, Long itemId, Long targetFolderId) {
        // 아이템 존재 확인
        WishListItem item = wishListItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "아이템을 찾을 수 없습니다."));

        // 본인 아이템인지 확인
        if (!item.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이동할 권한이 없습니다.");
        }

        // 이동할 폴더 확인 (null이면 폴더 없음으로 이동)
        WishListFolder targetFolder = null;
        if (targetFolderId != null) {
            targetFolder = wishListFolderRepository.findById(targetFolderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "폴더를 찾을 수 없습니다."));

            // 본인 폴더인지 확인
            if (!targetFolder.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이동할 폴더에 접근 권한이 없습니다.");
            }
        }

        // 폴더 이동
        item.moveFolder(targetFolder);

        // 전체 폴더 목록
        List<WishlistFolderResponse> folders = wishListFolderRepository
                .findByUserIdOrderBySortOrderAscNameAsc(userId)
                .stream()
                .map(WishlistFolderResponse::from)
                .toList();

        // 이동한 폴더의 전체 아이템 목록 (이동한 아이템 + 기존 아이템)
        List<WishlistItemResponse> items = targetFolderId != null
                ? wishListItemRepository.findAllByFolderIdWithWhiskey(targetFolderId)
                        .stream()
                        .map(WishlistItemResponse::from)
                        .toList()
                : List.of();

        return new WishlistMoveResponse(folders, items);
    }

    // 폴더 순서 변경
    @Transactional
    public List<WishlistFolderResponse> reorderFolders(Long userId, WishlistFolderReorderRequest req) {
        // 유저 확인
        if (!usersRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }

        // 요청 순서대로 sortOrder 업데이트
        List<Long> folderIds = req.folderIds();
        for (int i = 0; i < folderIds.size(); i++) {
            WishListFolder folder = wishListFolderRepository.findById(folderIds.get(i))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "폴더를 찾을 수 없습니다."));

            if (!folder.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "폴더 순서를 변경할 권한이 없습니다.");
            }

            folder.updateSortOrder(i);
            wishListFolderRepository.save(folder);
        }

        return wishListFolderRepository.findByUserIdOrderBySortOrderAscNameAsc(userId)
                .stream()
                .map(WishlistFolderResponse::from)
                .toList();
    }

    // 특정 위스키가 등록된 폴더 ID 목록 조회 (모달 등록 여부 표시용)
    @Transactional(readOnly = true)
    public List<Long> getWishedFolderIds(Long userId, Long whiskeyId) {
        return wishListItemRepository.findFolderIdsByUserIdAndWhiskeyId(userId, whiskeyId);
    }

    // 위시 추가
    @Transactional
    public List<WishlistItemResponse> addWish(Long userId, Long whiskeyId, Long folderId) {
        // 유저 조회
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 위스키 조회
        Whiskey whiskey = whiskeyRepository.findById(whiskeyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키를 찾을 수 없습니다."));

        // 같은 폴더에 같은 위스키 중복 확인 (다른 폴더에는 저장 가능)
        if (wishListItemRepository.existsByUserIdAndWhiskeyIdAndFolderId(userId, whiskeyId, folderId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 해당 폴더에 위시한 위스키입니다.");
        }

        // 폴더 조회 (folderId가 null이면 폴더 없이 추가)
        WishListFolder folder = null;
        if (folderId != null) {
            folder = wishListFolderRepository.findById(folderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "폴더를 찾을 수 없습니다."));

            if (!folder.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "폴더에 접근할 권한이 없습니다.");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "폴더를 찾을 수 없습니다.");
        }

        // WishListItem 저장
        wishListItemRepository.save(WishListItem.create(user, whiskey, folder));

        return wishListItemRepository.findAllByFolderIdWithWhiskey(folderId)
                .stream()
                .map(WishlistItemResponse::from)
                .toList();
    }

    // 위시 삭제
    @Transactional
    public List<WishlistItemResponse> removeWish(Long userId, Long folderId, Long wishItemId) {
        // 유저 조회
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 위시 조회
        WishListItem wishItem = wishListItemRepository.findById(wishItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위시를 찾을 수 없습니다."));

        // 본인 확인
        if (!wishItem.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "삭제할 권한이 없습니다.");
        }

        // 위시 삭제
        wishListItemRepository.delete(wishItem);

        return wishListItemRepository.findAllByFolderIdWithWhiskey(folderId)
                .stream()
                .map(WishlistItemResponse::from)
                .toList();
    }
}
