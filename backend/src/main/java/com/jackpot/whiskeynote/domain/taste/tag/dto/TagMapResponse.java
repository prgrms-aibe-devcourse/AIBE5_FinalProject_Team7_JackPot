package com.jackpot.whiskeynote.domain.taste.tag.dto;

import java.util.List;
import java.util.Map;

public record TagMapResponse(
    Map<String, List<TagResponse>> tags
) {
}
