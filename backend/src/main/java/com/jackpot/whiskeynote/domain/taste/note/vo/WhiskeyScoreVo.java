package com.jackpot.whiskeynote.domain.taste.note.vo;

import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteCreateRequest;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteUpdateRequest;

public record WhiskeyScoreVo(
    Short bodyScore,
    Short finishScore,
    Short smokyScore,
    Short spicyScore,
    Short sweetScore
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