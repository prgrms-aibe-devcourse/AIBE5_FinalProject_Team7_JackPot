package com.jackpot.whiskeynote.domain.taste.survey.controller;

import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyRequest;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyResultResponse;
import com.jackpot.whiskeynote.domain.taste.survey.service.TasteSurveyService;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/taste/survey")
@RequiredArgsConstructor
public class TasteSurveyController {

    private final TasteSurveyService surveyService;

    /** 설문 제출 → 추천 결과 계산만 (저장 안 함, 로그인 불필요) */
    @PostMapping
    public SurveyResultResponse submit(
            @Valid @RequestBody SurveyRequest request
    ) {
        return surveyService.calculate(request);
    }

    /** 취향 반영하기 — 계산 + DB 저장 (로그인 필수) */
    @PostMapping("/save")
    public SurveyResultResponse submitAndSave(
            @Valid @RequestBody SurveyRequest request,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        return surveyService.calculateAndSave(request, principal.userId());
    }

    /** 애호가 설문 제출 → 추천 결과 계산만 (저장 안 함, 로그인 불필요) */
    @PostMapping("/enthusiast")
    public SurveyResultResponse submitEnthusiast(
            @Valid @RequestBody SurveyRequest request
    ) {
        return surveyService.calculateEnthusiast(request);
    }

    /** 애호가 취향 반영하기 — 계산 + DB 저장 (로그인 필수) */
    @PostMapping("/enthusiast/save")
    public SurveyResultResponse submitAndSaveEnthusiast(
            @Valid @RequestBody SurveyRequest request,
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        return surveyService.calculateAndSaveEnthusiast(request, principal.userId());
    }

    /** 내 저장된 취향 프로필 조회 (로그인 필수) */
    @GetMapping("/me")
    public SurveyResultResponse getMyProfile(
            @AuthenticationPrincipal JwtUserPrincipal principal
    ) {
        return surveyService.getMyProfile(principal.userId());
    }
}
