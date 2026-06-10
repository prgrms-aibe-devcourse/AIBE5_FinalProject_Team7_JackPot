// 위스키 칼럼 REST API 진입점 — 관리자 등록과 일반 조회 엔드포인트를 분리 관리
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

    // /api/v1/admin/** 경로는 SecurityConfig에서 ADMIN 권한을 일괄 적용하므로
    // 이 메서드에 별도의 @PreAuthorize를 달지 않아도 관리자만 접근할 수 있다.
    // 새로운 admin 엔드포인트를 추가할 때는 SecurityConfig의 패턴을 반드시 확인할 것.
    @PostMapping("/api/v1/admin/columns")
    @ResponseStatus(HttpStatus.CREATED)
    public WhiskeyColumnResponse createColumn(@RequestBody WhiskeyColumnRequest request) {
        return columnService.save(request);
    }

    @GetMapping("/api/v1/columns")
    public Page<WhiskeyColumnResponse> getColumns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return columnService.getColumns(page, size);
    }

    @GetMapping("/api/v1/columns/{id}")
    public WhiskeyColumnResponse getColumn(@PathVariable Long id) {
        return columnService.getColumn(id);
    }

    // 관련 칼럼 조회는 특정 칼럼 ID가 아닌 위스키 이름 문자열로 검색하므로
    // PathVariable 대신 RequestParam을 사용한다.
    // 예: GET /api/v1/columns/related?keyword=맥캘란
    // PathVariable로 설계하면 /api/v1/columns/related가 ID=related로 라우팅될 수 있어
    // 위의 {id} 경로와 충돌이 발생한다.
    @GetMapping("/api/v1/columns/related")
    public List<WhiskeyColumnResponse> getRelatedColumns(@RequestParam String keyword) {
        return columnService.getRelatedColumns(keyword);
    }
}
