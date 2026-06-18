-- V21: 자유게시판 조회수 현실화 + 댓글 시드 (post_comments + post_comment_tree Closure Table)
-- 사용 유저: 1(위스키러버) 2(싱글몰트킹) 3(스카치매니아) 5(테스트) + 100~106
-- post_comment_tree 규칙:
--   최상위 댓글: (self, self, 0)
--   대댓글:      (self, self, 0) + (parent, self, 1)

SET NAMES utf8mb4;

-- ============================================================
-- 1. 조회수 현실화
-- ============================================================

UPDATE posts SET view_count = 524  WHERE id = 45;   -- 첫 위스키 추천 (질문글 조회 많음)
UPDATE posts SET view_count = 248  WHERE id = 46;   -- 글렌피딕 18년 리뷰
UPDATE posts SET view_count = 437  WHERE id = 47;   -- 피트 입문 로드맵
UPDATE posts SET view_count = 312  WHERE id = 48;   -- 홈바 셋업
UPDATE posts SET view_count = 389  WHERE id = 49;   -- 맥캘란 15년 리뷰
UPDATE posts SET view_count = 578  WHERE id = 50;   -- 마트 가격 정보 (정보글 조회 많음)
UPDATE posts SET view_count = 195  WHERE id = 51;   -- 위스키 잔 종류
UPDATE posts SET view_count = 267  WHERE id = 52;   -- 폴존 피티드 리뷰
UPDATE posts SET view_count = 341  WHERE id = 53;   -- 선물 추천
UPDATE posts SET view_count = 143  WHERE id = 54;   -- 오늘의 한잔
UPDATE posts SET view_count = 489  WHERE id = 55;   -- 냉장 보관 (실용 질문 조회 많음)
UPDATE posts SET view_count = 612  WHERE id = 56;   -- 가성비 TOP5 (리스트글 인기)
UPDATE posts SET view_count = 177  WHERE id = 57;   -- 오켄토션 12년
UPDATE posts SET view_count = 394  WHERE id = 58;   -- 혼술
UPDATE posts SET view_count = 503  WHERE id = 59;   -- 지역별 특징
UPDATE posts SET view_count = 287  WHERE id = 60;   -- 보관 온도
UPDATE posts SET view_count = 198  WHERE id = 61;   -- 생일 선물
UPDATE posts SET view_count = 456  WHERE id = 62;   -- 와인러버 추천
UPDATE posts SET view_count = 534  WHERE id = 63;   -- 면세점 팁
UPDATE posts SET view_count = 213  WHERE id = 64;   -- 글렌모렌지 10년
UPDATE posts SET view_count = 372  WHERE id = 65;   -- 테이스팅 용어
UPDATE posts SET view_count = 689  WHERE id = 66;   -- 서울 위스키 바 (지역 정보 최고 조회)
UPDATE posts SET view_count = 421  WHERE id = 67;   -- 맥캘란 비교
UPDATE posts SET view_count = 498  WHERE id = 68;   -- 상반기 결산
UPDATE posts SET view_count = 367  WHERE id = 69;   -- 유튜브 추천

-- 기존 테스트 글도 약간 조회수 부여
UPDATE posts SET view_count = 156  WHERE id = 3;
UPDATE posts SET view_count = 89   WHERE id = 4;
UPDATE posts SET view_count = 234  WHERE id = 5;

-- ============================================================
-- 2. 댓글 시드
-- ============================================================

-- ─────────────────────────────────────────
-- POST 45: 위스키 처음 시작하는데 뭐부터?
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (45, 1, '저도 처음에 딱 같은 고민 했었는데요! 저는 글렌피딕 12년부터 시작했어요. 스페이사이드라 향이 과일향 위주라 부담 없고 가격도 합리적이에요 😊', '2026-04-02 14:03:00', '2026-04-02 14:03:00', false);
SET @c45_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c45_1, @c45_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (45, 104, '예산 5~7만원이면 오켄토션 12년도 강추드려요. 트리플 디스틸드라 잡내가 없고 깔끔해서 처음 마시는 분께 딱 좋습니다. 코스트코에서 3만원대에 팔아요!', '2026-04-02 15:30:00', '2026-04-02 15:30:00', false);
SET @c45_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c45_2, @c45_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (45, 100, '오코스트코에서요?? 저 집 근처에 있는데 다음에 가볼게요 ㅎㅎ 감사합니다!', '2026-04-02 16:10:00', '2026-04-02 16:10:00', false);
SET @c45_2r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c45_2r1, @c45_2r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c45_2, @c45_2r1, 1);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (45, 2, '버번 입문은 메이커스 마크나 우드포드 리저브 추천드려요. 바닐라, 캐러멜 향이 달달해서 처음 마시는 분들이 대부분 좋아하더라고요 🍯', '2026-04-02 18:44:00', '2026-04-02 18:44:00', false);
SET @c45_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c45_3, @c45_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (45, 3, '처음에 피트 위스키는 패스! 라가불린 같은 건 나중에 도전하세요. 첫인상이 나빠지면 위스키 자체를 멀리하게 될 수 있거든요 ㅋㅋ', '2026-04-02 21:55:00', '2026-04-02 21:55:00', false);
SET @c45_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c45_4, @c45_4, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (45, 105, '설문 기능 써보셨나요? 여기 WhiskeyNote에 취향 설문 하면 맞춤 추천 해줘서 저는 처음에 그걸로 골랐어요. 의외로 잘 맞더라고요!', '2026-04-03 10:20:00', '2026-04-03 10:20:00', false);
SET @c45_5 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c45_5, @c45_5, 0);

-- ─────────────────────────────────────────
-- POST 46: 글렌피딕 18년 개봉 후기
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (46, 3, '글렌피딕 18년 저도 좋아해요! 근데 개인적으론 그랑 크루 23년이 더 취향이더라고요. 포도 껍질 느낌이 특이하게 좋아서 🍇', '2026-04-05 21:30:00', '2026-04-05 21:30:00', false);
SET @c46_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c46_1, @c46_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (46, 1, '건포도 향이 저도 제일 인상적이었어요. 18년 숙성의 깊이가 느껴지는 게 가격만큼 값을 한다고 생각했습니다!', '2026-04-05 22:15:00', '2026-04-05 22:15:00', false);
SET @c46_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c46_2, @c46_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (46, 101, '저는 글렌피딕 18년 마시고 위스키에 빠졌어요. 셰리 스타일 처음 입문하기에 정말 좋은 위스키 🥃', '2026-04-06 09:02:00', '2026-04-06 09:02:00', false);
SET @c46_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c46_3, @c46_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (46, 104, '18년 다음으로 달모어 12년도 한번 시도해보세요! 셰리 + 시트러스 피니시가 색다른 경험입니다.', '2026-04-06 14:50:00', '2026-04-06 14:50:00', false);
SET @c46_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c46_4, @c46_4, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (46, 102, '좋은 리뷰 감사합니다. 저도 다음 개봉 후기 올릴게요 ㅋㅋ 맥캘란이랑 비교가 궁금하신 분 많을 것 같아요', '2026-04-06 20:33:00', '2026-04-06 20:33:00', false);
SET @c46_5 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c46_5, @c46_5, 0);

-- ─────────────────────────────────────────
-- POST 47: 피트 위스키 입문 로드맵
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (47, 2, '보모어 12년이 아일라 입문 최강인 건 정말 동의해요. 저는 보모어→아드벡→라가불린 순서로 왔는데 라가불린에서 진짜 입이 벌어졌어요 😂', '2026-04-08 20:10:00', '2026-04-08 20:10:00', false);
SET @c47_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c47_1, @c47_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (47, 101, '라가불린은 진짜 경고 없이 중독되더라고요. 스모키+과일 밸런스가 완벽해서 ㅋㅋ 주의하세요', '2026-04-08 21:05:00', '2026-04-08 21:05:00', false);
SET @c47_1r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c47_1r1, @c47_1r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c47_1, @c47_1r1, 1);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (47, 3, '폴존 피티드는 아이리시 피트라 스카치랑 다른 느낌이죠. 저는 스카치 피트가 더 취향인데 비교해서 마셔보는 것도 재미있더라고요', '2026-04-09 09:30:00', '2026-04-09 09:30:00', false);
SET @c47_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c47_2, @c47_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (47, 103, '오크토모어도 추가해주세요... 다음 단계로 💀 저는 아직도 무서워서 못 열었어요', '2026-04-09 13:22:00', '2026-04-09 13:22:00', false);
SET @c47_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c47_3, @c47_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (47, 5, '피트 위스키 어디서 잔으로 먼저 마셔볼 수 있을까요? 한 병 사기엔 아직 겁나서요...', '2026-04-10 18:00:00', '2026-04-10 18:00:00', false);
SET @c47_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c47_4, @c47_4, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (47, 101, '잔으로 마시려면 위스키 바 가시는 게 최고예요! 서울 이태원이나 강남 쪽에 스카치 전문 바 있으니 가서 물어보시면 친절하게 추천해줄 거예요 😊', '2026-04-10 20:15:00', '2026-04-10 20:15:00', false);
SET @c47_4r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c47_4r1, @c47_4r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c47_4, @c47_4r1, 1);

-- ─────────────────────────────────────────
-- POST 48: 홈바 셋업 후기
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (48, 102, '와 멋있다! 저도 선반 DIY 하고 싶은데 목공 경험이 없어서 엄두를 못 내고 있어요. 혹시 유튜브 영상 참고하셨나요?', '2026-04-12 16:45:00', '2026-04-12 16:45:00', false);
SET @c48_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c48_1, @c48_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (48, 105, '목공 유튜브 "생활공방" 채널이 진짜 초보자 친화적이에요! 가이드 레일만 있으면 생각보다 쉽게 할 수 있더라고요 😄', '2026-04-12 18:22:00', '2026-04-12 18:22:00', false);
SET @c48_1r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c48_1r1, @c48_1r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c48_1, @c48_1r1, 1);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (48, 1, '와인셀러 중고로 구하신 거 정말 좋은 팁이에요! 저는 온도 관리 못 해서 여름에 몇 병 버렸거든요 😭 당장 중고나라 뒤져봐야겠다', '2026-04-13 11:00:00', '2026-04-13 11:00:00', false);
SET @c48_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c48_2, @c48_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (48, 3, '14병이면 이미 컬렉터급이세요 ㄷㄷ 저는 이제 6병인데 선반 채우는 게 목표입니다 ㅎㅎ', '2026-04-14 20:10:00', '2026-04-14 20:10:00', false);
SET @c48_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c48_3, @c48_3, 0);

-- ─────────────────────────────────────────
-- POST 49: 맥캘란 15년 더블 캐스크
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (49, 102, '맥캘란 15년은 16년 전에 단종 위기까지 갔다가 라인업 재정비 이후 다시 나온 거라 팬들한테 의미가 깊어요. 저도 매우 좋아합니다 🥃', '2026-04-15 22:40:00', '2026-04-15 22:40:00', false);
SET @c49_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c49_1, @c49_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (49, 2, '피니시가 짧다는 의견에 공감해요. 12년이랑 비교하면 훨씬 깊어지는데 18년에 비하면 좀 아쉽죠. 그래도 이 가격대 셰리론 최고라고 생각해요', '2026-04-16 10:15:00', '2026-04-16 10:15:00', false);
SET @c49_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c49_2, @c49_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (49, 104, '12년 더블 캐스크 → 15년 더블 캐스크 → 18년 셰리 순서로 마셔보시면 숙성 연수에 따른 차이를 체감할 수 있어요. 맥캘란 여행 추천!', '2026-04-16 14:30:00', '2026-04-16 14:30:00', false);
SET @c49_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c49_3, @c49_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (49, 5, '맥캘란은 너무 유명해서 가성비가 좀 떨어진다는 얘기도 있던데 실제로 마셔보니 어떠셨어요?', '2026-04-17 09:22:00', '2026-04-17 09:22:00', false);
SET @c49_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c49_4, @c49_4, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (49, 104, '가성비 논란은 사실이에요. 같은 값이면 아벨라워 아부나흐나 글렌드로낙 12년이 더 진한 셰리를 준다고 하는 분들도 있어요. 근데 맥캘란은 브랜드 경험 자체가 있어서..', '2026-04-17 12:50:00', '2026-04-17 12:50:00', false);
SET @c49_4r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c49_4r1, @c49_4r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c49_4, @c49_4r1, 1);

-- ─────────────────────────────────────────
-- POST 52: 폴존 피티드 충격 후기
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (52, 101, '폴존 피티드 저도 똑같이 충격받았어요 ㅋㅋㅋ 아이리시라고 만만하게 봤다가 코가 훈제 냄새로 가득 찼을 때 당황했던 기억이', '2026-04-22 21:30:00', '2026-04-22 21:30:00', false);
SET @c52_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c52_1, @c52_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (52, 3, '55.5%라는 도수가 포인트예요. 물 추가량에 따라 맛이 완전히 달라져서 다양하게 즐길 수 있어요. 30ml 폴존 + 90ml 탄산수 하이볼도 맛있어요!', '2026-04-23 08:45:00', '2026-04-23 08:45:00', false);
SET @c52_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c52_2, @c52_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (52, 106, '하이볼로 마셔보고 싶네요. 피트 하이볼은 어떤 맛이에요?', '2026-04-23 14:20:00', '2026-04-23 14:20:00', false);
SET @c52_2r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c52_2r1, @c52_2r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c52_2, @c52_2r1, 1);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (52, 2, '아드벡 하이볼이랑 비슷한 느낌인데 더 부드러워요. 피트 처음이라면 오히려 하이볼로 먼저 접근하는 게 좋을 수도 있어요!', '2026-04-23 17:10:00', '2026-04-23 17:10:00', false);
SET @c52_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c52_3, @c52_3, 0);

-- ─────────────────────────────────────────
-- POST 54: 오늘의 한잔 에버펠디
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (54, 1, '에버펠디 저도 좋아해요! 꿀향이 정말 독특하죠. 저는 다크 초콜릿 대신 꿀 치즈 크래커랑 먹었는데 조합이 장난 아니었어요 🧀', '2026-04-28 22:50:00', '2026-04-28 22:50:00', false);
SET @c54_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c54_1, @c54_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (54, 106, '저는 오늘 로크로몬드 오리지날이요 ㅎㅎ 부담 없고 무난한 하이랜드 위스키인데 가격 대비 만족스러워요', '2026-04-29 00:10:00', '2026-04-29 00:10:00', false);
SET @c54_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c54_2, @c54_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (54, 5, '안주로 짠 것이랑 달달한 거 같이 먹으면 위스키 향이 더 살아나는 느낌이에요. 프레첼이나 아몬드 추천해요!', '2026-04-29 08:30:00', '2026-04-29 08:30:00', false);
SET @c54_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c54_3, @c54_3, 0);

-- ─────────────────────────────────────────
-- POST 56: 가성비 위스키 TOP 5
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (56, 1, '스페이번 10년 저도 최고 가성비라고 생각해요! 3만원대에 이 퀄리티면 진짜 이상한 거예요 ㅋㅋ 선물용으로도 포장이 예뻐서 자주 씁니다', '2026-05-05 15:30:00', '2026-05-05 15:30:00', false);
SET @c56_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c56_1, @c56_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (56, 102, '글렌모렌지 오리지널은 가성비도 좋지만 포장이 얇고 가벼워서 여행갈 때 면세점에서 사기 좋아요! 작은 기념품 느낌', '2026-05-05 17:45:00', '2026-05-05 17:45:00', false);
SET @c56_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c56_2, @c56_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (56, 3, '5번 발렌타인 파이니스트는 진짜 하이볼 전용으로 쓰면 가성비 최강이죠. 탄산수 1:3 비율에 레몬 한 조각 떨어뜨리면 카페 하이볼이에요 ☕', '2026-05-06 10:20:00', '2026-05-06 10:20:00', false);
SET @c56_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c56_3, @c56_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (56, 100, '리스트 너무 유용해요! 하나씩 다 마셔보는 게 목표입니다 🙌', '2026-05-06 14:30:00', '2026-05-06 14:30:00', false);
SET @c56_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c56_4, @c56_4, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (56, 104, '글렌리벳 12년도 이 가격대에서 강력한 경쟁자예요. 혹시 다음 편 만들어주신다면 넣어주세요 😄', '2026-05-07 09:00:00', '2026-05-07 09:00:00', false);
SET @c56_5 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c56_5, @c56_5, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (56, 104, '사실 글렌리벳은 5만원 넘어가기도 해서 TOP5에서 빠진 것 같아요. 가격 변동이 좀 있거든요', '2026-05-07 10:15:00', '2026-05-07 10:15:00', false);
SET @c56_5r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c56_5r1, @c56_5r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c56_5, @c56_5r1, 1);

-- ─────────────────────────────────────────
-- POST 58: 혼술 이야기
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (58, 1, '전혀 이상하지 않아요! 오히려 혼자 마셔야 맛에 집중할 수 있다고 생각해요. 여럿이 마시면 얘기하다가 맛을 제대로 못 느끼게 되더라고요 ㅎㅎ', '2026-05-11 00:05:00', '2026-05-11 00:05:00', false);
SET @c58_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c58_1, @c58_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (58, 105, '저도 혼술파예요. 새벽에 음악 틀고 한 잔 씩 음미하는 게 제일 좋아요. 재즈나 로파이 힙합 틀고 마시면 최고입니다 🎶', '2026-05-11 01:22:00', '2026-05-11 01:22:00', false);
SET @c58_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c58_2, @c58_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (58, 103, '저는 같이 마시는 편인데 취향 공유하는 재미가 있어서요. 근데 혼술도 충분히 즐길 수 있다고 생각해요 😄', '2026-05-11 09:45:00', '2026-05-11 09:45:00', false);
SET @c58_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c58_3, @c58_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (58, 2, '위스키는 혼술 장르라고 생각해요. 서서히 맛이 변하는 걸 느끼면서 마시는 음료라 혼자 집중해야 그 깊이가 보이더라고요', '2026-05-11 20:10:00', '2026-05-11 20:10:00', false);
SET @c58_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c58_4, @c58_4, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (58, 3, '맞아요. 잔 온도, 가수량, 공기 접촉 시간에 따라 달라지는 향을 혼자 천천히 느끼는 게 위스키의 묘미인 것 같아요 🥃', '2026-05-12 11:30:00', '2026-05-12 11:30:00', false);
SET @c58_4r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c58_4r1, @c58_4r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c58_4, @c58_4r1, 1);

-- ─────────────────────────────────────────
-- POST 59: 지역별 특징 정리
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (59, 100, '이거 저장했어요! 위스키 공부할 때 지역 분류가 정말 헷갈렸는데 이렇게 정리해주시니 완벽해요. 감사합니다 🙏', '2026-05-13 18:30:00', '2026-05-13 18:30:00', false);
SET @c59_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c59_1, @c59_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (59, 1, '캠벨타운은 특유의 소금기 + 과일향이 개성 있는데 많이 소개가 안 되는 편이에요. 스프링뱅크 기회가 되면 꼭 드셔보세요!', '2026-05-14 10:00:00', '2026-05-14 10:00:00', false);
SET @c59_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c59_2, @c59_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (59, 106, '일본 위스키도 넣어주세요 ㅎㅎ 산토리 vs 니카 비교도 궁금해요!', '2026-05-15 14:22:00', '2026-05-15 14:22:00', false);
SET @c59_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c59_3, @c59_3, 0);

-- ─────────────────────────────────────────
-- POST 62: 와인러버 추천
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (62, 5, '와인에서 위스키로 넘어온 1인입니다 🙋 아벨라워 아부나흐 먹고 완전히 빠졌어요. 강도 높은데 셰리 달콤함이 있어서 레드와인 좋아하는 분들한테 딱이에요', '2026-05-22 16:00:00', '2026-05-22 16:00:00', false);
SET @c62_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c62_1, @c62_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (62, 1, '달모어 12년 강추! 시트러스 피니시가 화이트와인 마시다가 넘어온 분들한테 친근하게 느껴지더라고요 🍊', '2026-05-22 18:45:00', '2026-05-22 18:45:00', false);
SET @c62_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c62_2, @c62_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (62, 102, '주변에 와인 좋아하는 친구한테 이 리스트 공유했더니 맥캘란 사줬어요 ㅋㅋㅋ 반응 굳이었습니다', '2026-05-23 09:22:00', '2026-05-23 09:22:00', false);
SET @c62_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c62_3, @c62_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (62, 103, '버건디 오크 피니시 한 위스키들도 와인러버들한테 좋을 것 같아요. 아벨라워 아부나흐는 와인 오크 피니시라서 더 특이한 경험이 됩니다', '2026-05-23 22:00:00', '2026-05-23 22:00:00', false);
SET @c62_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c62_4, @c62_4, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (62, 104, '아 와인 오크 피니시 아이디어 좋네요! 독특한 조합이에요. 저도 찾아봐야겠다 😄', '2026-05-24 08:10:00', '2026-05-24 08:10:00', false);
SET @c62_4r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c62_4r1, @c62_4r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c62_4, @c62_4r1, 1);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (62, 2, '글렌드로낙 12년도 와인러버한테 추천할 만해요. 셰리 100% 숙성인데 가격도 착하고 맛도 묵직하거든요', '2026-05-24 14:00:00', '2026-05-24 14:00:00', false);
SET @c62_5 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c62_5, @c62_5, 0);

-- ─────────────────────────────────────────
-- POST 66: 서울 위스키 바 추천
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (66, 2, '이태원 더 스카치 가봤는데 진짜 좋았어요. 희귀 위스키 라인업이 국내 최강 수준이고 바텐더분이 아일라 vs 하이랜드 비교 설명을 3시간 넘게 해줬어요 😂', '2026-06-04 19:30:00', '2026-06-04 19:30:00', false);
SET @c66_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c66_1, @c66_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (66, 104, '강남 앤 위스키도 추천이에요. 포트와인 오크 숙성 위스키를 전문으로 갖추고 있어서 특이한 거 마시기 좋아요. 혼자 가도 전혀 어색하지 않아요', '2026-06-04 21:10:00', '2026-06-04 21:10:00', false);
SET @c66_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c66_2, @c66_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (66, 100, '혼자 가기 부끄럽지 않나요? 저 아직 위스키 초보라 바텐더분한테 뭐라고 해야할지 모르겠어요 😅', '2026-06-05 10:22:00', '2026-06-05 10:22:00', false);
SET @c66_2r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c66_2r1, @c66_2r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c66_2, @c66_2r1, 1);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (66, 3, '"단맛 있고 스모키하지 않은 걸로 추천해주세요"라고만 해도 바텐더분들이 알아서 잘 골라주세요! 부끄러울 것 없어요 😊', '2026-06-05 13:00:00', '2026-06-05 13:00:00', false);
SET @c66_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c66_3, @c66_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (66, 105, '마포 위스키 클럽은 가격도 착하고 분위기 캐주얼해서 입문자 데려가기 좋아요. 잔당 1.5~2만원대라 부담 없이 여러 개 비교 가능!', '2026-06-05 20:40:00', '2026-06-05 20:40:00', false);
SET @c66_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c66_4, @c66_4, 0);

-- ─────────────────────────────────────────
-- POST 68: 상반기 결산
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (68, 1, '저도 폴존 피티드가 올해 최고 발견이에요! 아이리시라는 고정관념을 완전히 깨줬죠. 2위로 올려드리고 싶어요 🔥', '2026-06-10 23:15:00', '2026-06-10 23:15:00', false);
SET @c68_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c68_1, @c68_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (68, 102, '저 상반기 베스트는 글렌피딕 18년이에요! 오래 위시리스트에 있었는데 드디어 개봉했고 기대 이상이었어요 😍', '2026-06-11 09:30:00', '2026-06-11 09:30:00', false);
SET @c68_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c68_2, @c68_2, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (68, 3, '저는 맥캘란 더블 캐스크 15년이요! 셰리가 이렇게 맛있는 거였나 싶었어요. 하반기엔 맥캘란 18년 셰리 오크 도전해볼 예정입니다 💪', '2026-06-11 14:20:00', '2026-06-11 14:20:00', false);
SET @c68_3 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c68_3, @c68_3, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (68, 103, '저는 야마자키 12년! 일본 여행에서 면세로 사왔는데 국내에서 마시니까 더 특별하게 느껴지더라고요 ㅎㅎ', '2026-06-11 20:45:00', '2026-06-11 20:45:00', false);
SET @c68_4 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c68_4, @c68_4, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (68, 106, '하반기 기대작 있으세요? 저는 하이랜드 파크 12년 도전해볼 거예요 🗺️', '2026-06-12 10:00:00', '2026-06-12 10:00:00', false);
SET @c68_5 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c68_5, @c68_5, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (68, 101, '하이랜드 파크! 오크니섬 위스키라 보틀 디자인도 멋있고 실제로 마셔보면 꿀+피트 조화가 신기해요. 추천추천', '2026-06-12 11:30:00', '2026-06-12 11:30:00', false);
SET @c68_5r1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c68_5r1, @c68_5r1, 0);
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c68_5, @c68_5r1, 1);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (68, 2, '올해 상반기 마신 것들 정리해서 공유하는 문화가 좋네요 ㅎㅎ 저도 글 써봐야겠어요!', '2026-06-13 08:00:00', '2026-06-13 08:00:00', false);
SET @c68_6 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c68_6, @c68_6, 0);

-- ─────────────────────────────────────────
-- POST 3: 위스키 입문 어떤 걸로? (기존 글)
-- ─────────────────────────────────────────
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (3, 104, '이 글 보고 오켄토션 샀는데 진짜 좋았어요. 입문자한테 최고 추천이에요 👍', '2026-05-30 10:20:00', '2026-05-30 10:20:00', false);
SET @c3_1 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c3_1, @c3_1, 0);

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at, is_deleted)
VALUES (3, 100, '저도 이 글 보고 글렌모렌지 샀어요! 꽃향기가 너무 좋아서 매일 조금씩 마시고 있어요 😊', '2026-06-01 20:15:00', '2026-06-01 20:15:00', false);
SET @c3_2 = LAST_INSERT_ID();
INSERT INTO post_comment_tree (ancestor_id, descendant_id, depth) VALUES (@c3_2, @c3_2, 0);
