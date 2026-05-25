package com.jackpot.whiskeynote.domain.whiskey.dto;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;

import java.util.List;

public record WhiskeyFilterRequest(
        String keyword,
        List<WhiskeyType> types,
        List<String> noseTags,
        List<String> tasteTags,
        Double minAbv,
        Double maxAbv,
        Integer minAge,
        Integer maxAge,
        Integer page,
        Integer size
) {
    public int pageOrDefault() {
        return page == null ? 0 : page;
    }

    public int sizeOrDefault() {
        return size == null ? 20 : size;
    }
}
