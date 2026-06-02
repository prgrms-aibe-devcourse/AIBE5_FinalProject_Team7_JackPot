package com.jackpot.whiskeynote.domain.whiskey.entity;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Entity
@Getter
@Table(name = "whiskeys_note_cache")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WhiskeysNoteCache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiskey_id")
    private Whiskey whiskey;

    private Integer count;

    private Long bodyScore;
    private Long finishScore;
    private Long smokyScore;
    private Long spicyScore;
    private Long sweetScore;

    @OneToMany(mappedBy = "cache", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvgWhiskeyTag> avgWhiskeyTags = new ArrayList<>();

    /**
     * WhiskeysNoteCache 초기화 정적 팩토리 메서드입니다.
     *
     * <p>해당 위스키에 대한 캐시가 존재하지 않을 때 최초 1회 호출됩니다.
     * 모든 점수 합산값과 count는 0으로 초기화됩니다.
     *
     * @param whiskey 캐시를 생성할 대상 위스키
     * @return 초기화된 WhiskeysNoteCache 인스턴스
     */
    public static WhiskeysNoteCache init(Whiskey whiskey) {
        WhiskeysNoteCache cache = new WhiskeysNoteCache();
        cache.whiskey = whiskey;
        cache.count = 0;
        cache.bodyScore = 0L;
        cache.finishScore = 0L;
        cache.smokyScore = 0L;
        cache.spicyScore = 0L;
        cache.sweetScore = 0L;
        return cache;
    }

    /**
     * avgWhiskeyTags를 외부에서 직접 수정하지 못하도록 unmodifiableList로 노출합니다.
     * 변경은 반드시 applyTags(), revertTags()를 통해서만 가능합니다.
     */
    public List<AvgWhiskeyTag> getAvgWhiskeyTags() {
        return Collections.unmodifiableList(avgWhiskeyTags);
    }

    /**
     * 공개 노트의 점수를 캐시에 반영합니다.
     * 노트가 공개 상태로 생성되거나 공개 상태로 수정될 때 호출됩니다.
     *
     * @param scoreVo 반영할 점수 VO
     */
    public void applyScore(WhiskeyScoreVo scoreVo) {
        count++;
        this.bodyScore += scoreVo.bodyScore();
        this.finishScore += scoreVo.finishScore();
        this.smokyScore += scoreVo.smokyScore();
        this.spicyScore += scoreVo.spicyScore();
        this.sweetScore += scoreVo.sweetScore();
    }

    /**
     * 캐시에서 기존 노트의 점수를 차감합니다.
     * 노트가 수정되거나 삭제될 때 기존 점수를 되돌리기 위해 호출됩니다.
     *
     * @param scoreVo 차감할 점수 VO
     */
    public void revertScore(WhiskeyScoreVo scoreVo) {
        count--;
        this.bodyScore -= scoreVo.bodyScore();
        this.finishScore -= scoreVo.finishScore();
        this.smokyScore -= scoreVo.smokyScore();
        this.spicyScore -= scoreVo.spicyScore();
        this.sweetScore -= scoreVo.sweetScore();
    }

    /**
     * 공개 노트의 태그 카운트를 캐시에 반영합니다.
     * 기존에 없던 태그는 새로 생성하고, 있던 태그는 카운트를 증가시킵니다.
     * 노트가 공개 상태로 생성되거나 공개 상태로 수정될 때 호출됩니다.
     *
     * @param tags 반영할 태그 목록
     */
    public void applyTags(List<Tag> tags) {
        Map<Long, AvgWhiskeyTag> existingMap = this.avgWhiskeyTags.stream()
            .collect(Collectors.toMap(t -> t.getTag().getId(), Function.identity()));

        List<AvgWhiskeyTag> newAvgTags = new ArrayList<>();
        for (Tag tag : tags) {
            AvgWhiskeyTag avgWhiskeyTag = existingMap.getOrDefault(
                tag.getId(),
                AvgWhiskeyTag.init(tag, this)
            );
            avgWhiskeyTag.increaseCount();

            if (!existingMap.containsKey(tag.getId())) {
                newAvgTags.add(avgWhiskeyTag);
            }
        }

        this.avgWhiskeyTags.addAll(newAvgTags);
    }

    /**
     * 캐시에서 기존 노트의 태그 카운트를 차감합니다.
     * 노트가 수정되거나 삭제될 때 기존 태그를 되돌리기 위해 호출됩니다.
     *
     * @param tags 차감할 태그 목록
     */
    public void revertTags(List<Tag> tags) {
        Map<Long, AvgWhiskeyTag> existingMap = this.avgWhiskeyTags.stream()
            .collect(Collectors.toMap(t -> t.getTag().getId(), Function.identity()));

        tags.forEach(tag ->
            Optional.ofNullable(existingMap.get(tag.getId()))
                .ifPresent(AvgWhiskeyTag::decreaseCount)
        );
    }

    /**
     * count가 0 이하인 AvgWhiskeyTag를 제거합니다.
     *
     * <p>점수 및 태그 차감/반영이 모두 완료된 후 호출됩니다.
     * orphanRemoval로 인해 리스트에서 제거된 항목은 DB에서도 자동 삭제됩니다.
     */
    public void removeZeroCountTags() {
        this.avgWhiskeyTags.removeIf(t -> t.getCount() <= 0);
    }
}
