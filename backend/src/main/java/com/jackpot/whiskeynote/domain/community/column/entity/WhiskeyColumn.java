// 블로그·유튜브에서 수집한 위스키 칼럼 데이터를 저장하는 JPA 엔티티
package com.jackpot.whiskeynote.domain.community.column.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "whiskey_columns")
// PROTECTED 생성자: JPA 프록시 생성을 허용하면서도 외부에서 new WhiskeyColumn()으로
// 불완전한 객체를 만드는 것을 막기 위해 접근 수준을 PROTECTED로 제한.
// 대신 정적 팩토리 create()를 유일한 생성 진입점으로 강제하여
// 필수 필드 누락을 컴파일 타임에 방지한다.
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WhiskeyColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private ColumnSourceType sourceType;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(nullable = false, length = 1024)
    private String url;

    @Column(name = "thumbnail_url", length = 1024)
    private String thumbnailUrl;

    // 본문 마크다운 전체를 저장하므로 길이 제한이 없는 TEXT 타입 사용
    @Column(columnDefinition = "TEXT")
    private String description;

    // 관련 위스키를 키워드 문자열로 관리. 외래 키 대신 비정규화를 택한 이유는
    // 칼럼이 외부 크롤링 데이터이므로 위스키 엔티티와 강결합을 피하기 위함이다.
    @Column(name = "whiskey_keyword", length = 255)
    private String whiskeyKeyword;

    // author·sourceName은 크롤러가 파싱에 성공했을 때만 채워지는 선택 필드.
    // create() 파라미터에 포함하지 않은 이유는 크롤러 구현에 따라 제공 여부가 다르고
    // 현재 배치 스크립트에서는 직접 세터(리플렉션)로 설정하기 때문이다.
    @Column(length = 200)
    private String author;

    @Column(name = "source_name", length = 200)
    private String sourceName;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    // @CreationTimestamp 대신 앱 레벨에서 직접 설정하는 이유:
    // Hibernate의 @CreationTimestamp는 영속화 시점을 사용하지만,
    // 이 프로젝트는 Spring Data save() 이전에 create()에서 명시적으로 값을 지정해
    // 시간대 처리와 테스트 시 모킹을 일관되게 유지하기 위함이다.
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static WhiskeyColumn create(ColumnSourceType sourceType, String title, String url,
                                       String thumbnailUrl, String description,
                                       String whiskeyKeyword, LocalDateTime publishedAt) {
        WhiskeyColumn col = new WhiskeyColumn();
        col.sourceType = sourceType;
        col.title = title;
        col.url = url;
        col.thumbnailUrl = thumbnailUrl;
        col.description = description;
        col.whiskeyKeyword = whiskeyKeyword;
        col.publishedAt = publishedAt;
        col.createdAt = LocalDateTime.now();
        return col;
    }
}
