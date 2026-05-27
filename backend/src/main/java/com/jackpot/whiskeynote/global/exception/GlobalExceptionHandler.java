package com.jackpot.whiskeynote.global.exception;

import com.jackpot.whiskeynote.global.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외 핸들러
 * 모든 예외를 프론트가 기대하는 { success, data, error } 형태로 변환
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // @Valid 검증 실패 (이메일 형식 오류, 빈 값 등)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleValidation(MethodArgumentNotValidException ex) {
        // 첫 번째 오류 메시지만 반환
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("입력값이 올바르지 않습니다.");

        return ApiResponse.fail("VALIDATION_ERROR", message);
    }

    // 비즈니스 로직 오류 (중복 이메일, 비밀번호 불일치 등)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalArgumentException.class)
    public ApiResponse<Void> handleIllegalArgument(IllegalArgumentException ex) {
        return ApiResponse.fail("BAD_REQUEST", ex.getMessage());
    }

    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    @ExceptionHandler(IllegalStateException.class)
    public ApiResponse<Void> handleIllegalState(IllegalStateException ex) {
        return ApiResponse.fail("SERVICE_UNAVAILABLE", ex.getMessage());
    }

    // 예상치 못한 서버 오류
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleException(Exception ex) {
        ex.printStackTrace(); // 서버 로그에만 출력
        return ApiResponse.fail("INTERNAL_ERROR", "서버 오류가 발생했습니다.");
    }
}
