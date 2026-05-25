package com.jackpot.whiskeynote.domain.whiskey.controller;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;
import com.jackpot.whiskeynote.domain.whiskey.service.WhiskeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class WhiskeyController {
    private final WhiskeyService whiskeyService;
    // 위스키 전체 조회 (페이징)
    @GetMapping("/api/v1/whiskeys")
    public Page<WhiskeyCardResponse> getWhikeys(
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
}
