package com.jackpot.whiskeynote.domain.collection.wishlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 위시리스트 폴더 생성 요청 DTO
 * - POST /api/v1/users/me/wishlists 요청 Body에 사용
 */
public record WishlistFolderCreateRequest(

        @NotBlank(message = "폴더 이름은 필수입니다.")
        @Size(max = 128, message = "폴더 이름은 128자 이하로 입력해주세요.")
        String name,        // 폴더 이름

        int sortOrder       // 정렬 순서 (미입력 시 0)
) { }
