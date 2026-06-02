package com.jackpot.whiskeynote.domain.taste.review.entity;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name="review_likes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UK_REVIEW_LIKE_USER_REVIEW",
                        columnNames = {"user_id", "review_id"}
                )
        }
)
@Getter
@NoArgsConstructor
public class ReviewLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 리뷰에 좋아요를 눌렀는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    // 어떤 사용자가 눌렀는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static ReviewLike create(Review review, Users user) {
        ReviewLike like = new ReviewLike();
        like.review = review;
        like.user = user;
        return like;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
