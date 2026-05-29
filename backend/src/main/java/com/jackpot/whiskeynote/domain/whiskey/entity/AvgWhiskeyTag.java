package com.jackpot.whiskeynote.domain.whiskey.entity;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "avg_whiskey_tags")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AvgWhiskeyTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id")
    private Tag tag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cache_id")
    private WhiskeysNoteCache cache;

    private Integer count;

    /**
     * AvgWhiskeyTag 초기화 정적 팩토리 메서드입니다.
     *
     * <p>해당 위스키 캐시에 처음 등장하는 태그에 대해 최초 1회 호출됩니다.
     * WhiskeysNoteCache.applyTags()에서 내부적으로 호출되며,
     * 외부에서 직접 생성하지 않습니다.
     *
     * @param tag   연관된 태그
     * @param cache 연관된 위스키 노트 캐시
     * @return count가 0으로 초기화된 AvgWhiskeyTag 인스턴스
     */
    public static AvgWhiskeyTag init(Tag tag, WhiskeysNoteCache cache) {
        AvgWhiskeyTag avgWhiskeyTag = new AvgWhiskeyTag();
        avgWhiskeyTag.tag = tag;
        avgWhiskeyTag.cache = cache;
        avgWhiskeyTag.count = 0;
        return avgWhiskeyTag;
    }

    /** 태그 카운트를 1 증가시킵니다. 공개 노트에 해당 태그가 추가될 때 호출됩니다. */
    public void increaseCount() { this.count++; }

    /** 태그 카운트를 1 감소시킵니다. 공개 노트에서 해당 태그가 제거되거나 노트가 삭제될 때 호출됩니다. */
    public void decreaseCount() { this.count--; }
}