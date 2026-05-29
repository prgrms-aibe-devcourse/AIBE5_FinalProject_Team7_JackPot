package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;

/**
 * Provider별 OAuth code → OauthUserInfo 변환
 * - 구현: GoogleOauthClient, KakaoOauthClient, NaverOauthClient (@Component)
 * - 반환: providerUserId 필수, email/nickname nullable
 */
public interface OauthClient {

    AuthProvider provider();

    OauthUserInfo fetchUserInfo(String code);
}

