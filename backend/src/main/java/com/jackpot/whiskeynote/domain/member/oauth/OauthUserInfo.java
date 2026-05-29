package com.jackpot.whiskeynote.domain.member.oauth;

/** OAuth 사용자 정보 — providerUserId 필수, email/nickname nullable */
public record OauthUserInfo(
        String providerUserId,
        String email,
        String nickname
) {
}

