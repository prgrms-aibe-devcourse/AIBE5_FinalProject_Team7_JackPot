package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Kakao OAuth 클라이언트
 * - env: OAUTH_KAKAO_CLIENT_ID, CLIENT_SECRET(선택), REDIRECT_URI
 * - token: kauth.kakao.com/oauth/token, userinfo: kapi.kakao.com/v2/user/me
 */
@Component
@RequiredArgsConstructor
public class KakaoOauthClient implements OauthClient {

    private final OauthProperties oauthProperties;

    private final RestClient restClient = RestClient.create();

    @Override
    public AuthProvider provider() {
        return AuthProvider.KAKAO;
    }

    // fetchUserInfo
    // 의도: 카카오 code를 access_token으로 바꾼 뒤 /v2/user/me로 providerId·닉네임 조회
    @Override
    public OauthUserInfo fetchUserInfo(String code) {
        OauthProperties.Provider kakao = require(oauthProperties.kakao(), "kakao");

        // 1) code -> access_token
        Map tokenRes = restClient.post()
                .uri("https://kauth.kakao.com/oauth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=authorization_code"
                        + "&client_id=" + encode(kakao.clientId())
                        + "&redirect_uri=" + encode(kakao.redirectUri())
                        + "&code=" + encode(code)
                        + (isBlank(kakao.clientSecret()) ? "" : "&client_secret=" + encode(kakao.clientSecret())))
                .retrieve()
                .body(Map.class);

        String accessToken = tokenRes == null ? null : (String) tokenRes.get("access_token");
        if (isBlank(accessToken)) {
            throw new IllegalStateException("OAuth 토큰 교환에 실패했습니다.");
        }

        // 2) access_token -> user info
        Map me = restClient.get()
                .uri("https://kapi.kakao.com/v2/user/me")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (me == null || me.get("id") == null) {
            throw new IllegalStateException("OAuth 사용자 정보 조회에 실패했습니다.");
        }

        String providerUserId = String.valueOf(me.get("id"));
        Map account = (Map) me.get("kakao_account");
        String email = account == null ? null : (String) account.get("email");
        Map profile = account == null ? null : (Map) account.get("profile");
        String nickname = profile == null ? null : (String) profile.get("nickname");

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

