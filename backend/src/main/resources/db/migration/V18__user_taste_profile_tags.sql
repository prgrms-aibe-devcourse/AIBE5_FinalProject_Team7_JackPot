-- 1NF 정규화: user_taste_profiles 태그/가중치 컬럼 제거 + user_taste_profile_tags 테이블 생성
--
-- 제거 컬럼:
--   nose_tag_ids     : "2,7,8" 형태의 쉼표 구분 문자열 → 1NF 위반
--   taste_tag_ids    : 동일
--   user_type        : 미사용
--   nose_tag_weights : "1=2,7=1" 형태의 key=value 직렬화 → 1NF 위반
--   taste_tag_weights: 동일

-- 1. 신규 태그 테이블 생성
CREATE TABLE IF NOT EXISTS user_taste_profile_tags (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    profile_id BIGINT       NOT NULL COMMENT 'FK → user_taste_profiles.id',
    tag_id     BIGINT       NOT NULL COMMENT 'FK → tags.id',
    category   VARCHAR(10)  NOT NULL COMMENT 'nose | taste',
    PRIMARY KEY (id),
    CONSTRAINT FK_user_taste_profile_tags_profile FOREIGN KEY (profile_id) REFERENCES user_taste_profiles (id) ON DELETE CASCADE,
    CONSTRAINT FK_user_taste_profile_tags_tag     FOREIGN KEY (tag_id)     REFERENCES tags (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 기존 컬럼 제거 (1NF 위반 + 미사용 컬럼)
ALTER TABLE user_taste_profiles
    DROP COLUMN nose_tag_ids,
    DROP COLUMN taste_tag_ids,
    DROP COLUMN user_type,
    DROP COLUMN nose_tag_weights,
    DROP COLUMN taste_tag_weights;
