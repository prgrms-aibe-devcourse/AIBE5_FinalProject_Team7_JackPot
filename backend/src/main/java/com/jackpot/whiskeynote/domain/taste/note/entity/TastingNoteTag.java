package com.jackpot.whiskeynote.domain.taste.note.entity;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tasting_note_tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TastingNoteTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private TastingNote note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    /**
     * TastingNoteTag 생성 정적 팩토리 메서드입니다.
     *
     * <p>TastingNote.updateTags()에서 내부적으로 호출되며,
     * 외부에서 직접 생성하지 않습니다.
     *
     * @param note 연관된 테이스팅 노트
     * @param tag         연관된 태그
     * @return 생성된 TastingNoteTag 인스턴스
     */
    public static TastingNoteTag create(TastingNote note, Tag tag) {
        TastingNoteTag noteTag = new TastingNoteTag();
        noteTag.note = note;
        noteTag.tag = tag;

        return noteTag;
    }
}
