-- whiskey_columns → posts 마이그레이션 시 누락된 썸네일을 posts.context 맨 앞에 삽입.
-- title 기준으로 JOIN해 thumbnail_url을 마크다운 이미지 구문으로 prepend.
-- 이미 '!['로 시작하는 행은 재적용 방지를 위해 제외.

UPDATE posts p
INNER JOIN whiskey_columns wc ON p.title COLLATE utf8mb4_unicode_ci = wc.title COLLATE utf8mb4_unicode_ci
SET p.context = CONCAT('![](', wc.thumbnail_url, ')\n\n', p.context)
WHERE p.post_type = 'COLUMN'
  AND wc.thumbnail_url IS NOT NULL
  AND wc.thumbnail_url != ''
  AND p.context NOT LIKE '![%';
