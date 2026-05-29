package com.jackpot.whiskeynote.domain.member.oauth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * OAuth 설정 바인딩
 * - .env OAUTH_* → application-prod.yaml oauth.* → 이 record
 * - redirect-uri: provider 콘솔 = 프론트 /oauth/{provider}/callback = env 값 일치 필수
 * - client-secret: 선택 (Kakao 등, 있으면 token 요청에 포함)
 */
@ConfigurationProperties(prefix = "oauth")
public record OauthProperties(
        Provider google,
        Provider kakao,
        Provider naver
) {
    public record Provider(
            String clientId,
            String clientSecret,
            String redirectUri
    ) {
    }
}

