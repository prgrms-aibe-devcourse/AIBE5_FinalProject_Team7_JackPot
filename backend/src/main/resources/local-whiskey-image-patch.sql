-- 로컬 H2 전용: data.sql 시드 후 S3 image_url 반영 (application-local.yaml data-locations)
UPDATE whiskeys SET image_url = 'whiskey/글렌피딕_18년.webp' WHERE id = 1;
UPDATE whiskeys SET image_url = 'whiskey/오켄토션_12년.webp' WHERE id = 2;
UPDATE whiskeys SET image_url = 'whiskey/에버펠디_12년.webp' WHERE id = 3;
UPDATE whiskeys SET image_url = 'whiskey/글렌모렌지_오리지널_10년.webp' WHERE id = 4;
UPDATE whiskeys SET image_url = 'whiskey/폴존_피티드_클래식_셀렉트_캐스크.webp' WHERE id = 5;
UPDATE whiskeys SET image_url = 'whiskey/글렌피딕_그랑_크루_23년.webp' WHERE id = 6;
UPDATE whiskeys SET image_url = 'whiskey/맥캘란_15년_더블_캐스크.webp' WHERE id = 7;
UPDATE whiskeys SET image_url = 'whiskey/스페이번_10년.webp' WHERE id = 8;
UPDATE whiskeys SET image_url = 'whiskey/로크로몬드_오리지날.webp' WHERE id = 9;
UPDATE whiskeys SET image_url = 'whiskey/로얄_브라클라_21년.webp' WHERE id = 10;
