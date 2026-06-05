package com.jackpot.whiskeynote.domain.admin.dto;

import java.util.Map;

/**
 * 사용자 위스키 등록, 수정 요청 처리 폼 DTO
 * @param description 요청 내용(JSON)
 */
public record WhiskeyRequestForm(
        Map<String, Object> description
) { }