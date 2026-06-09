// 게시글 좋아요 이력 엔티티 - 사용자별 중복 좋아요 방지 및 좋아요 이력 추적을 위한 연결 테이블
package com.jackpot.whiskeynote.domain.community.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
// (user_id, post_id) 복합 유니크 제약으로 DB 레벨에서 중복 좋아요를 원천 차단
// 서비스 레이어의 existsByUserIdAndPostId 체크만으로는 동시성 문제 발생 가능하므로 DB 제약이 최후 방어선 역할
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

    // up 필드: 현재는 항상 true로 저장 (좋아요만 존재, 싫어요 기능 미사용)
    // 향후 싫어요(up=false) 기능 확장을 고려한 설계이나, 미사용 상태이므로 주의
    @Column(nullable = false)
    private boolean up;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 좋아요 생성 전용 팩토리 메서드.
     * up은 항상 true로 설정 - 현재 서비스에서 싫어요는 지원하지 않음.
     */
    public static PostLike create(Long userId, Long postId) {
        PostLike like = new PostLike();
        like.userId = userId;
        like.postId = postId;
        like.up = true;
        like.createdAt = LocalDateTime.now();
        return like;
    }
}
