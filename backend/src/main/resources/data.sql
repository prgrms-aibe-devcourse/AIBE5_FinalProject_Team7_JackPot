INSERT INTO tags
(id, category, name, display_order, image_url)
VALUES
    (1, 'nose', '시트러스', 1, '/vite.svg'),
    (2, 'nose', '베리류', 2, '/vite.svg'),
    (3, 'nose', '꽃', 3, '/vite.svg'),
    (4, 'nose', '허브', 4, '/vite.svg'),
    (5, 'nose', '곡물', 5, '/vite.svg'),
    (6, 'nose', '견과류', 6, '/vite.svg'),
    (7, 'nose', '꿀', 7, '/vite.svg'),
    (8, 'nose', '바닐라', 8, '/vite.svg'),
    (9, 'nose', '캐러멜', 9, '/vite.svg'),
    (10, 'nose', '초콜릿', 10, '/vite.svg'),
    (11, 'nose', '커피', 11, '/vite.svg'),
    (12, 'nose', '후추', 12, '/vite.svg'),
    (13, 'nose', '계피', 13, '/vite.svg'),
    (14, 'nose', '정향', 14, '/vite.svg'),
    (15, 'nose', '우디(나무, 오크)', 15, '/vite.svg'),
    (16, 'nose', '가죽', 16, '/vite.svg'),
    (17, 'nose', '피트', 17, '/vite.svg'),
    (18, 'nose', '흙', 18, '/vite.svg'),
    (19, 'nose', '약품', 19, '/vite.svg'),
    (101, 'taste', '시트러스', 1, '/vite.svg'),
    (102, 'taste', '베리류', 2, '/vite.svg'),
    (103, 'taste', '허브', 3, '/vite.svg'),
    (104, 'taste', '곡물', 4, '/vite.svg'),
    (105, 'taste', '견과류', 5, '/vite.svg'),
    (106, 'taste', '꿀', 6, '/vite.svg'),
    (107, 'taste', '바닐라', 7, '/vite.svg'),
    (108, 'taste', '캐러멜', 8, '/vite.svg'),
    (109, 'taste', '초콜릿', 9, '/vite.svg'),
    (110, 'taste', '커피', 10, '/vite.svg'),
    (111, 'taste', '우디(나무, 오크)', 11, '/vite.svg'),
    (112, 'taste', '피트', 12, '/vite.svg'),
    (113, 'taste', '흙', 13, '/vite.svg'),
    (114, 'taste', '짠맛', 14, '/vite.svg');

-- ========== whiskey_reviews_batch1.json ==========
-- whiskeys
INSERT INTO whiskeys (id, name, type, etc_detail, image_url, abv, age_years, status, region, country, cask, created_at, updated_at) VALUES
    (1, '글렌피딕 18년', 'single_malt', NULL, 'whiskey/글렌피딕_18년.webp', 40.0, 18, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (2, '오켄토션 12년', 'single_malt', NULL, 'whiskey/오켄토션_12년.webp', 40.0, 12, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (3, '에버펠디 12년', 'single_malt', NULL, 'whiskey/에버펠디_12년.webp', 40.0, 12, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (4, '글렌모렌지 오리지널 10년', 'single_malt', NULL, 'whiskey/글렌모렌지_오리지널_10년.webp', 40.0, 10, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (5, '폴존 피티드 클래식 셀렉트 캐스크', 'single_malt', NULL, 'whiskey/폴존_피티드_클래식_셀렉트_캐스크.webp', 55.5, 0, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (6, '글렌피딕 그랑 크루 23년', 'single_malt', NULL, 'whiskey/글렌피딕_그랑_크루_23년.webp', 40.0, 23, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (7, '맥캘란 15년 더블 캐스크', 'single_malt', NULL, 'whiskey/맥캘란_15년_더블_캐스크.webp', 43.0, 15, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (8, '스페이번 10년', 'single_malt', NULL, 'whiskey/스페이번_10년.webp', 40.0, 10, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (9, '로크로몬드 오리지날', 'single_malt', NULL, 'whiskey/로크로몬드_오리지날.webp', 40.0, 0, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40'),
    (10, '로얄 브라클라 21년', 'single_malt', NULL, 'whiskey/로얄_브라클라_21년.webp', 46.0, 21, 'active', NULL, NULL, NULL, '2026-05-26 14:27:40', '2026-05-26 14:27:40');

-- whiskeys_note_cache
INSERT INTO whiskeys_note_cache (id, whiskey_id, count, body_score, finish_score, smoky_score, spicy_score, sweet_score) VALUES
    (1, 1, 14, 83, 73, 39, 83, 103),
    (2, 2, 20, 95, 81, 50, 88, 121),
    (3, 3, 20, 95, 85, 52, 79, 169),
    (4, 4, 15, 61, 61, 39, 54, 127),
    (5, 5, 20, 164, 127, 155, 105, 89),
    (6, 6, 10, 66, 53, 24, 47, 78),
    (7, 7, 12, 73, 71, 18, 49, 96),
    (8, 8, 16, 58, 66, 26, 60, 88),
    (9, 9, 19, 129, 61, 78, 73, 119),
    (10, 10, 15, 109, 117, 64, 89, 118);

-- avg_whiskey_tags
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (1, 2, 1, 10),
    (2, 3, 1, 11),
    (3, 15, 1, 9),
    (4, 6, 1, 13),
    (5, 13, 1, 10),
    (6, 1, 1, 1),
    (7, 9, 1, 1),
    (8, 111, 1, 10),
    (9, 105, 1, 11),
    (10, 106, 1, 1);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (11, 101, 1, 1),
    (12, 1, 2, 13),
    (13, 9, 2, 15),
    (14, 15, 2, 13),
    (15, 4, 2, 14),
    (16, 3, 2, 14),
    (17, 107, 2, 20),
    (18, 101, 2, 1),
    (19, 104, 2, 1),
    (20, 108, 2, 1);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (21, 7, 3, 14),
    (22, 8, 3, 13),
    (23, 3, 3, 14),
    (24, 15, 3, 15),
    (25, 19, 3, 1),
    (26, 12, 3, 2),
    (27, 16, 3, 1),
    (28, 2, 3, 1),
    (29, 4, 3, 1),
    (30, 9, 3, 1);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (31, 102, 3, 14),
    (32, 107, 3, 15),
    (33, 106, 3, 15),
    (34, 112, 3, 1),
    (35, 105, 3, 1),
    (36, 3, 4, 14),
    (37, 8, 4, 9),
    (38, 15, 4, 11),
    (39, 1, 4, 10),
    (40, 14, 4, 1);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (41, 5, 4, 1),
    (42, 7, 4, 1),
    (43, 4, 4, 1),
    (44, 101, 4, 12),
    (45, 107, 4, 10),
    (46, 102, 4, 9),
    (47, 17, 5, 15),
    (48, 1, 5, 13),
    (49, 4, 5, 1),
    (50, 3, 5, 1);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (51, 7, 5, 1),
    (52, 13, 5, 1),
    (53, 2, 5, 1),
    (54, 6, 5, 1),
    (55, 112, 5, 20),
    (56, 104, 5, 1),
    (57, 101, 5, 2),
    (58, 108, 5, 1),
    (59, 3, 6, 9),
    (60, 2, 6, 8);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (61, 15, 6, 4),
    (62, 5, 6, 1),
    (63, 111, 6, 7),
    (64, 102, 6, 6),
    (65, 107, 6, 1),
    (66, 113, 6, 1),
    (67, 112, 6, 1),
    (68, 109, 6, 1),
    (69, 8, 7, 9),
    (70, 2, 7, 10);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (71, 10, 7, 8),
    (72, 1, 7, 9),
    (73, 13, 7, 7),
    (74, 19, 7, 1),
    (75, 7, 7, 10),
    (76, 18, 7, 1),
    (77, 17, 7, 1),
    (78, 109, 7, 7),
    (79, 102, 7, 10),
    (80, 107, 7, 9);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (81, 112, 7, 1),
    (82, 114, 7, 1),
    (83, 7, 8, 10),
    (84, 8, 8, 15),
    (85, 1, 8, 11),
    (86, 15, 8, 13),
    (87, 19, 8, 1),
    (88, 5, 8, 1),
    (89, 2, 8, 1),
    (90, 3, 8, 12);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (91, 13, 8, 1),
    (92, 18, 8, 1),
    (93, 12, 8, 1),
    (94, 10, 8, 1),
    (95, 102, 8, 13),
    (96, 111, 8, 12),
    (97, 104, 8, 1),
    (98, 108, 8, 1),
    (99, 106, 8, 1),
    (100, 112, 8, 2);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (101, 107, 8, 1),
    (102, 103, 8, 2),
    (103, 110, 8, 1),
    (104, 15, 9, 16),
    (105, 7, 9, 10),
    (106, 8, 9, 14),
    (107, 17, 9, 14),
    (108, 3, 9, 12),
    (109, 10, 9, 1),
    (110, 16, 9, 1);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (111, 6, 9, 1),
    (112, 1, 9, 1),
    (113, 102, 9, 12),
    (114, 101, 9, 13),
    (115, 112, 9, 15),
    (116, 107, 9, 13),
    (117, 109, 9, 1),
    (118, 110, 9, 1),
    (119, 104, 9, 1),
    (120, 6, 10, 8);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (121, 16, 10, 12),
    (122, 4, 10, 12),
    (123, 15, 10, 13),
    (124, 18, 10, 1),
    (125, 13, 10, 1),
    (126, 11, 10, 1),
    (127, 105, 10, 10),
    (128, 109, 10, 11),
    (129, 112, 10, 1),
    (130, 110, 10, 1);
INSERT INTO avg_whiskey_tags (id, tag_id, cache_id, count) VALUES
    (131, 102, 10, 2),
    (132, 106, 10, 1);
-- =====================================================
-- 커뮤니티 테스트 데이터 (author_id=1~3 은 테스트용 임시 userId)
-- =====================================================

INSERT INTO posts
(id, author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES
    (1, 1, 'COLUMN',  'R', '글렌피딕 12년 심층 리뷰', '<p>글렌피딕 12년은 입문자에게 최고의 선택입니다...</p>', 5, 0, 0, NOW(6), NOW(6)),
    (2, 2, 'COLUMN',  'R', '아드벡 10년, 피트의 정수', '<p>아드벡 10년은 강렬한 피트향으로 유명합니다...</p>', 3, 0, 0, NOW(6), NOW(6)),
    (3, 1, 'FREE',    'F', '위스키 입문 어떤 걸로 시작할까요?', '<p>처음 위스키를 시작하려는데 추천 부탁드립니다.</p>', 2, 0, 0, NOW(6), NOW(6)),
    (4, 3, 'FREE',    'L', '서울 위스키 바 추천', '<p>강남에 괜찮은 위스키 바 아시는 분 있나요?</p>', 4, 0, 0, NOW(6), NOW(6)),
    (5, 2, 'FREE',    'G', '야마자키 나눔합니다', '<p>야마자키 한 병 나눔합니다. 댓글 주세요.</p>', 1, 0, 0, NOW(6), NOW(6)),
    (6, 1, 'QA',      'Q', '버번과 라이의 차이가 뭔가요?', '<p>버번 위스키와 라이 위스키의 차이점이 궁금합니다.</p>', 0, 0, 0, NOW(6), NOW(6)),
    (7, 3, 'QA',      'Q', '테이스팅 노트 작성하는 방법', '<p>테이스팅 노트를 처음 써보려는데 어떻게 하면 좋을까요?</p>', 2, 0, 0, NOW(6), NOW(6));

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
