package com.jackpot.whiskeynote.domain.member.entity;

/**
 * 가입/로그인 방식
 */
public enum AuthProvider {
    LOCAL,   // 이메일 + 비밀번호
    GOOGLE,
    KAKAO,
    NAVER
}
