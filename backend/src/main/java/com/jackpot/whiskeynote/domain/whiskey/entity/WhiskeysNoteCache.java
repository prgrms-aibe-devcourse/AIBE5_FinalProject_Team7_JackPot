package com.jackpot.whiskeynote.domain.whiskey.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "whiskeys_note_cache")
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
}
