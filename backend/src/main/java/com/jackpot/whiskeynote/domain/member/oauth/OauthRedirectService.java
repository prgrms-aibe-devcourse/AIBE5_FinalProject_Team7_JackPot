package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * AUTH-03 1단계 — Provider Authorization URL 생성
 * - 호출: GET /api/v1/auth/oauth/{provider} → 302 redirect
 * - 필수: oauth.{provider}.client-id, redirect-uri (.env → OauthProperties)
 * - redirect-uri 예: http://{host}/oauth/kakao/callback (provider 콘솔·프론트와 동일)
 */
@Service
@RequiredArgsConstructor
public class OauthRedirectService {

    private final OauthProperties oauthProperties;

    // Authorization URL 생성
    // 의도: provider별 authorize URL 조립 — env의 client-id·redirect-uri 사용
    public String buildAuthorizationUrl(AuthProvider provider) {
        return switch (provider) {
            case GOOGLE -> buildGoogleUrl();
            case KAKAO -> buildKakaoUrl();
            case NAVER -> buildNaverUrl();
            default -> throw new IllegalArgumentException("지원하지 않는 provider 입니다.");
        };
    }

    private String buildGoogleUrl() {
        OauthProperties.Provider google = require(oauthProperties.google(), "google");
        return UriComponentsBuilder
                .fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("response_type", "code")
                .queryParam("client_id", google.clientId())
                .queryParam("redirect_uri", google.redirectUri())
                .queryParam("scope", "openid email profile")
                .queryParam("state", randomState())
                .build()
                .encode()
                .toUriString();
    }

    private String buildKakaoUrl() {
        OauthProperties.Provider kakao = require(oauthProperties.kakao(), "kakao");
        return UriComponentsBuilder
                .fromUriString("https://kauth.kakao.com/oauth/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", kakao.clientId())
                .queryParam("redirect_uri", kakao.redirectUri())
                .queryParam("state", randomState())
                .build()
                .encode()
                .toUriString();
    }

    private String buildNaverUrl() {
        OauthProperties.Provider naver = require(oauthProperties.naver(), "naver");
        return UriComponentsBuilder
                .fromUriString("https://nid.naver.com/oauth2.0/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", naver.clientId())
                .queryParam("redirect_uri", naver.redirectUri())
                .queryParam("state", randomState())
                .build()
                .encode()
                .toUriString();
    }

    // OAuth 설정 검증
    // 의도: EC2 .env 미설정 시 조기 실패 — 잘못된 redirect로 provider 오류 방지
    private static OauthProperties.Provider require(OauthProperties.Provider provider, String name) {
        if (provider == null || isBlank(provider.clientId()) || isBlank(provider.redirectUri())) {
            throw new IllegalStateException("OAuth 설정이 누락되었습니다: oauth." + name + ".client-id / redirect-uri");
        }
        return provider;
    }

    private static String randomState() {
        // MVP: state 검증까지 구현되지 않아 고정값 사용
        return "state";
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}

