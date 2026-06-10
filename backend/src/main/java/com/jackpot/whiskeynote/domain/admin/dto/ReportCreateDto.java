package com.jackpot.whiskeynote.domain.admin.dto;

import com.jackpot.whiskeynote.domain.admin.entity.ReportReason;
import com.jackpot.whiskeynote.domain.admin.entity.ReportTargetType;

public record ReportCreateDto(
        Long targetId,
        ReportTargetType targetType,
        ReportReason reason,
        String detail
) {

}
