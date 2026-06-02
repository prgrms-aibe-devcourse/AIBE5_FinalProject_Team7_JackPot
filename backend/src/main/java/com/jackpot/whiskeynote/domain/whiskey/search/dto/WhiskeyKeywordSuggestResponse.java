package com.jackpot.whiskeynote.domain.whiskey.search.dto;

import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeySearchKeywordDocument;

public record WhiskeyKeywordSuggestResponse(
        String keyword
) {
    public static WhiskeyKeywordSuggestResponse from(WhiskeySearchKeywordDocument document) {
           return new WhiskeyKeywordSuggestResponse(document.getKeyword());
    }
}
