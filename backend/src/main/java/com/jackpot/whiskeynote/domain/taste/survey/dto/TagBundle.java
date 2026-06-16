package com.jackpot.whiskeynote.domain.taste.survey.dto;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;

import java.util.List;
import java.util.Set;

/**
 * 설문에서 선택한 향(nose) / 맛(taste) 태그 묶음
 * - noseTags  : 향 카테고리 Tag 엔티티 목록
 * - tasteTags : 맛 카테고리 Tag 엔티티 목록
 * - allTagIds : nose + taste 태그 ID 합집합 (추천 계산에 사용)
 */
public record TagBundle(
        List<Tag> noseTags,
        List<Tag> tasteTags,
        Set<Long> allTagIds
) {}
