-- 위스키 칼럼(블로그·유튜브 수집 콘텐츠) 테이블 생성 마이그레이션

CREATE TABLE IF NOT EXISTS whiskey_columns (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    source_type     VARCHAR(20) NOT NULL,           -- ColumnSourceType enum을 문자열로 저장 (BLOG | YOUTUBE)
    title           VARCHAR(512) NOT NULL,
    url             VARCHAR(1024) NOT NULL,
    thumbnail_url   VARCHAR(1024),
    description     TEXT,                           -- 마크다운 본문 전체를 저장하므로 길이 제한 없는 TEXT 사용
    whiskey_keyword VARCHAR(255),
    author          VARCHAR(200),
    source_name     VARCHAR(200),
    -- published_at을 NULL 허용하는 이유: 유튜브 등 일부 소스는 발행일을 제공하지 않을 수 있어
    -- 크롤러가 파싱에 실패하면 NULL로 저장하고 프론트에서 createdAt으로 대체 표시한다.
    published_at    DATETIME(6),
    -- DATETIME(6): 마이크로초(6자리) 정밀도를 명시하는 이유는 Java의 LocalDateTime이
    -- 나노초까지 지원하며, JPA/Hibernate가 기본적으로 DATETIME(6)으로 DDL을 생성하기 때문이다.
    -- DEFAULT CURRENT_TIMESTAMP를 쓰지 않는 이유: 앱 레벨(WhiskeyColumn.create())에서
    -- 명시적으로 값을 설정하여 시간대 처리와 테스트 모킹을 일관되게 유지한다.
    created_at      DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
-- utf8mb4를 사용하는 이유: utf8(3바이트)은 이모지 등 4바이트 유니코드를 처리하지 못한다.
-- 위스키 설명에 이모지나 특수 문자가 포함될 수 있으므로 utf8mb4로 완전한 유니코드를 지원한다.
-- utf8mb4_unicode_ci: 대소문자 및 발음 구별 부호 구분 없이 정렬/비교하는 일반적인 CI 콜레이션.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
