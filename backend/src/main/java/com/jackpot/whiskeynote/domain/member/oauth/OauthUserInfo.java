package com.jackpot.whiskeynote.domain.member.oauth;

public record OauthUserInfo(
        String providerUserId,
        String email,
        String nickname
) {
}

