package com.jackpot.whiskeynote.domain.community.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(
    name = "post_likes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "post_id"})
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(nullable = false)
    private boolean up;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static PostLike create(Long userId, Long postId) {
        PostLike like = new PostLike();
        like.userId = userId;
        like.postId = postId;
        like.up = true;
        like.createdAt = LocalDateTime.now();
        return like;
    }
}
