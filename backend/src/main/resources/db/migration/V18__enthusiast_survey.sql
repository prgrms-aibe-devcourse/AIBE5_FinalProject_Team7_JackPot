-- 애호가 설문(ENTHUSIAST) 지원을 위한 user_taste_profiles 컬럼 추가
ALTER TABLE user_taste_profiles
    ADD COLUMN survey_type       VARCHAR(20)   NOT NULL DEFAULT 'BEGINNER' COMMENT 'BEGINNER | ENTHUSIAST',
    ADD COLUMN style_tags        VARCHAR(1000) NULL     COMMENT '선호 스타일 (쉼표 구분: single_malt,bourbon,...)',
    ADD COLUMN nose_tag_weights  VARCHAR(2000) NULL     COMMENT '노즈 태그 강도 (tagId=intensity,... 형식)',
    ADD COLUMN taste_tag_weights VARCHAR(2000) NULL     COMMENT '테이스트 태그 강도 (tagId=intensity,... 형식)',
    ADD COLUMN exploration_level INT           NULL     COMMENT '1=보수형 2=균형형 3=탐험형';

-- 애호가 설문 전용 nose 태그 (ID 200~212)
INSERT IGNORE INTO tags (id, category, name, display_order, image_url) VALUES
    (200, 'nose', '사과',    200, NULL),
    (201, 'nose', '배',      201, NULL),
    (202, 'nose', '열대과일', 202, NULL),
    (203, 'nose', '건과일',  203, NULL),
    (204, 'nose', '토피',    204, NULL),
    (205, 'nose', '몰트',    205, NULL),
    (206, 'nose', '플로럴',  206, NULL),
    (207, 'nose', '정향',    207, NULL),
    (208, 'nose', '담배',    208, NULL),
    (209, 'nose', '연기',    209, NULL),
    (210, 'nose', '바다',    210, NULL),
    (211, 'nose', '요오드',  211, NULL),
    (212, 'nose', '약품향',  212, NULL);

-- 애호가 설문 전용 taste 태그 (ID 213~219)
INSERT IGNORE INTO tags (id, category, name, display_order, image_url) VALUES
    (213, 'taste', '사과',     213, NULL),
    (214, 'taste', '건포도',   214, NULL),
    (215, 'taste', '열대과일', 215, NULL),
    (216, 'taste', '토피',     216, NULL),
    (217, 'taste', '몰트',     217, NULL),
    (218, 'taste', '스파이스', 218, NULL),
    (219, 'taste', '가죽',     219, NULL);
