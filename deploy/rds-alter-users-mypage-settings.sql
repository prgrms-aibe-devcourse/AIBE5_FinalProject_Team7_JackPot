-- Feat/be#86: 마이페이지 설정/약관동의 컬럼 추가
-- 운영(production)은 ddl-auto=validate 이므로 배포 전 RDS에 먼저 적용해야 합니다.

ALTER TABLE users
  ADD COLUMN bottle_share_opt_in TINYINT(1) NOT NULL DEFAULT 0 AFTER profile_image_url,
  ADD COLUMN marketing_opt_in     TINYINT(1) NOT NULL DEFAULT 0 AFTER bottle_share_opt_in;

