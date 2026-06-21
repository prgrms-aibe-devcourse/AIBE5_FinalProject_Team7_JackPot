package com.jackpot.whiskeynote.domain.taste.tag.controller;

import com.jackpot.whiskeynote.domain.taste.tag.TagService;
import com.jackpot.whiskeynote.domain.taste.tag.dto.TagMapResponse;
import com.jackpot.whiskeynote.domain.taste.tag.dto.TagResponse;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public TagMapResponse getTags(@RequestParam(required = false) TagCategory category) {
        return tagService.getTags(category);
    }
}
