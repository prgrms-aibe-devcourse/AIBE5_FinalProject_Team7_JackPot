package com.jackpot.whiskeynote.domain.taste.vo;

import com.jackpot.whiskeynote.domain.taste.dto.TastingNoteCreateRequest;
import com.jackpot.whiskeynote.domain.taste.dto.TastingNoteUpdateRequest;
import com.jackpot.whiskeynote.domain.taste.entity.TastingNote;

public record WhiskeyScoreVo(
    Integer bodyScore,
    Integer finishScore,
    Integer smokyScore,
    Integer spicyScore,
    Integer sweetScore
) {
    public static WhiskeyScoreVo from(TastingNoteCreateRequest request) {
        return new WhiskeyScoreVo(
            request.bodyScore(),
            request.finishScore(),
            request.smokyScore(),
            request.spicyScore(),
            request.sweetScore()
        );
    }

    public static WhiskeyScoreVo from(TastingNoteUpdateRequest request) {
        return new WhiskeyScoreVo(
            request.bodyScore(),
            request.finishScore(),
            request.smokyScore(),
            request.spicyScore(),
            request.sweetScore()
        );
    }
}