package com.jackpot.whiskeynote.domain.taste.survey.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;
import java.util.Map;

/**
 * 입문자/애호가 설문 공통 요청 DTO
 *
 * 공통 (Q1~Q5): sweetChoice, bodyChoice, smokyChoice, spicyChoice, finishChoice
 * 입문자 전용  : noseTags (ID 목록), tasteTags (ID 목록)
 * 애호가 추가  : noseTagWeights/tasteTagWeights (ID→강도 맵), styleTags, explorationLevel
 */
public record SurveyRequest(
        @Min(1) @Max(5) int sweetChoice,
        @Min(1) @Max(5) int bodyChoice,
        @Min(1) @Max(5) int smokyChoice,
        @Min(1) @Max(5) int spicyChoice,
        @Min(1) @Max(5) int finishChoice,

        // 입문자: 태그 ID 목록
        List<Long> noseTags,
        List<Long> tasteTags,

        // 애호가: 태그 ID → 강도(1=좋아함, 2=매우 좋아함)
        Map<Long, Integer> noseTagWeights,
        Map<Long, Integer> tasteTagWeights,

        // 애호가: 위스키 스타일 선택
        List<String> styleTags,

        Integer ageMin,   // null 가능
        Integer ageMax,   // null 가능

        // 애호가: 탐험 성향 1=보수형 2=균형형 3=탐험형
        @Min(1) @Max(3) Integer explorationLevel
) {}
