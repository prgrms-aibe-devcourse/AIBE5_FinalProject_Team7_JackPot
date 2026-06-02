package com.jackpot.whiskeynote.domain.taste.survey.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

public record SurveyRequest(
        @Min(1) @Max(5) int sweetChoice,
        @Min(1) @Max(5) int bodyChoice,
        @Min(1) @Max(5) int smokyChoice,
        @Min(1) @Max(5) int spicyChoice,
        @Min(1) @Max(5) int finishChoice,
        List<Long> noseTags,
        List<Long> tasteTags
) {}
