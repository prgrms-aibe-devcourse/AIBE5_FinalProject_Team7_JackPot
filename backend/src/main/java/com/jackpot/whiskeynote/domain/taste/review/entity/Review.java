package com.jackpot.whiskeynote.domain.taste.review.entity;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@NoArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiskey_id", nullable = false)
    private Whiskey whiskey;

    @Column(name = "attached_note_id")
    private Long attachedNoteId;

    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(name = "public_text", columnDefinition = "MEDIUMTEXT")
    private String publicText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static Review create(Users user, Whiskey whiskey, BigDecimal rating, String publicText, Long attachedNoteId) {
        Review review = new Review();
        review.user = user;
        review.whiskey = whiskey;
        review.attachedNoteId = null;
        review.rating = rating;
        review.publicText = publicText;
        review.attachedNoteId=attachedNoteId;
        return review;
    }

    public void update(BigDecimal rating, String publicText, Long attachedNoteId) {
        this.rating = rating;
        this.publicText = publicText;
        this.attachedNoteId = attachedNoteId;
    }

    public boolean isWrittenBy(Long userId){
        return this.user.getId().equals(userId);
    }

    @PrePersist // 엔티티가 처음 저장될 때 실행
    void onCreate(){
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate // 엔티티가 업데이트될 때 실행
    void onUpdate(){
        this.updatedAt = LocalDateTime.now();
    }
}
