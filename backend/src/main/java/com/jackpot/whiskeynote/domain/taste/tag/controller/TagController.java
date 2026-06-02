package com.jackpot.whiskeynote.domain.taste.tag.controller;

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

    private final TagRepository tagRepository;

    @GetMapping
    public List<Tag> getTags(@RequestParam(required = false) TagCategory category) {
        if (category != null) {
            return tagRepository.findAll().stream()
                    .filter(t -> t.getCategory() == category)
                    .toList();
        }
        return tagRepository.findAll();
    }
}
