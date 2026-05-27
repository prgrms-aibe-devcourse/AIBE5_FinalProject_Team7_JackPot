package com.jackpot.whiskeynote.domain.community.column.controller;

import com.jackpot.whiskeynote.domain.community.column.service.ColumnService;
import com.jackpot.whiskeynote.domain.community.post.dto.PostSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/community/columns")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    @GetMapping
    public Page<PostSummaryResponse> getColumns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return columnService.getColumns(page, size);
    }
}
