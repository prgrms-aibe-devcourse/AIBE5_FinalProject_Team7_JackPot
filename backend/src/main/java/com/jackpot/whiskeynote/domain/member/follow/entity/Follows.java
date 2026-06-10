package com.jackpot.whiskeynote.domain.member.follow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "follows")
@NoArgsConstructor
public class Follows {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // 팔로우 하는 사람의 ID
    @Column(name = "follower_id", nullable = false)
    private Long followerId;
    // 팔로우 받는 사람의 ID
    @Column(name = "following_id", nullable = false)
    private Long followingId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static Follows create(Long followerId, Long followedId) {
        Follows follows = new Follows();
        follows.followerId = followerId;
        follows.followingId = followedId;
        follows.createdAt = LocalDateTime.now();
        return follows;
    }
    // 엔티티가 처음 저장될 때 실행
    @PrePersist
    void onCreate(){
        this.createdAt = LocalDateTime.now();
    }
}
