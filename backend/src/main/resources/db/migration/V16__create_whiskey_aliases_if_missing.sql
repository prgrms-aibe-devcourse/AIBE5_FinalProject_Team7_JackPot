-- whiskey_aliases 테이블 생성 (IF NOT EXISTS)
-- V13 마이그레이션이 seed_notice_posts 내용으로 실행된 경우
-- (V13 이력 체크섬 불일치 → repair 후에도 테이블이 실제 생성되지 않는 상황) 대응
CREATE TABLE IF NOT EXISTS whiskey_aliases (
    id BIGINT NOT NULL AUTO_INCREMENT,
    whiskey_id BIGINT NOT NULL,
    alias VARCHAR(200) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    INDEX idx_whiskey_aliases_whiskey_id (whiskey_id),
    INDEX idx_whiskey_aliases_alias (alias)
);
