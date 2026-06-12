package com.jackpot.whiskeynote.domain.taste.note.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * AI 테이스팅 노트 분석 요청 DTO
 * - memo: 사용자가 자유롭게 입력한 테이스팅 메모
 */
public record AiNoteAnalyzeRequest(
        @NotBlank(message = "메모를 입력해주세요.")
        @Size(max = 2000, message = "메모는 최대 2000자까지 입력 가능합니다.")
        String memo
) {}
