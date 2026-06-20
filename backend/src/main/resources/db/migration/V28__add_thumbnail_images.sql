-- V28: 칼럼/자유게시판 게시글 썸네일 이미지 추가
-- context 앞에 <img src="..."> 삽입 → PostSummaryResponse.extractThumbnail() 자동 추출
-- 이미지 출처: Unsplash (unsplash.com/license, 무료 사용 가능)

SET NAMES utf8mb4;

-- ────────────────────────────────
-- COLUMN 게시글 (이미지 없는 것만)
-- ────────────────────────────────

-- Post 1: 글렌피딕 12년 심층 리뷰
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 1;

-- Post 2: 아드벡 10년, 피트의 정수
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1529264978834-666a0e99f884?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 2;

-- ────────────────────────────────
-- FREE 게시글 (위스키 리뷰/추천 태그된 것)
-- ────────────────────────────────

-- Post 46: 글렌피딕 18년 드디어 개봉 (리뷰)
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1580537922571-ca7180cd700e?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 46;

-- Post 47: 피트 위스키 입문 로드맵
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1557280897-7e94fa33c616?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 47;

-- Post 49: 맥캘란 15년 더블 캐스크
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1717413662498-35bd8638a347?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 49;

-- Post 52: 폴존 피티드 클래식 셀렉트 캐스크
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1615887023544-3a566f29d822?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 52;

-- Post 54: 에버펠디 12년 + 안주 조합
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1583873463426-776e17c904cf?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 54;

-- Post 56: 가성비 위스키 TOP5
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1694643666045-f54d1d7a3bce?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 56;

-- Post 57: 오켄토션 12년 — 로우랜드의 깨끗함이란 이런 것
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1615887625746-f3d2aa27e048?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 57;

-- Post 61: 생일 선물로 로얄 브라클라 21년 받았습니다
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1592620352607-53100d32f9fb?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 61;

-- Post 62: 와인 좋아하는 분께 위스키 추천 — 셰리 캐스크가 답입니다
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1586734565008-fbdbc166fd6c?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 62;

-- Post 64: 글렌모렌지 오리지널 10년
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1571104508999-893933ded431?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 64;

-- Post 67: 맥캘란 12년 더블 캐스크 vs 셰리 오크 비교
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1603596311111-b43c809e02a1?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 67;

-- Post 68: 2026년 상반기 결산 — 올해 마신 위스키 베스트 3
UPDATE posts SET context = CONCAT(
  '<img src="https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?auto=format&fit=crop&w=800&q=80" alt="">',
  context
) WHERE id = 68;
