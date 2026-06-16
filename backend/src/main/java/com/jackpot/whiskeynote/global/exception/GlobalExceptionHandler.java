package com.jackpot.whiskeynote.global.exception;

import com.jackpot.whiskeynote.global.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.server.ResponseStatusException;

/**
 * 전역 예외 핸들러
 * 모든 예외를 프론트가 기대하는 { success, data, error } 형태로 변환
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(UnauthorizedException.class)
    public ApiResponse<Void> handleUnauthorized(UnauthorizedException ex) {
        return ApiResponse.fail("UNAUTHORIZED", ex.getMessage());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(BannedUserException.class)
    public ApiResponse<Void> handleBannedUser(BannedUserException ex) {
        return ApiResponse.fail("USER_BANNED", ex.getMessage());
    }

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

    /*
     * ResponseStatusException을 사용하여 서비스/컨트롤러에서 HTTP 상태 코드를 직접 지정 하도록 함.
     * 이 핸들러가 없으면 아래의 Exception 핸들러가 먼저 잡아 404/409/403 같은 의도된 오류도
     * 500 INTERNAL_ERROR로 변환될 수 있다.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleResponseStatusException(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : "요청을 처리할 수 없습니다.";
        String code = ex.getStatusCode().toString();

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(ApiResponse.fail(code, message));
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ApiResponse<Void> handleNotFound(Exception ex) {
        log.warn("[404 NOT FOUND] {} : {}", ex.getClass().getSimpleName(), ex.getMessage());
        return ApiResponse.fail("NOT_FOUND", "요청한 리소스를 찾을 수 없습니다.");
    }

    // 예상치 못한 서버 오류
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleException(Exception ex) {
        log.error("[500 INTERNAL ERROR] {} : {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        return ApiResponse.fail("INTERNAL_ERROR", "서버 오류가 발생했습니다.");
    }
}
