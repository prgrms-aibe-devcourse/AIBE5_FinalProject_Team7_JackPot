package com.jackpot.whiskeynote.domain.whiskey.search.entity;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;

public class WhiskeySearchMapper {
    private WhiskeySearchMapper(){
    }

    public static WhiskeyDocument fromEntity(Whiskey whiskey){
        return WhiskeyDocument.builder()
                .id(whiskey.getId())
                .name(whiskey.getName())
                .type(whiskey.getType())
                .region(whiskey.getRegion())
                .country(whiskey.getCountry())
                .cask(whiskey.getCask())
                .abv(whiskey.getAbv())
                .ageYears(whiskey.getAgeYears())
                .imageUrl(whiskey.getImageUrl())
                .build();
    }

    public static WhiskeyCardResponse toCardResponse(WhiskeyDocument document) {
        return new WhiskeyCardResponse(
                document.getId(),
                document.getName(),
                document.getType(),
                document.getImageUrl(),
                document.getAbv()
        );
    }
}
