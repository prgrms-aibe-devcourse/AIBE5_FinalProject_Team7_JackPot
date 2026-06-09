// 게시글-위스키 연결 엔티티 - 하나의 게시글에 여러 위스키를 순서 있게 태깅하기 위한 연결 테이블
package com.jackpot.whiskeynote.domain.community.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "post_whiskeys")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostWhiskey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "whiskey_id", nullable = false)
    private Long whiskeyId;

    // 게시글 내에서 위스키 태그 순서를 명시적으로 저장
    // 클라이언트가 전달한 whiskeyIds 리스트 인덱스(1-based)를 그대로 보존하기 위함
    // 주의: order는 MySQL 예약어이므로 백틱으로 감싸야 함
    @Column(name = "`order`", nullable = false)
    private int order;

    /**
     * order 값은 호출 측에서 1-based 순서(1, 2, 3...)로 전달해야 함.
     * PostService에서 루프 인덱스 + 1 로 설정하므로 이 메서드 단독 사용 시 주의.
     */
    public static PostWhiskey create(Long postId, Long whiskeyId, int order) {
        PostWhiskey pw = new PostWhiskey();
        pw.postId = postId;
        pw.whiskeyId = whiskeyId;
        pw.order = order;
        return pw;
    }
}
