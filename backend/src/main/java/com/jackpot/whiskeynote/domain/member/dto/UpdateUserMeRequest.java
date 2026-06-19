package com.jackpot.whiskeynote.domain.member.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * USER-02 내 프로필 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class UpdateUserMeRequest {

    @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하여야 합니다.")
    private String nickname;

    /**
     * S3 object key (예: profiles/1/uuid.jpg). presign 업로드 후 PATCH로 저장.
     */
    @Size(max = 255, message = "프로필 이미지 경로가 너무 깁니다.")
    private String profileImageUrl;

    @Size(max = 500, message = "소개는 500자 이하여야 합니다.")
    private String introduction;
}
