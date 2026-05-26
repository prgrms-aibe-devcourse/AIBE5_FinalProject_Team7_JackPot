INSERT INTO whiskeys
(id, name, type, etc_detail, image_url, abv, age_years, status, region, country, cask, created_at, updated_at)
VALUES
    (1, 'Glenfiddich 12', 'single_malt', NULL, NULL, 40.00, 12, 'active', 'Speyside', 'Scotland', 'Bourbon Cask', NOW(6), NOW(6)),
    (2, 'Glenfiddich 15', 'single_malt', NULL, NULL, 40.00, 15, 'active', 'Speyside', 'Scotland', 'Sherry Cask', NOW(6), NOW(6)),
    (3, 'Macallan 12 Double Cask', 'single_malt', NULL, NULL, 40.00, 12, 'active', 'Speyside', 'Scotland', 'Sherry Oak Cask', NOW(6), NOW(6)),
    (4, 'Jameson Original', 'blended', NULL, NULL, 40.00, 0, 'active', 'Cork', 'Ireland', 'Bourbon and Sherry Cask', NOW(6), NOW(6)),
    (5, 'Maker''s Mark', 'bourbon', NULL, NULL, 45.00, 0, 'active', 'Kentucky', 'USA', 'New American Oak', NOW(6), NOW(6)),
    (6, 'Bulleit Rye', 'rye', NULL, NULL, 45.00, 0, 'active', 'Kentucky', 'USA', 'New American Oak', NOW(6), NOW(6)),
    (7, 'Yamazaki Distiller''s Reserve', 'single_malt', NULL, NULL, 43.00, 0, 'pending', 'Osaka', 'Japan', 'Mizunara and Wine Cask', NOW(6), NOW(6)),
    (8, 'Hibiki Japanese Harmony', 'blended', NULL, NULL, 43.00, 0, 'active', 'Osaka', 'Japan', 'Mixed Cask', NOW(6), NOW(6)),
    (9, 'Ardbeg 10', 'single_malt', NULL, NULL, 46.00, 10, 'active', 'Islay', 'Scotland', 'Ex-Bourbon Cask', NOW(6), NOW(6)),
    (10, 'Monkey Shoulder', 'blended', NULL, NULL, 40.00, 0, 'active', 'Speyside', 'Scotland', 'First-fill Bourbon Cask', NOW(6), NOW(6));

INSERT INTO tags
(id, category, name, display_order, image_url)
VALUES
    (1, 'nose', '시트러스', 1, '/vite.svg'),
    (2, 'nose', '베리류', 2, '/vite.svg'),
    (3, 'nose', '꽃향', 3, '/vite.svg'),
    (4, 'nose', '허브향', 4, '/vite.svg'),
    (5, 'nose', '곡물향', 5, '/vite.svg'),
    (6, 'nose', '견과향', 6, '/vite.svg'),
    (7, 'nose', '꿀향', 7, '/vite.svg'),
    (8, 'nose', '바닐라향', 8, '/vite.svg'),
    (9, 'nose', '캐러멜향', 9, '/vite.svg'),
    (10, 'nose', '초콜릿향', 10, '/vite.svg'),
    (11, 'nose', '커피향', 11, '/vite.svg'),
    (12, 'nose', '후추향', 12, '/vite.svg'),
    (13, 'nose', '계피향', 13, '/vite.svg'),
    (14, 'nose', '정향', 14, '/vite.svg'),
    (15, 'nose', '우디(나무, 오크)', 15, '/vite.svg'),
    (16, 'nose', '가죽향', 16, '/vite.svg'),
    (17, 'nose', '스모키', 17, '/vite.svg'),
    (18, 'nose', '피트향', 18, '/vite.svg'),
    (19, 'nose', '흙내음', 19, '/vite.svg'),
    (20, 'nose', '약품향', 20, '/vite.svg'),
    (101, 'taste', '시트러스', 1, '/vite.svg'),
    (102, 'taste', '베리류', 2, '/vite.svg'),
    (103, 'taste', '허브맛', 3, '/vite.svg'),
    (104, 'taste', '곡물맛', 4, '/vite.svg'),
    (105, 'taste', '견과류맛', 5, '/vite.svg'),
    (106, 'taste', '꿀맛', 6, '/vite.svg'),
    (107, 'taste', '바닐라맛', 7, '/vite.svg'),
    (108, 'taste', '캐러멜맛', 8, '/vite.svg'),
    (109, 'taste', '초콜릿맛', 9, '/vite.svg'),
    (110, 'taste', '커피맛', 10, '/vite.svg'),
    (111, 'taste', '우디(나무, 오크)', 11, '/vite.svg'),
    (112, 'taste', '스모키', 12, '/vite.svg'),
    (113, 'taste', '피트감', 13, '/vite.svg'),
    (114, 'taste', '흙맛', 14, '/vite.svg'),
    (115, 'taste', '짠맛', 15, '/vite.svg');

INSERT INTO whiskeys_note_cache
(id, whiskey_id, count, body_score, finish_score, smoky_score, spicy_score, sweet_score)
VALUES
    (1, 1, 24, 1728, 1680, 432, 528, 1968),
    (2, 2, 18, 1404, 1368, 360, 504, 1548),
    (3, 3, 20, 1600, 1640, 320, 480, 1760),
    (4, 4, 14, 812, 756, 112, 252, 980),
    (5, 5, 16, 1216, 1088, 160, 384, 1440),
    (6, 6, 12, 888, 864, 144, 984, 648),
    (7, 7, 10, 700, 740, 240, 260, 760),
    (8, 8, 15, 1110, 1170, 270, 300, 1260),
    (9, 9, 22, 1892, 1936, 2112, 1012, 924),
    (10, 10, 17, 1122, 1054, 238, 340, 1326);

INSERT INTO avg_whiskey_tags
(id, cache_id, tag_id, count)
VALUES
    (1, 1, 101, 14),
    (2, 1, 8, 11),
    (3, 1, 106, 10),
    (4, 1, 107, 9),
    (5, 1, 15, 6),
    (6, 2, 7, 9),
    (7, 2, 8, 8),
    (8, 2, 106, 7),
    (9, 2, 108, 7),
    (10, 2, 15, 5),
    (11, 3, 8, 10),
    (12, 3, 9, 9),
    (13, 3, 10, 8),
    (14, 3, 107, 8),
    (15, 3, 109, 7),
    (16, 4, 5, 8),
    (17, 4, 104, 7),
    (18, 4, 7, 6),
    (19, 4, 106, 6),
    (20, 4, 111, 4),
    (21, 5, 8, 10),
    (22, 5, 9, 10),
    (23, 5, 107, 9),
    (24, 5, 108, 9),
    (25, 5, 15, 7),
    (26, 6, 12, 9),
    (27, 6, 13, 8),
    (28, 6, 103, 7),
    (29, 6, 111, 6),
    (30, 6, 15, 6),
    (31, 7, 3, 6),
    (32, 7, 15, 7),
    (33, 7, 17, 5),
    (34, 7, 101, 6),
    (35, 7, 111, 5),
    (36, 8, 7, 8),
    (37, 8, 8, 7),
    (38, 8, 106, 8),
    (39, 8, 107, 7),
    (40, 8, 102, 5),
    (41, 9, 17, 14),
    (42, 9, 18, 13),
    (43, 9, 20, 8),
    (44, 9, 112, 12),
    (45, 9, 113, 11),
    (46, 10, 5, 8),
    (47, 10, 7, 7),
    (48, 10, 8, 6),
    (49, 10, 104, 7),
    (50, 10, 106, 6);

-- =====================================================
-- 커뮤니티 테스트 데이터 (author_id=1~3 은 테스트용 임시 userId)
-- =====================================================

INSERT INTO posts
(id, author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
VALUES
    (1, 1, 'COLUMN',  'R', '글렌피딕 12년 심층 리뷰', '<p>글렌피딕 12년은 입문자에게 최고의 선택입니다...</p>', 5, 0, NOW(6), NOW(6)),
    (2, 2, 'COLUMN',  'R', '아드벡 10년, 피트의 정수', '<p>아드벡 10년은 강렬한 피트향으로 유명합니다...</p>', 3, 0, NOW(6), NOW(6)),
    (3, 1, 'FREE',    'F', '위스키 입문 어떤 걸로 시작할까요?', '<p>처음 위스키를 시작하려는데 추천 부탁드립니다.</p>', 2, 0, NOW(6), NOW(6)),
    (4, 3, 'FREE',    'L', '서울 위스키 바 추천', '<p>강남에 괜찮은 위스키 바 아시는 분 있나요?</p>', 4, 0, NOW(6), NOW(6)),
    (5, 2, 'FREE',    'G', '야마자키 나눔합니다', '<p>야마자키 한 병 나눔합니다. 댓글 주세요.</p>', 1, 0, NOW(6), NOW(6)),
    (6, 1, 'QA',      'Q', '버번과 라이의 차이가 뭔가요?', '<p>버번 위스키와 라이 위스키의 차이점이 궁금합니다.</p>', 0, 0, NOW(6), NOW(6)),
    (7, 3, 'QA',      'Q', '테이스팅 노트 작성하는 방법', '<p>테이스팅 노트를 처음 써보려는데 어떻게 하면 좋을까요?</p>', 2, 0, NOW(6), NOW(6));

-- 게시글-위스키 연결 (칼럼 글에 위스키 태그)
INSERT INTO post_whiskeys
(id, post_id, whiskey_id, `order`)
VALUES
    (1, 1, 1, 1),
    (2, 1, 3, 2),
    (3, 2, 9, 1);

-- 댓글 (post_id=3 자유게시판 글에 댓글 + 대댓글)
INSERT INTO post_comments
(id, post_id, user_id, content, is_deleted, created_at, updated_at)
VALUES
    (1, 3, 2, '글렌피딕 12년 강추합니다!', 0, NOW(6), NOW(6)),
    (2, 3, 3, '저는 맥캘란으로 시작했어요. 달달해서 좋았습니다.', 0, NOW(6), NOW(6)),
    (3, 3, 1, '글렌피딕 맞아요, 가성비도 좋아요.', 0, NOW(6), NOW(6)),
    (4, 6, 2, '버번은 옥수수 51% 이상, 라이는 호밀 51% 이상입니다.', 0, NOW(6), NOW(6)),
    (5, 6, 3, '맛도 달라요. 버번은 달고 라이는 스파이시해요.', 0, NOW(6), NOW(6));

-- Closure Table (댓글 트리 구성)
-- comment 1: root
-- comment 2: root
-- comment 3: comment 1 의 대댓글
-- comment 4, 5: root (post_id=6)
INSERT INTO post_comment_tree
(id, ancestor_id, descendant_id, depth)
VALUES
    (1, 1, 1, 0),
    (2, 2, 2, 0),
    (3, 3, 3, 0),
    (4, 1, 3, 1),
    (5, 4, 4, 0),
    (6, 5, 5, 0);

-- 좋아요 데이터
INSERT INTO post_likes
(id, user_id, post_id, up, created_at)
VALUES
    (1, 2, 1, 1, NOW(6)),
    (2, 3, 1, 1, NOW(6)),
    (3, 1, 2, 1, NOW(6)),
    (4, 1, 4, 1, NOW(6)),
    (5, 2, 4, 1, NOW(6));
