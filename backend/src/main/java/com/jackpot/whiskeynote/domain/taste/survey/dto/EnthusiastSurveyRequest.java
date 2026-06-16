package com.jackpot.whiskeynote.domain.taste.survey.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;
import java.util.Map;

/**
 * 애호가 설문 요청 DTO
 * - Q1~Q5 : 바디/피니시/스모키/스파이시/스위트 선택 (1~5, 입문자와 동일한 range)
 * - Q6    : 선호 위스키 스타일 (복수 선택, 문자열 키)
 * - Q7    : 노즈 태그 + 선호 강도 {tagId: 1(좋아함)|2(매우 좋아함)}
 * - Q8    : 테이스트 태그 + 선호 강도
 * - Q9    : 탐험 성향 1=보수형 2=균형형 3=탐험형
 */
public record EnthusiastSurveyRequest(
        @Min(1) @Max(5) int bodyChoice,
        @Min(1) @Max(5) int finishChoice,
        @Min(1) @Max(5) int smokyChoice,
        @Min(1) @Max(5) int spicyChoice,
        @Min(1) @Max(5) int sweetChoice,
        List<String> styleTags,
        Map<Long, Integer> noseTags,
        Map<Long, Integer> tasteTags,
        @Min(1) @Max(3) int explorationLevel
) {}
