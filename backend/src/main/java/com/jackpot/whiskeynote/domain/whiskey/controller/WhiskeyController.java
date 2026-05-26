package com.jackpot.whiskeynote.domain.whiskey.controller;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyDetailResponse;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyFilterRequest;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.service.WhiskeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WhiskeyController {
    private final WhiskeyService whiskeyService;
    // 위스키 전체 조회 (페이징)
    @GetMapping("/api/v1/whiskeys")
    public Page<WhiskeyCardResponse> getWhiskeys(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ){
        return whiskeyService.getWhiskeys(page, size);
    }
    // 위스키 이름 검색 (포함검색, 대소문자 구분X)
    @GetMapping("/api/v1/whiskeys/search")
    public Page<WhiskeyCardResponse> searchWhiskeys(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return whiskeyService.searchWhiskeys(q, page, size);
    }
    // 위스키 필터링 검색
    @GetMapping("/api/v1/whiskeys/filter")
    public Page<WhiskeyCardResponse> filterWhiskeys(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<WhiskeyType> types,
            @RequestParam(required = false) List<String> noseTags,
            @RequestParam(required = false) List<String> tasteTags,
            @RequestParam(required = false) Double minAbv,
            @RequestParam(required = false) Double maxAbv,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ){
        WhiskeyFilterRequest request = new WhiskeyFilterRequest(
                keyword,
                types,
                noseTags,
                tasteTags,
                minAbv,
                maxAbv,
                minAge,
                maxAge,
                page,
                size
        );

        return whiskeyService.filterWhiskeys(request);
    }
    // 위스키 상세 조회
    @GetMapping("/api/v1/whiskeys/{id}")
    public WhiskeyDetailResponse getWhiskeyDetail(@PathVariable Long id) {
        return whiskeyService.getWhiskeyDetail(id);
    }
}
