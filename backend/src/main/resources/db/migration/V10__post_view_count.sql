-- posts 테이블에 조회수 컬럼 추가
-- 기존 행은 0으로 초기화 (DEFAULT 0)
-- TODO: 추후 Redis + 세션/쿠키 기반 중복 차단으로 확장 예정

ALTER TABLE posts
    ADD COLUMN view_count INT NOT NULL DEFAULT 0;
