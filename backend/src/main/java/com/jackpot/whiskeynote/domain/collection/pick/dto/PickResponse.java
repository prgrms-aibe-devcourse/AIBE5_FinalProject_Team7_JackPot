package com.jackpot.whiskeynote.domain.collection.pick.dto;

import com.jackpot.whiskeynote.domain.collection.pick.entity.MyPick;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;

import java.time.LocalDateTime;

public record PickResponse(
        Long pickId,
        WhiskeyCardResponse whiskey,
        LocalDateTime createdAt
) {
    public static PickResponse from(MyPick pick) {
        return new PickResponse(
                pick.getId(),
                WhiskeyCardResponse.from(pick.getWhiskey()),
                pick.getCreatedAt()
        );
    }
}
