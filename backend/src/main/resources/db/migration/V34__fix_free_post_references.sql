-- V34: 자유게시판 게시글 참조 오프셋 보정
-- V25 시드 시 auto_increment 시작점이 환경마다 달라
-- V26(댓글·조회수), V30(카테고리), V32(post_whiskeys)가 잘못된 post_id에 적용된 경우 수정.
-- 이미 올바른 환경(로컬 등, offset=0)에서는 아무 변경도 일어나지 않는다.

SET NAMES utf8mb4;

SET @actual_start = (
  SELECT id FROM posts
  WHERE post_type = 'FREE'
    AND title = '위스키 처음 시작하는데 뭐부터 마셔야 할까요?'
  LIMIT 1
);
SET @expected_start = 45;
SET @offset = IFNULL(@actual_start, @expected_start) - @expected_start;

-- ============================================================
-- 1. 댓글 post_id 보정 (V26 하드코딩 오프셋 수정)
-- ============================================================
UPDATE post_comments
SET post_id = post_id + @offset
WHERE post_id BETWEEN 45 AND 69
  AND @offset <> 0;

-- ============================================================
-- 2. 잘못 적용된 조회수 초기화
--    배포 환경에서 ID 45~69가 COLUMN/NOTICE 게시글인 경우 0으로 초기화
-- ============================================================
UPDATE posts
SET view_count = 0
WHERE id BETWEEN 45 AND 69
  AND post_type != 'FREE'
  AND @offset <> 0;

-- ============================================================
-- 3. 자유게시판 조회수 재적용 (title 기반 — 환경 무관하게 항상 실행)
-- ============================================================
UPDATE posts SET view_count = 524 WHERE post_type = 'FREE' AND title = '위스키 처음 시작하는데 뭐부터 마셔야 할까요?';
UPDATE posts SET view_count = 248 WHERE post_type = 'FREE' AND title = '글렌피딕 18년 드디어 개봉했습니다 — 솔직 후기';
UPDATE posts SET view_count = 437 WHERE post_type = 'FREE' AND title = '피트 위스키 입문 로드맵 — 순서대로 마셔보세요';
UPDATE posts SET view_count = 312 WHERE post_type = 'FREE' AND title = '드디어 홈바 셋업 완료 🥃 비용 및 구성 공유합니다';
UPDATE posts SET view_count = 389 WHERE post_type = 'FREE' AND title = '맥캘란 15년 더블 캐스크 — 명성만큼 할까요?';
UPDATE posts SET view_count = 578 WHERE post_type = 'FREE' AND title = '이마트·롯데마트 위스키 가격 요즘 어때요? 최근 구매 가격 공유';
UPDATE posts SET view_count = 195 WHERE post_type = 'FREE' AND title = '위스키 잔 종류가 너무 많아서 뭘 사야할지 모르겠어요';
UPDATE posts SET view_count = 267 WHERE post_type = 'FREE' AND title = '폴존 피티드 클래식 셀렉트 캐스크 — 처음 마셨는데 충격이에요';
UPDATE posts SET view_count = 341 WHERE post_type = 'FREE' AND title = '부모님 선물용 위스키 추천해주세요 — 예산 10만 원 이내';
UPDATE posts SET view_count = 143 WHERE post_type = 'FREE' AND title = '오늘의 한 잔 🥃 에버펠디 12년 + 오늘의 안주 조합 공유';
UPDATE posts SET view_count = 489 WHERE post_type = 'FREE' AND title = '위스키 냉장 보관해도 되나요? 개봉 후 관리법이 궁금해요';
UPDATE posts SET view_count = 612 WHERE post_type = 'FREE' AND title = '가성비 위스키 TOP 5 — 5만 원 이하에서 이것만 있으면 됩니다';
UPDATE posts SET view_count = 177 WHERE post_type = 'FREE' AND title = '오켄토션 12년 — 로우랜드의 깨끗함이란 이런 것';
UPDATE posts SET view_count = 394 WHERE post_type = 'FREE' AND title = '혼자 위스키 마시는 게 이상한 건 아니죠? 🤔';
UPDATE posts SET view_count = 503 WHERE post_type = 'FREE' AND title = '스카치 위스키 지역별 특징 정리 — 입문자용 지도';
UPDATE posts SET view_count = 287 WHERE post_type = 'FREE' AND title = '위스키 보관 적정 온도가 얼마인가요? 여름이라 걱정됩니다';
UPDATE posts SET view_count = 198 WHERE post_type = 'FREE' AND title = '생일 선물로 로얄 브라클라 21년 받았습니다 🎂';
UPDATE posts SET view_count = 456 WHERE post_type = 'FREE' AND title = '와인 좋아하는 분께 위스키 추천 — 셰리 캐스크가 답입니다';
UPDATE posts SET view_count = 534 WHERE post_type = 'FREE' AND title = '해외 면세점 위스키 쇼핑 꿀팁 — 직접 경험한 내용 정리';
UPDATE posts SET view_count = 213 WHERE post_type = 'FREE' AND title = '글렌모렌지 오리지널 10년 — 일상 위스키로 이만한 게 없다';
UPDATE posts SET view_count = 372 WHERE post_type = 'FREE' AND title = '위스키 테이스팅 용어 너무 어렵지 않나요? 😅';
UPDATE posts SET view_count = 689 WHERE post_type = 'FREE' AND title = '서울 위스키 바 추천 — 강남·이태원·마포 지역별 정리';
UPDATE posts SET view_count = 421 WHERE post_type = 'FREE' AND title = '맥캘란 12년 더블 캐스크 vs 셰리 오크 — 무엇이 더 맥캘란다울까?';
UPDATE posts SET view_count = 498 WHERE post_type = 'FREE' AND title = '2026년 상반기 결산 🥃 — 올해 마신 위스키 베스트 3';
UPDATE posts SET view_count = 367 WHERE post_type = 'FREE' AND title = '위스키 공부하기 좋은 유튜브 채널·책 추천';

-- ============================================================
-- 4. V30 카테고리 보정
--    배포 환경에서 ID 47, 53, 66이 COLUMN 게시글인 경우 category 원복
-- ============================================================
UPDATE posts SET category = 'F'
WHERE id IN (47, 53, 66) AND post_type = 'COLUMN' AND @offset <> 0;

-- 자유게시판 카테고리 title 기반 재적용 (V30 원래 의도)
UPDATE posts SET category = 'B' WHERE post_type = 'FREE' AND title = '피트 위스키 입문 로드맵 — 순서대로 마셔보세요';
UPDATE posts SET category = 'Q' WHERE post_type = 'FREE' AND title = '부모님 선물용 위스키 추천해주세요 — 예산 10만 원 이내';
UPDATE posts SET category = 'L' WHERE post_type = 'FREE' AND title = '서울 위스키 바 추천 — 강남·이태원·마포 지역별 정리';

-- ============================================================
-- 5. post_whiskeys FREE 게시글 연결 보정 (V32 하드코딩 오프셋 수정)
-- ============================================================
UPDATE post_whiskeys
SET post_id = post_id + @offset
WHERE post_id BETWEEN 45 AND 69
  AND @offset <> 0;
