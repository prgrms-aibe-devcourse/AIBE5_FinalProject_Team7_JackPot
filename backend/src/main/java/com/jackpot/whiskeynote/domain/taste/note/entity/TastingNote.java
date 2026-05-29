package com.jackpot.whiskeynote.domain.taste.note.entity;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasting_notes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TastingNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiskey_id", nullable = false)
    private Whiskey whiskey;

    @Column(name = "body_score")
    private Short bodyScore;

    @Column(name = "finish_score")
    private Short finishScore;

    @Column(name = "smoky_score")
    private Short smokyScore;

    @Column(name = "spicy_score")
    private Short spicyScore;

    @Column(name = "sweet_score")
    private Short sweetScore;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String memo;

    @Column(name = "is_draft", nullable = false)
    private boolean draft;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
