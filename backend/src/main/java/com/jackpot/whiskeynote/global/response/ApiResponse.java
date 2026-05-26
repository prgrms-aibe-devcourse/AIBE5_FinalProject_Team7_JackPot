package com.jackpot.whiskeynote.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 공통 API 응답 래퍼
 *
 * 프론트 shared/api/types/response.ts 의 ApiResponse<T> 와 1:1 매핑
 * 모든 컨트롤러는 이 형태로 응답해야 프론트 unwrapApiData() 가 정상 동작함
 *
 * 성공: { "success": true,  "data": {...}, "error": null }
 * 실패: { "success": false, "data": null,  "error": { "code": "...", "message": "..." } }
 */
@JsonInclude(JsonInclude.Include.ALWAYS) // null 필드도 항상 포함
public record ApiResponse<T>(
        boolean success,
        T data,
        ErrorDetail error
) {
    // 성공 응답 생성
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    // 실패 응답 생성
    public static <T> ApiResponse<T> fail(String code, String message) {
        return new ApiResponse<>(false, null, new ErrorDetail(code, message));
    }

    /**
     * 에러 상세 — 프론트 error.code / error.message 와 매핑
     */
    public record ErrorDetail(
            String code,
            String message
    ) {}
}
