package com.jackpot.whiskeynote.domain.member.oauth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * OAuth 설정 바인딩 — env → YAML → Java
 *
 * <p>로컬/EC2: 루트 {@code .env}의 {@code OAUTH_GOOGLE_CLIENT_ID} 등
 * → {@code application-prod.yaml}의 {@code oauth.google.client-id}
 * → 이 record.
 *
 * <p>redirect-uri는 Authorization 요청·token 교환·provider 콘솔·프론트 callback 경로가 모두 같아야 함.
 * client-secret은 Kakao 등 선택 사항(있으면 token 요청에 포함).
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

