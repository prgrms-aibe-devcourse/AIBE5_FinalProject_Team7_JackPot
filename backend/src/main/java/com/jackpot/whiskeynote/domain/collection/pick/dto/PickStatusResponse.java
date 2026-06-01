package com.jackpot.whiskeynote.domain.collection.pick.dto;

/**
 * 픽 여부 응답 DTO
 * - GET /api/v1/whiskeys/{whiskeyId}/pick 응답에 사용
 * - 로그인한 유저가 해당 위스키를 픽했는지 여부만 반환
 * - boolean 필드명에 'is' 접두사 사용 시 Jackson이 직렬화 시 제거하므로 'picked'로 명명
 */
public record PickStatusResponse(
        boolean picked  // true: 이미 픽한 위스키 / false: 픽하지 않은 위스키
) {
    public static PickStatusResponse of(boolean isPicked) {
        return new PickStatusResponse(isPicked);
    }
}
