package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Naver OAuth 클라이언트
 * - env: OAUTH_NAVER_CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
 * - token: nid.naver.com/oauth2.0/token, userinfo: openapi.naver.com/v1/nid/me
 */
@Component
@RequiredArgsConstructor
public class NaverOauthClient implements OauthClient {

    private final OauthProperties oauthProperties;

    private final RestClient restClient = RestClient.create();

    @Override
    public AuthProvider provider() {
        return AuthProvider.NAVER;
    }

    // fetchUserInfo
    // 의도: Naver code → token → /v1/nid/me로 providerId·이메일·닉네임 조회
    @Override
    public OauthUserInfo fetchUserInfo(String code) {
        OauthProperties.Provider naver = require(oauthProperties.naver(), "naver");

        Map tokenRes = restClient.post()
                .uri("https://nid.naver.com/oauth2.0/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=authorization_code"
                        + "&client_id=" + encode(naver.clientId())
                        + (isBlank(naver.clientSecret()) ? "" : "&client_secret=" + encode(naver.clientSecret()))
                        + "&redirect_uri=" + encode(naver.redirectUri())
                        + "&code=" + encode(code)
                        + "&state=" + encode("state"))
                .retrieve()
                .body(Map.class);

        String accessToken = tokenRes == null ? null : (String) tokenRes.get("access_token");
        if (isBlank(accessToken)) {
            throw new IllegalStateException("OAuth 토큰 교환에 실패했습니다.");
        }

        Map userRes = restClient.get()
                .uri("https://openapi.naver.com/v1/nid/me")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (userRes == null) {
            throw new IllegalStateException("OAuth 사용자 정보 조회에 실패했습니다.");
        }
        Map response = (Map) userRes.get("response");
        if (response == null || response.get("id") == null) {
            throw new IllegalStateException("OAuth 사용자 정보 조회에 실패했습니다.");
        }

        String providerUserId = String.valueOf(response.get("id"));
        String email = (String) response.get("email");
        String nickname = (String) response.get("nickname");

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

