package com.jackpot.whiskeynote.domain.member.oauth;

import org.springframework.boot.context.properties.ConfigurationProperties;

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

