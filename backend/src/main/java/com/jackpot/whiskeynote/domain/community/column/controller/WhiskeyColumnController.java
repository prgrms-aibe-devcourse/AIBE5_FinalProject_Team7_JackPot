package com.jackpot.whiskeynote.domain.community.column.controller;

import com.jackpot.whiskeynote.domain.community.column.dto.WhiskeyColumnRequest;
import com.jackpot.whiskeynote.domain.community.column.dto.WhiskeyColumnResponse;
import com.jackpot.whiskeynote.domain.community.column.service.WhiskeyColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WhiskeyColumnController {

    private final WhiskeyColumnService columnService;

    /** 크롤러가 수집한 칼럼 데이터 등록 (관리자 전용) */
    @PostMapping("/api/v1/admin/columns")
    @ResponseStatus(HttpStatus.CREATED)
    public WhiskeyColumnResponse createColumn(@RequestBody WhiskeyColumnRequest request) {
        return columnService.save(request);
    }

    /** 전체 칼럼 목록 조회 */
    @GetMapping("/api/v1/columns")
    public Page<WhiskeyColumnResponse> getColumns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return columnService.getColumns(page, size);
    }

    /** 칼럼 단건 조회 */
    @GetMapping("/api/v1/columns/{id}")
    public WhiskeyColumnResponse getColumn(@PathVariable Long id) {
        return columnService.getColumn(id);
    }

    /** 위스키 이름 기반 관련 칼럼 조회 */
    @GetMapping("/api/v1/columns/related")
    public List<WhiskeyColumnResponse> getRelatedColumns(@RequestParam String keyword) {
        return columnService.getRelatedColumns(keyword);
    }
}
