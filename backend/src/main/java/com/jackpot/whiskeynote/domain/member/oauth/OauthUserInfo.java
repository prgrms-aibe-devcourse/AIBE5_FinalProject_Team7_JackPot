package com.jackpot.whiskeynote.domain.member.oauth;

/** Provider API 응답을 DB upsert용 공통 형태로 정규화. providerUserId 필수. */
public record OauthUserInfo(
        String providerUserId,
        String email,
        String nickname
) {
}

