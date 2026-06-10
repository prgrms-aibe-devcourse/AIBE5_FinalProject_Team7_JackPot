package com.jackpot.whiskeynote.domain.lounge.controller;

import com.jackpot.whiskeynote.domain.lounge.dto.LoungePostResponse;
import com.jackpot.whiskeynote.domain.lounge.service.LoungeService;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LoungeController {
    private final LoungeService loungeService;

    // 팔로우한 사람 게시물 조회
    @GetMapping("/api/v1/lounge/feed")
    public List<LoungePostResponse> getFeed(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
            ) {
        return loungeService.getLoungeFeed(principal.userId(), page, size);
    }
}
