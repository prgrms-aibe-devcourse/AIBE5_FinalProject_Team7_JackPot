-- TASTING TAGS 아이콘 연결: name_eng 슬러그 기반 image_url 설정
-- 예) 'Green & Leafy' -> /images/tags/green-leafy.png, 'Orchard Fruit' -> /images/tags/orchard-fruit.png
UPDATE tags
SET image_url = CONCAT(
    '/images/tags/',
    REPLACE(REPLACE(LOWER(name_eng), ' & ', '-'), ' ', '-'),
    '.png'
)
WHERE name_eng IS NOT NULL AND name_eng <> '';
