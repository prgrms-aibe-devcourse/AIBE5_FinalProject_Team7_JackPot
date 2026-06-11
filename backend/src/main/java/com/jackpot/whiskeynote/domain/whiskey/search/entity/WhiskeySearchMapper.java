package com.jackpot.whiskeynote.domain.whiskey.search.entity;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;

import java.util.List;

public class WhiskeySearchMapper {
    private WhiskeySearchMapper(){
    }

    public static WhiskeyDocument fromEntity(Whiskey whiskey, List<String> aliases){
        return WhiskeyDocument.builder()
                .id(whiskey.getId())
                .name(whiskey.getName())
                .aliases(aliases)
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
