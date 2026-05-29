package com.jackpot.whiskeynote.domain.member.dto;

import jakarta.validation.constraints.NotBlank;

public record OauthCallbackRequest(
        @NotBlank(message = "code는 필수입니다.")
        String code
) {
}

