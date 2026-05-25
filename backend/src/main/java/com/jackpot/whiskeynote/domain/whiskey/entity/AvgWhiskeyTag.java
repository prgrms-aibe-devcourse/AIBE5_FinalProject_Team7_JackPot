package com.jackpot.whiskeynote.domain.whiskey.entity;

import com.jackpot.whiskeynote.domain.taste.entity.Tag;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "avg_whiskey_tags")
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
}