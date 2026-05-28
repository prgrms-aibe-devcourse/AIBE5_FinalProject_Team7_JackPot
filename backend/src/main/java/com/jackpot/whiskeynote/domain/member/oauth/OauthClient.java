package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;

public interface OauthClient {

    AuthProvider provider();

    OauthUserInfo fetchUserInfo(String code);
}

