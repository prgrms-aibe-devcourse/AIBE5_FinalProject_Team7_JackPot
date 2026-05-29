package com.jackpot.whiskeynote.domain.community.notice.controller;

import com.jackpot.whiskeynote.domain.community.notice.service.NoticeService;
import com.jackpot.whiskeynote.domain.community.post.dto.PostSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/community/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public Page<PostSummaryResponse> getNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return noticeService.getNotices(page, size);
    }
}
