package com.jackpot.whiskeynote.domain.taste.note.entity;

import com.jackpot.whiskeynote.domain.taste.entity.Tag;
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
}
