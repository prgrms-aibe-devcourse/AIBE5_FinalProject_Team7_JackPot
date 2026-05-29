package com.jackpot.whiskeynote.domain.community.free.controller;

import com.jackpot.whiskeynote.domain.community.free.service.FreeBoardService;
import com.jackpot.whiskeynote.domain.community.post.dto.PostSummaryResponse;
import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/community/free")
@RequiredArgsConstructor
public class FreeBoardController {

    private final FreeBoardService freeBoardService;

    @GetMapping
    public Page<PostSummaryResponse> getFreePosts(
            @RequestParam(required = false) PostCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return freeBoardService.getFreePosts(category, page, size);
    }
}
