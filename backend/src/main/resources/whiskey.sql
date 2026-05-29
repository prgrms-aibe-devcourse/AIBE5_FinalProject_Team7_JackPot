-- ========== whiskey_reviews_batch1.json ==========
-- whiskeys
INSERT INTO whiskeys (id, name, type, etc_detail, image_url, abv, age_years, status, region, country, cask, created_at, updated_at) VALUES
    (1, '글렌피딕 18년', 'single_malt', NULL, 'whiskey/글렌피딕_18년.webp', 40.0, 18, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (2, '오켄토션 12년', 'single_malt', NULL, 'whiskey/오켄토션_12년.webp', 40.0, 12, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (3, '에버펠디 12년', 'single_malt', NULL, 'whiskey/에버펠디_12년.webp', 40.0, 12, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (4, '글렌모렌지 오리지널 10년', 'single_malt', NULL, 'whiskey/글렌모렌지_오리지널_10년.webp', 40.0, 10, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (5, '폴존 피티드 클래식 셀렉트 캐스크', 'single_malt', NULL, 'whiskey/폴존_피티드_클래식_셀렉트_캐스크.webp', 55.5, 0, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (6, '글렌피딕 그랑 크루 23년', 'single_malt', NULL, 'whiskey/글렌피딕_그랑_크루_23년.webp', 40.0, 23, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (7, '맥캘란 15년 더블 캐스크', 'single_malt', NULL, 'whiskey/맥캘란_15년_더블_캐스크.webp', 43.0, 15, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (8, '스페이번 10년', 'single_malt', NULL, 'whiskey/스페이번_10년.webp', 40.0, 10, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (9, '로크로몬드 오리지날', 'single_malt', NULL, 'whiskey/로크로몬드_오리지날.webp', 40.0, 0, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33'),
    (10, '로얄 브라클라 21년', 'single_malt', NULL, 'whiskey/로얄_브라클라_21년.webp', 46.0, 21, 'active', NULL, NULL, NULL, '2026-05-27 12:25:33', '2026-05-27 12:25:33');

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
