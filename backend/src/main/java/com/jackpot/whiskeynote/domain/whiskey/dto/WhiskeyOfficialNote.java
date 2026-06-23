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
public class WhiskeyOfficialNote {
    private Map<String, String> note = new LinkedHashMap<>();
}
