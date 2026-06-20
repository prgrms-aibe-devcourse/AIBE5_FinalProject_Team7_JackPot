-- V30: 자유게시판 게시글 카테고리 정정
-- 프론트엔드 PostCategory 타입에 G 추가 및 B 레이블 수정(정보→입문)과 함께 적용

SET NAMES utf8mb4;

UPDATE posts SET category = 'Q' WHERE id = 3;   -- "위스키 입문 어떤 걸로 시작할까요?" F→Q (질문글)
UPDATE posts SET category = 'F' WHERE id = 5;   -- "야마자키 나눔합니다" G→F (자유글, 나눔 공지)
UPDATE posts SET category = 'B' WHERE id = 47;  -- "피트 위스키 입문 로드맵" L→B (입문 가이드)
UPDATE posts SET category = 'Q' WHERE id = 53;  -- "부모님 선물용 위스키 추천해주세요" L→Q (타인에게 추천 요청)
UPDATE posts SET category = 'L' WHERE id = 66;  -- "서울 위스키 바 추천" G→L (추천 게시글)
