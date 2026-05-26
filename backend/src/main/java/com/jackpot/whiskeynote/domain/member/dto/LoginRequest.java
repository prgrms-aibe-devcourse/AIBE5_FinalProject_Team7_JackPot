package com.jackpot.whiskeynote.domain.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AUTH-02 로그인 요청 DTO
 * - @Getter/@Setter: Jackson 역직렬화 + 필드 접근
 * - @NoArgsConstructor: Jackson이 JSON → 객체 변환 시 기본 생성자 필요
 */
@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;
}
