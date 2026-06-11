package com.jackpot.whiskeynote.global.exception;

/**
 * 밴된 사용자의 프로필/데이터에 접근할 때 던지는 예외
 * GlobalExceptionHandler → 403 + code: "USER_BANNED"
 */
public class BannedUserException extends RuntimeException {
    public BannedUserException() {
        super("이용이 제한된 계정입니다.");
    }
}
