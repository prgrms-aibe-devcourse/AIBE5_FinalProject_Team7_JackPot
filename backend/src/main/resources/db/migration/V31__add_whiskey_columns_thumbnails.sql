-- V31: whiskey_columns (V15 추가분) thumbnail_url 이미지 추가
-- 각 칼럼 내용을 기반으로 매칭한 Unsplash 이미지
-- 이미지 출처: Unsplash (unsplash.com/license, 무료 사용 가능)

SET NAMES utf8mb4;

-- 위스키 병 경고문 (라벨/병 이미지)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1592620352607-53100d32f9fb?auto=format&fit=crop&w=800&q=80'
WHERE title = '위스키 병에 붙은 그 문구 — 한국 주류 경고문 의무화 논란의 전말';

-- 위스키 음용법 니트·하이볼 (위스키 잔 음용)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1586734565008-fbdbc166fd6c?auto=format&fit=crop&w=800&q=80'
WHERE title = '위스키, 이렇게 마셔야 제맛이다 — 니트부터 하이볼까지 완벽 음용 가이드';

-- Nick Morgan 마스터 블렌더 철학 (전문가 노징)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1598509679459-87f6cd566078?auto=format&fit=crop&w=800&q=80'
WHERE title = '30년 마스터 블렌더가 말하는 위스키 제대로 즐기는 법 — Nick Morgan의 철학';

-- 팟 스틸 vs 컬럼 스틸 (구리 증류기)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1445140463371-d8036feedc2f?auto=format&fit=crop&w=800&q=80'
WHERE title = '팟 스틸 vs 컬럼 스틸 — 증류기 형태가 위스키 맛을 결정하는 방식';

-- 보리에서 싱글 몰트까지 제조 공정 (보리밭)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1656699331253-650907e6990a?auto=format&fit=crop&w=800&q=80'
WHERE title = '보리 한 알이 싱글 몰트가 되기까지 — 스카치 몰트 위스키 완전 제조 공정';

-- 버번 제조 공정 (새 오크통 차링)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1564821480050-273930a88f34?auto=format&fit=crop&w=800&q=80'
WHERE title = '버번은 왜 버번인가 — 미국 법이 규정한 버번의 조건과 제조 공정';

-- 오크통 숙성의 화학 (배럴 창고)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1608232385022-8ba61bec6c59?auto=format&fit=crop&w=800&q=80'
WHERE title = '오크통 안에서 무슨 일이 일어나는가 — 위스키 숙성의 화학';

-- 아이리시 위스키 3번 증류 (아일랜드 녹색 언덕)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1511219096939-ce77f5f44cc8?auto=format&fit=crop&w=800&q=80'
WHERE title = '3번 증류의 나라 — 아이리시 위스키가 가장 부드러운 이유';

-- 재패니즈 위스키 제조법 (히비키 병)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1718881951099-759d473a3dd5?auto=format&fit=crop&w=800&q=80'
WHERE title = '스카치를 배워 스카치를 넘다 — 재패니즈 위스키 제조법의 모든 것';

-- 피트 vs 언피트 (안개 낀 스코틀랜드 해안)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1721324585995-beaa3db23247?auto=format&fit=crop&w=800&q=80'
WHERE title = '피트냐 언피트냐 — 훈연의 과학과 스카치 위스키의 스펙트럼';

-- 피니싱의 예술 (셀러 배럴)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1534655882117-f9eff36a1574?auto=format&fit=crop&w=800&q=80'
WHERE title = '피니싱의 예술 — 두 번째 캐스크가 위스키를 어떻게 바꾸는가';

-- Diageo 글로벌 시장 (진열대 병들)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?auto=format&fit=crop&w=800&q=80'
WHERE title = 'Diageo가 생산을 줄인다 — 글로벌 위스키 시장에 무슨 일이 생긴 것인가';

-- 인도-EU FTA 인도 시장 (향신료 시장)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1668885309844-5bb50f7c2e61?auto=format&fit=crop&w=800&q=80'
WHERE title = '13억 인구 시장의 문이 열린다 — 인도-EU FTA와 위스키 업계의 기대';

-- Macallan 60년산 경매 (럭셔리 위스키)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1696182736807-5d21e38056ec?auto=format&fit=crop&w=800&q=80'
WHERE title = '위스키 한 병에 30억 원 — Macallan 60년산이 세운 경매 기록의 의미';

-- 논알코올 스피릿 트렌드 (목테일)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1609951651556-5334e2706168?auto=format&fit=crop&w=800&q=80'
WHERE title = '알코올 없는 위스키의 시대 — 논알코올 스피릿 트렌드와 그 한계';

-- 기후변화와 위스키 (풍력발전+녹색언덕)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1667926650784-226b0c73de79?auto=format&fit=crop&w=800&q=80'
WHERE title = '기후변화가 위스키를 바꾼다 — 스코틀랜드 증류소들의 위기와 대응';

-- K-위스키 열풍 (서울 야경)
UPDATE whiskey_columns SET thumbnail_url = 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80'
WHERE title = '한국이 위스키를 사랑하기 시작했다 — K-위스키 열풍의 실체와 전망';
