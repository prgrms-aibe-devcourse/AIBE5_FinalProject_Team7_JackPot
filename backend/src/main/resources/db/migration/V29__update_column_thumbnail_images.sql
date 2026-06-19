-- V29: 칼럼 게시글 썸네일 이미지 교체 — 콘텐츠 기반 매칭
-- 각 칼럼 내용을 읽고 시각적으로 적합한 Unsplash 이미지로 교체
-- 이미지 출처: Unsplash (unsplash.com/license, 무료 사용 가능)

SET NAMES utf8mb4;

-- ────────────────────────────────────────────────────────────────────────
-- Post 1: 글렌피딕 12년 심층 리뷰 → 글렌피딕 병 사진
-- (V28에서 추가된 HTML img 교체)
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '<img src="https://images\\.unsplash\\.com/[^"]*" alt="">',
  '<img src="https://images.unsplash.com/photo-1746422029200-51af8d27a0da?auto=format&fit=crop&w=800&q=80" alt="">'
) WHERE id = 1;

-- ────────────────────────────────────────────────────────────────────────
-- Post 2: 아드벡 10년, 피트의 정수 → 스코틀랜드 고원/피트보그 풍경
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '<img src="https://images\\.unsplash\\.com/[^"]*" alt="">',
  '<img src="https://images.unsplash.com/photo-1633854678155-7c0756840d27?auto=format&fit=crop&w=800&q=80" alt="">'
) WHERE id = 2;

-- ────────────────────────────────────────────────────────────────────────
-- Post 11: Found North Batch 012 카스크 스트렝스 → 오크통/배럴 숙성
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1608232385022-8ba61bec6c59?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 11;

-- ────────────────────────────────────────────────────────────────────────
-- Post 12: Elijah Craig Barrel Proof → 버번 위스키 병
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1656618380465-5e9342d4874e?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 12;

-- ────────────────────────────────────────────────────────────────────────
-- Post 13: BTAC 전 라인업 → 희귀 위스키 컬렉션
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1601053397261-2552332609fc?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 13;

-- ────────────────────────────────────────────────────────────────────────
-- Post 14: 재패니즈 위스키 시장 진단 → 호박빛 위스키 잔
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1638990742994-c96e4f7617fe?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 14;

-- ────────────────────────────────────────────────────────────────────────
-- Post 15: 셰리의 대성당 Glenfarclas 25년 → 셰리 캐스크/다크 호박빛
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1594844181208-dea2c4cfc0bf?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 15;

-- ────────────────────────────────────────────────────────────────────────
-- Post 16: 버번 암시장의 민낯 → 바에서 주류 따르는 장면
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 16;

-- ────────────────────────────────────────────────────────────────────────
-- Post 17: Ardbeg의 해, 아일레이 → 해안 스코틀랜드 절경
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1720513221463-601783970256?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 17;

-- ────────────────────────────────────────────────────────────────────────
-- Post 18: Weller 형제 대결, 두 버번 비교 → 여러 병 나란히
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1716719215097-a6a640fc3225?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 18;

-- ────────────────────────────────────────────────────────────────────────
-- Post 19: Kilkerran 8yo 캠벨타운 → 등대/스코틀랜드 해안
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1545039776-d36e2b37cd23?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 19;

-- ────────────────────────────────────────────────────────────────────────
-- Post 20: 테이스팅 노트 읽는 법 → 잔 향 맡는 장면
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1529264978834-666a0e99f884?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 20;

-- ────────────────────────────────────────────────────────────────────────
-- Post 21: Maker's Mark 카스크 스트렝스 → 위스키 병과 잔
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1611727513099-f02fc40d63f6?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 21;

-- ────────────────────────────────────────────────────────────────────────
-- Post 22: Four Roses 리미티드 에디션 → 노란 장미
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1470329232586-be87fbad2e0b?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 22;

-- ────────────────────────────────────────────────────────────────────────
-- Post 23: 스코틀랜드 신생 증류소들 → 크래프트 증류소 외관
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1679872995983-b43b26d6d4c8?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 23;

-- ────────────────────────────────────────────────────────────────────────
-- Post 24: 위스키 글라스 완전 가이드 → 글렌케이른 잔 클로즈업
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1700325427500-bf3359cb5215?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 24;

-- ────────────────────────────────────────────────────────────────────────
-- Post 25: 스카치 산지 지도 → 스코틀랜드 지도/고지대
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1779293109184-266e6582de0f?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 25;

-- ────────────────────────────────────────────────────────────────────────
-- Post 26: 위스키 온도와 희석의 과학 → 물방울/투명 잔
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 26;

-- ────────────────────────────────────────────────────────────────────────
-- Post 27: 집에서 바 수준의 하이볼 만들기 → 하이볼 글라스
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1611266353853-d370b67187ed?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 27;

-- ────────────────────────────────────────────────────────────────────────
-- Post 28: 위스키와 음식의 만남 페어링 → 치즈보드+음료
-- ────────────────────────────────────────────────────────────────────────
UPDATE posts SET context = REGEXP_REPLACE(
  context,
  '!\\[\\]\\(https://images\\.unsplash\\.com/[^)]+\\)',
  '![](https://images.unsplash.com/photo-1700760933443-84ef4f5feac4?auto=format&fit=crop&w=800&q=80)'
) WHERE id = 28;
