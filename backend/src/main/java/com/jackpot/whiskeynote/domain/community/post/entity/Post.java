// 커뮤니티 게시글 핵심 엔티티 - 게시글 유형(PostType)과 카테고리(PostCategory)를 조합해 하나의 테이블로 여러 게시판을 관리
package com.jackpot.whiskeynote.domain.community.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "posts")
// JPA 프록시 생성 및 리플렉션 방지를 위해 기본 생성자를 PROTECTED로 제한; 객체 생성은 정적 팩토리 메서드(create)만 허용
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 작성자 식별자는 Users 엔티티와 FK를 맺지 않고 Long으로만 보관
    // - 회원 탈퇴 후에도 게시글 레코드를 남겨야 하는 정책 때문
    @Column(name = "author_id", nullable = false)
    private Long authorId;

    // 게시판 종류(공지/칼럼/Q&A/자유/피드)를 문자열로 저장해 마이그레이션 없이 enum 순서 변경에 대응
    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false)
    private PostType postType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostCategory category;

    @Column(nullable = false, length = 512)
    private String title;

    // 본문 길이 제한 없이 저장하기 위해 columnDefinition = "TEXT" 지정
    @Column(nullable = false, columnDefinition = "TEXT")
    private String context;

    // 좋아요 수는 PostLike 레코드 수와 동기화되는 카운터 캐시 컬럼
    // - 매번 COUNT 쿼리를 날리지 않아 목록 조회 성능을 높이기 위한 선택
    // - 단점: likePost/unlikePost 가 정확히 쌍으로 호출되어야 일관성 유지 가능
    @Column(name = "like_count", nullable = false)
    private int likeCount;

    // 단순 조회수 카운터 — 요청마다 1씩 증가 (중복 제거 없음)
    // TODO: 추후 Redis + 세션/쿠키 기반 중복 차단으로 확장 예정
    @Column(name = "view_count", nullable = false)
    private int viewCount;

    // 물리 삭제 대신 논리 삭제를 사용하는 이유:
    // - 댓글 트리 등 연관 데이터의 무결성 유지
    // - 관리자 복구 및 감사 로그 목적
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 게시글 생성 전용 정적 팩토리 메서드.
     * new Post()를 직접 사용하면 필수 필드(likeCount, isDeleted, 날짜)가 누락될 수 있어
     * 초기화 책임을 엔티티 내부에 집중시킴.
     */
    public static Post create(Long authorId, PostType postType, PostCategory category,
                              String title, String context) {
        Post post = new Post();
        post.authorId = authorId;
        post.postType = postType;
        post.category = category;
        post.title = title;
        post.context = context;
        post.likeCount = 0;
        post.viewCount = 0;
        post.isDeleted = false;
        post.createdAt = LocalDateTime.now();
        post.updatedAt = LocalDateTime.now();
        return post;
    }

    /**
     * 부분 수정을 지원하기 위해 null 체크 후 필드를 업데이트.
     * PATCH 의미론: 요청에 포함된 필드만 변경하고 나머지는 그대로 유지.
     */
    public void update(String title, String context, PostCategory category) {
        if (title != null) this.title = title;
        if (context != null) this.context = context;
        if (category != null) this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

    /** 논리 삭제 처리: isDeleted 플래그와 deletedAt 타임스탬프를 함께 기록 */
    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * 복구 메소드
     */
    public void restore() {
        this.isDeleted = false;
        this.deletedAt = null;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementLikeCount() {
        this.likeCount++;
    }

    // likeCount가 이미 0인데 감소하면 음수가 되는 버그를 방어
    public void decrementLikeCount() {
        if (this.likeCount > 0) this.likeCount--;
    }
}
