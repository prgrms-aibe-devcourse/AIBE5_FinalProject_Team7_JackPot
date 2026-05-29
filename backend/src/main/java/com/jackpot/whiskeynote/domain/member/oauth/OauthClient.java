package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;

/**
 * Provider별 OAuth code → 사용자 정보 변환 전략.
 *
 * <p>구현체: {@code GoogleOauthClient}, {@code KakaoOauthClient}, {@code NaverOauthClient}.
 * {@code @Component}로 등록하면 {@link OauthLoginService}가 provider 이름으로 자동 선택.
 *
 * <p>반환 {@link OauthUserInfo}는 DB upsert에 사용 — providerUserId는 필수, email/nickname은 nullable.
 */
public interface OauthClient {

    AuthProvider provider();

    OauthUserInfo fetchUserInfo(String code);
}

