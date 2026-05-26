package com.jackpot.whiskeynote.domain.community.dto;

import com.jackpot.whiskeynote.domain.community.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.entity.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PostCreateRequest(
        @NotNull PostType postType,
        @NotNull PostCategory category,
        @NotBlank @Size(max = 512) String title,
        @NotBlank String context,
        List<Long> whiskeyIds
) {}