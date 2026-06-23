package com.jackpot.whiskeynote.domain.whiskey.dto;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class WhiskeyDescriptionDto {
    // 제품 소개
    private Map<String, String> introduction = new LinkedHashMap<>();
    // 핵심 특징
    private Map<String, String> feature = new LinkedHashMap<>();
}
