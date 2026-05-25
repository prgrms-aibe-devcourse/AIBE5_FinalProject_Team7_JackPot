package com.jackpot.whiskeynote.domain.whiskey.dto;

import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;

// 위스키 검색시 카드 형태로 보여줄 때 필요한 정보들을 담는 DTO
public record WhiskeyCardResponse(
        Long id,
        String name,
        WhiskeyType type,
        String imageUrl,
        Double abv
) {
    public static WhiskeyCardResponse from(Whiskey whiskey){
        return new WhiskeyCardResponse(
                whiskey.getId(),
                whiskey.getName(),
                whiskey.getType(),
                whiskey.getImageUrl(),
                whiskey.getAbv()
        );
    }
}
