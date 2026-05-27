package com.jackpot.whiskeynote.global.exception;

/**
 * 인증 실패(401) 예외.
 *
 * GlobalExceptionHandler에서 ApiResponse 형태로 변환한다.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}

