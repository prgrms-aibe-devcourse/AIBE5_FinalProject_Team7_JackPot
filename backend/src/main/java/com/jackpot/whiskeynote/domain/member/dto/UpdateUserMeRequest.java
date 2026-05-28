package com.jackpot.whiskeynote.domain.member.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(
            regexp = "^[a-zA-Z0-9가-힣_]+$",
            message = "닉네임은 한글/영문/숫자/_(언더스코어)만 사용할 수 있습니다."
    )
    private String nickname;

    /**
     * S3 object key (예: profiles/1/uuid.jpg). presign 업로드 후 PATCH로 저장.
     */
    @Size(max = 255, message = "프로필 이미지 경로가 너무 깁니다.")
    private String profileImageUrl;

    /**
     * 보틀 공유 참여 여부
     */
    private Boolean bottleShareOptIn;

    /**
     * 마케팅 수신 동의 여부
     */
    private Boolean marketingOptIn;
}
