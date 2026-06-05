package com.jackpot.whiskeynote.domain.admin.dto;

public record WhiskeyRequestReviewRequest(
        String status  // "approved" or "rejected"
) { }