package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Google OAuth 클라이언트
 * - env: OAUTH_GOOGLE_CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
 * - token: accounts.google.com, userinfo: oauth2.googleapis.com/tokeninfo
 */
@Component
@RequiredArgsConstructor
public class GoogleOauthClient implements OauthClient {

    private final OauthProperties oauthProperties;

    private final RestClient restClient = RestClient.create();

    @Override
    public AuthProvider provider() {
        return AuthProvider.GOOGLE;
    }

    // fetchUserInfo
    // 의도: Google code → token → userinfo로 providerId·이메일·이름 조회
    @Override
    public OauthUserInfo fetchUserInfo(String code) {
        OauthProperties.Provider google = require(oauthProperties.google(), "google");

        Map tokenRes = restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=authorization_code"
                        + "&client_id=" + encode(google.clientId())
                        + (isBlank(google.clientSecret()) ? "" : "&client_secret=" + encode(google.clientSecret()))
                        + "&redirect_uri=" + encode(google.redirectUri())
                        + "&code=" + encode(code))
                .retrieve()
                .body(Map.class);

        String accessToken = tokenRes == null ? null : (String) tokenRes.get("access_token");
        if (isBlank(accessToken)) {
            throw new IllegalStateException("OAuth 토큰 교환에 실패했습니다.");
        }

        Map user = restClient.get()
                .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (user == null || user.get("sub") == null) {
            throw new IllegalStateException("OAuth 사용자 정보 조회에 실패했습니다.");
        }

        String providerUserId = String.valueOf(user.get("sub"));
        String email = (String) user.get("email");
        String nickname = (String) user.get("name");

        return new OauthUserInfo(providerUserId, email, nickname);
    }

    private static OauthProperties.Provider require(OauthProperties.Provider provider, String name) {
        if (provider == null || isBlank(provider.clientId()) || isBlank(provider.redirectUri())) {
            throw new IllegalStateException("OAuth 설정이 누락되었습니다: oauth." + name + ".client-id / redirect-uri");
        }
        return provider;
    }

    private static String encode(String s) {
        return s == null ? "" : java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}

