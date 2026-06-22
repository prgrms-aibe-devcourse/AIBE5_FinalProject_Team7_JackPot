package com.jackpot.whiskeynote.domain.taste.note.vo;

import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteCreateRequest;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteUpdateRequest;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;

import java.util.Arrays;

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

    public short[] toArray() {
        return new short[]{bodyScore, finishScore, smokyScore, spicyScore, sweetScore};
    }
}