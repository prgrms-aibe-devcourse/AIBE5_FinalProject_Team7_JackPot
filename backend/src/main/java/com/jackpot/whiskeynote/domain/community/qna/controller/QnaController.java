package com.jackpot.whiskeynote.domain.community.qna.controller;

import com.jackpot.whiskeynote.domain.community.post.dto.PostSummaryResponse;
import com.jackpot.whiskeynote.domain.community.qna.service.QnaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/community/qna")
@RequiredArgsConstructor
public class QnaController {

    private final QnaService qnaService;

    @GetMapping
    public Page<PostSummaryResponse> getQnaPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return qnaService.getQnaPosts(page, size);
    }
}
