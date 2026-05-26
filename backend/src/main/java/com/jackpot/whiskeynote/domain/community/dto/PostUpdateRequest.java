package com.jackpot.whiskeynote.domain.community.dto;

import com.jackpot.whiskeynote.domain.community.entity.PostCategory;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PostUpdateRequest(
        @Size(max = 512) String title,
        String context,
        PostCategory category,
        List<Long> whiskeyIds
) {}