-- whiskey_columns 크롤링 데이터를 posts 테이블로 이관
-- author_id=1(관리자), post_type=COLUMN, category=F(기본값)
-- 썸네일이 있으면 마크다운 이미지 구문을 본문 맨 앞에 삽입 (V8과 동일 로직을 이관 시 선적용)
-- WHERE NOT EXISTS: 이미 이관된 환경에서 중복 삽입 방지

INSERT INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
SELECT
    1,
    'COLUMN',
    'F',
    wc.title,
    CASE
        WHEN wc.thumbnail_url IS NOT NULL AND wc.thumbnail_url != ''
        THEN CONCAT('![](', wc.thumbnail_url, ')\n\n', COALESCE(wc.description, ''))
        ELSE COALESCE(wc.description, '')
    END,
    0,
    0,
    false,
    COALESCE(wc.created_at, NOW()),
    NOW()
FROM whiskey_columns wc
WHERE NOT EXISTS (
    SELECT 1 FROM posts p
    WHERE p.title COLLATE utf8mb4_unicode_ci = wc.title COLLATE utf8mb4_unicode_ci AND p.post_type = 'COLUMN'
);
