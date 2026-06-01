package com.jackpot.whiskeynote.domain.taste.review.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ReviewUpdateRequest(
        @NotNull(message = "평점은 필수입니다.")
        @DecimalMin(value = "0.0", message = "평점은 0 이상이어야 합니다.")
        @DecimalMax(value = "5.0", message = "평점은 5 이하이어야 합니다.")
        BigDecimal rating,

        String publicText,

        Long attachedNoteId
) {
}
