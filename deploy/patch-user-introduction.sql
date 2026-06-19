-- users.introduction (프로필 소개) — V35와 동일, 시드 덤프에 컬럼 없을 때 보강
USE whiskeynote;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'introduction'
);

SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE users ADD COLUMN introduction TEXT NULL COMMENT ''프로필 소개''',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
