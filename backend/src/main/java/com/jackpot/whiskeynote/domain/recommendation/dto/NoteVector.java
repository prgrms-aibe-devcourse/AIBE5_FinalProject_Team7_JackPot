package com.jackpot.whiskeynote.domain.recommendation.dto;

import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public record NoteVector(
    double[] scoreVec,
    Map<Long, Double> tagVector
) {

    public static NoteVector from(double[] scoreVec, Map<Long, Double> tagVector) {
        return new NoteVector(scoreVec, tagVector);
    }


    public static NoteVector fromCache(WhiskeysNoteCache cache) {
        return new NoteVector(
            normalizeScore(cache),
            buildTagVector(cache)
        );
    }

    public static NoteVector fromSurvey(double[] scoreVec, Set<Long> tagIdSet) {
        Map<Long, Double> tagVector = new HashMap<>();
        for (Long tagId : tagIdSet) {
            tagVector.put(tagId, 1.0);
        }
        return new NoteVector(scoreVec, tagVector);
    }

    private static double[] normalizeScore(WhiskeysNoteCache cache) {
        double[] res = new double[5];

        res[0] = ((double) cache.getBodyScore() / cache.getCount() - 1) / 9 * 100;
        res[1] = ((double) cache.getFinishScore() / cache.getCount() - 1) / 9 * 100;
        res[2] = ((double) cache.getSmokyScore() / cache.getCount() - 1) / 9 * 100;
        res[3] = ((double) cache.getSpicyScore() / cache.getCount() - 1) / 9 * 100;
        res[4] = ((double) cache.getSweetScore() / cache.getCount() - 1) / 9 * 100;

        return res;
    }

    private static Map<Long, Double> buildTagVector(WhiskeysNoteCache cache) {
        Map<Long, Double> res = new HashMap<>();
        for (AvgWhiskeyTag avgTag : cache.getAvgWhiskeyTags()) {
            res.put(avgTag.getTag().getId(), (double) avgTag.getCount() / cache.getCount());
        }
        return res;
    }
}
