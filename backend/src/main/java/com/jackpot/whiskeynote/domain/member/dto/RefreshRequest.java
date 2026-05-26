package com.jackpot.whiskeynote.domain.member.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * AUTH-06 AccessToken 재발급 요청 DTO
 */
@Getter
@NoArgsConstructor
public class RefreshRequest {

    @NotBlank(message = "refreshToken은 필수입니다.")
    private String refreshToken;
}
