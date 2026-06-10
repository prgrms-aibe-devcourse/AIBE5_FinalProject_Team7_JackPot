package com.jackpot.whiskeynote.domain.admin.controller;

import com.jackpot.whiskeynote.domain.admin.dto.ReportActionDto;
import com.jackpot.whiskeynote.domain.admin.dto.ReportCreateDto;
import com.jackpot.whiskeynote.domain.admin.dto.ReportDetailDto;
import com.jackpot.whiskeynote.domain.admin.dto.ReportDto;
import com.jackpot.whiskeynote.domain.admin.service.ReportService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.SecurityUserAccessor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    /**
     * RPT-01: 신고 생성
     * @param req 신청한 신고 내역
     */
    @PostMapping("/api/v1/reports")
    public ApiResponse<Void> createReport(@RequestBody ReportCreateDto req) {
        Long userId = SecurityUserAccessor.requireUserId();

        reportService.createReport(userId, req);
        return ApiResponse.ok(null);
    }

    /**
     * ADM-03: 신고 목록 조회
     * @param status 신고 상태
     * @param page 페이지 숫자
     * @param size 페이지 크기
     * @return 신고 목록
     */
    @GetMapping("/api/v1/admin/reports")
    public ApiResponse<Page<ReportDto>> findAllByStatus(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ){
        return ApiResponse.ok(reportService.findAllByStatus(status, page, size));
    }

    /**
     * ADM-03-1: 신고 상세 + 처리 이력 목록 조회
     * @param id 신고 id
     * @return 신고 상세 + 처리 이력 목록
     */
    @GetMapping("/api/v1/admin/reports/{id}")
    public ApiResponse<ReportDetailDto> findById(@PathVariable Long id) {
        return ApiResponse.ok(reportService.findById(id));
    }

    /**
     * ADM-04: 신고 처리
     * @param id 신고 id
     * @param req 신고 처리 데이터
     */
    @PostMapping("/api/v1/admin/reports/{id}/actions")
    public ApiResponse<ReportDetailDto> createReportAction(
            @PathVariable Long id,
            @RequestBody ReportActionDto req) {
        Long userId = SecurityUserAccessor.requireUserId();

        return ApiResponse.ok(reportService.createReportAction(id, userId, req));
    }
}
