package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * AUTH-03 1단계: Provider Authorization URL 생성
 *
 * <p>호출: {@code AuthController.oauthRedirect} → 302 Location 헤더로 반환.
 * 프론트는 이 URL을 직접 만들지 않고 {@code GET /api/v1/auth/oauth/{provider}}만 호출.
 *
 * <p>필수 설정 ({@code OauthProperties}):
 * {@code oauth.{provider}.client-id}, {@code redirect-uri}
 * — 누락 시 {@code IllegalStateException} (프론트에 SERVICE_UNAVAILABLE 등으로 노출될 수 있음).
 *
 * <p>redirect-uri 예: {@code http://{EC2_IP}/oauth/kakao/callback}
 * (카카오/Google/네이버 개발자 콘솔 등록 URI와 byte-level 일치 필요)
 */
@Service
@RequiredArgsConstructor
public class OauthRedirectService {

    private final OauthProperties oauthProperties;

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

