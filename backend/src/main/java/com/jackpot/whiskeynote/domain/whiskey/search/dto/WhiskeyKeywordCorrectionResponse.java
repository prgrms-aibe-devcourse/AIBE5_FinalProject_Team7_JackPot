package com.jackpot.whiskeynote.domain.whiskey.search.dto;

public record WhiskeyKeywordCorrectionResponse(
        String originalKeyword,
        String correctedKeyword
) {
    // 교정결과가 없는 경우 생성 메서드
    public static WhiskeyKeywordCorrectionResponse empty(String originalKeyword) {
        return new WhiskeyKeywordCorrectionResponse(originalKeyword, null);
    }
    // 교정결과 생성 메서드
    public static WhiskeyKeywordCorrectionResponse of(String originalKeyword, String correctedKeyword) {
        return new WhiskeyKeywordCorrectionResponse(originalKeyword, correctedKeyword);
    }
    // 교정결과가 있는지 여부를 판단하는 메서드
    public boolean hasCorrection() {
        return correctedKeyword != null && !correctedKeyword.equals(originalKeyword);
    }
}
