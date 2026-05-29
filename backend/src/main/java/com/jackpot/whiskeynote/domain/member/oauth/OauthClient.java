package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;

/**
 * Provider별 OAuth code → OauthUserInfo 변환
 * - 구현: GoogleOauthClient, KakaoOauthClient, NaverOauthClient (@Component)
 * - 반환: providerUserId 필수, email/nickname nullable
 */
public interface OauthClient {

    // provider 식별
    // 의도: OauthLoginService가 List에서 provider별 구현체 선택
    AuthProvider provider();

    // code → 사용자 정보
    // 의도: authorization code → provider access_token → 사용자 식별 정보
    OauthUserInfo fetchUserInfo(String code);
}

