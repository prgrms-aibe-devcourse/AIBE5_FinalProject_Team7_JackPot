-- whiskey_columns 추가 시드 데이터 17건
-- (경고문/음용법 2 + Nick Morgan 1 + 증류숙성/뉴스 14)
-- NOT EXISTS: 동일 title이 이미 있으면 건너뜀

SET NAMES utf8mb4;

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '위스키 병에 붙은 그 문구 — 한국 주류 경고문 의무화 논란의 전말',
  'https://www.khan.co.kr/economy/economy-general/article/whiskey-warning-label',
  NULL,
  '## 위스키 병에 붙은 그 문구\n\n2023년 말, 국내 위스키 커뮤니티와 수입주류 업계가 술렁였다. 식품의약품안전처가 주류 제품에 한국어 경고 문구 스티커를 의무 부착하도록 한 규정이 본격 시행되면서부터다.\n\n"임신 중 음주는 태아의 건강을 해칩니다", "청소년 음주는 성장과 뇌 발달을 저해합니다", "지나친 음주는 간암, 위암 등을 일으킵니다."\n\n공중 보건의 관점에서 이 경고문은 당연하다. 그런데 왜 논란이 됐을까.\n\n### 문제는 "어떻게"였다\n\n경고문 자체에 반대하는 사람은 많지 않았다. 문제는 적용 방식이었다.\n\n수입 위스키의 경우, 증류소에서 공들여 디자인한 라벨 위에 — 때로는 정면 한가운데에 — 흰 바탕의 경고 스티커가 덕지덕지 붙어야 했다. Glenfiddich의 우아한 사슴 로고 위에, Macallan의 정교한 라벨 위에 붙은 A4 용지 같은 스티커.\n\n수입업체들은 즉각 반발했다. 소비자 커뮤니티에서는 "#스티커_테러"라는 해시태그가 등장했다.\n\n### 해외의 시선\n\n스코틀랜드 위스키 협회(SWA)는 "한국의 규정이 무역 장벽으로 작용할 수 있다"는 우려를 표명했다. 반면 주류 경고문 강화를 지지하는 쪽은 "선진국 대부분이 주류 경고 표기를 강화하는 추세"라고 맞섰다.\n\n### 핵심 쟁점: 방식의 문제\n\n**현행 방식의 문제점**: 기존 라벨 위에 스티커를 덧붙이는 방식은 미관상 좋지 않고, 스티커 제거 시 라벨 손상 문제가 있다.\n\n**대안으로 제시된 방식**: 병 하단 지정 위치 인쇄, QR코드, 병목 태그.\n\n2024년 이후 식약처와 업계 간 협의를 통해 뒷면 하단 부착 방식이 허용되면서 극단적인 사례는 줄었다.\n\n### 소비자가 알아야 할 것\n\n위스키를 사랑하는 소비자로서 우리가 할 수 있는 것은: 경고 문구의 취지를 이해하고, 동시에 더 나은 방식을 위한 목소리를 내는 것이다. 술을 책임감 있게 즐기는 문화를 만드는 것이 결국 규제 논란보다 중요하다.',
  '위스키 병에 붙은 그 문구 한국 주류 경고문 의무화 논란의 전말',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-08-15 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '위스키 병에 붙은 그 문구 — 한국 주류 경고문 의무화 논란의 전말');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '위스키, 이렇게 마셔야 제맛이다 — 니트부터 하이볼까지 완벽 음용 가이드',
  'https://thewhiskeywash.com/whiskey-education/how-to-drink-whiskey/',
  NULL,
  '## 위스키, 이렇게 마셔야 제맛이다\n\n위스키 바에 처음 들어선 순간을 기억하는가. 메뉴판의 낯선 이름들, "어떻게 드시겠어요?"라는 바텐더의 질문 앞에서 멍해지던 그 순간. 니트? 온더록스? 하이볼? 이제는 당당하게 주문할 수 있도록. 위스키 5가지 음용법을 완전히 정복해보자.\n\n### 1. 니트 (Neat) — 위스키 본연의 맛\n\n얼음도, 물도, 믹서도 없이 위스키 그대로 마시는 방법. 실온(18~22℃)에서, 글렌케이른 글라스로. 한 모금 입에 머금고 혀 전체에 퍼뜨린다. 삼키지 말고 5~10초 입 안에 머물게 한다. **추천 위스키**: 프리미엄 싱글 몰트, 고연산 버번.\n\n### 2. 위드 워터 (With Water) — 위스키를 여는 열쇠\n\n소량의 물을 더해 마시는 방법. 특히 카스크 스트렝스(55% 이상)에서 효과가 극적이다. 한 방울부터 시작해 입맛에 맞는 지점을 찾는다. 미네랄이 적은 생수 또는 증류수 사용.\n\n### 3. 온더록스 (On the Rocks) — 시원함과 풍미의 타협\n\n큰 얼음(빅 아이스)을 사용할수록 희석이 느리다. 버번, 블렌디드 스카치에 어울린다.\n\n### 4. 하이볼 (Highball) — 대중과 함께한 위스키의 변신\n\n위스키 1 : 탄산수 3~4. 강탄산 사용, 잔 벽을 타고 천천히 붓는다. 재패니즈 위스키, 아이리시, 블렌디드 스카치에 최적.\n\n### 5. 칵테일\n\n올드 패션드(버번 + 각설탕 + 비터스), 위스키 사워(버번 + 레몬즙 + 설탕), 핫 토디(위스키 + 뜨거운 물 + 꿀).\n\n**결론**: 위스키를 마시는 정답은 없다. 중요한 것은 천천히, 즐겁게.',
  '위스키, 이렇게 마셔야 제맛이다 니트부터 하이볼까지 완벽 음용 가이드',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-09-01 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '위스키, 이렇게 마셔야 제맛이다 — 니트부터 하이볼까지 완벽 음용 가이드');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '30년 마스터 블렌더가 말하는 위스키 제대로 즐기는 법 — Nick Morgan의 철학',
  'https://www.youtube.com/results?search_query=nick+morgan+whisky+how+to+enjoy',
  NULL,
  '## 30년 마스터 블렌더가 말하는 위스키 제대로 즐기는 법\n\nNick Morgan. Diageo에서 30년 넘게 Johnnie Walker를 총괄한 마스터 블렌더.\n\n> *"위스키를 즐기는 데 틀린 방법은 없습니다. 규칙을 강요하는 순간, 우리는 사람들로부터 위스키를 빼앗는 것입니다."*\n\n### 첫 번째 가르침: 잔을 내려놓고 먼저 관찰하라\n\n위스키를 잔에 따른 뒤 1~2분을 기다린다. 색을 보고, 점도를 본다. *"위스키는 마시기 전부터 이미 이야기를 시작하고 있습니다."*\n\n### 두 번째 가르침: 코는 두 번, 방식을 달리하라\n\n첫 번째 노징은 10cm 거리에서 입을 벌리고, 두 번째는 3~5cm에서 코로만. *"향을 이름 붙이려 하지 말라"* — 감각적 경험에 집중.\n\n### 세 번째 가르침: 첫 모금은 "인사"다\n\n첫 모금의 역할은 입 안을 적응시키는 것. 두 번째 모금부터 진짜 맛이 열린다.\n\n### 네 번째 가르침: 물은 적이 아니라 열쇠다\n\n*"위스키에 물을 넣지 말라는 사람이 있다면, 그 사람은 위스키를 모르는 것입니다."* 스포이드로 한 방울씩 추가하며 변화를 관찰.\n\n### 다섯 번째 가르침: 피니시에서 위스키의 진심을 읽어라\n\n*"좋은 위스키는 삼킨 후에 시작됩니다."* 길이보다 진화하는 피니시가 중요.\n\n### 여섯 번째 가르침: 혼자 마시지 말고, 기록하라\n\n함께 마시고, 간단하게라도 기록한다. 기억이 쌓이면 자신만의 위스키 지도가 완성된다.',
  '30년 마스터 블렌더가 말하는 위스키 제대로 즐기는 법 Nick Morgan의 철학',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-10-01 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '30년 마스터 블렌더가 말하는 위스키 제대로 즐기는 법 — Nick Morgan의 철학');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '팟 스틸 vs 컬럼 스틸 — 증류기 형태가 위스키 맛을 결정하는 방식',
  'https://thewhiskeywash.com/whiskey-education/pot-still-vs-column-still/',
  NULL,
  '## 팟 스틸 vs 컬럼 스틸\n\n위스키 증류의 역사는 두 가지 길로 나뉜다. 수백 년 된 전통 방식인 팟 스틸(Pot Still)과, 19세기 산업혁명이 낳은 컬럼 스틸(Column Still).\n\n### 팟 스틸 (Pot Still) — 전통의 구리 항아리\n\n배치(Batch) 방식. 발효된 워시를 가열해 2~3회 반복 증류. 증류기의 목 길이와 모양이 스피릿 캐릭터를 결정한다. 복잡하고 개성 있는 풍미. 싱글 몰트 스카치, 아이리시 팟 스틸 위스키의 방식.\n\n### 컬럼 스틸 (Column Still / Coffey Still) — 산업혁명의 산물\n\n1831년 아이니아스 코피가 특허. 연속(Continuous) 방식으로 멈추지 않고 대량 생산 가능. 95% 이상 고도수 스피릿 생산, 대부분의 풍미 화합물 제거. 그레인 위스키, 버번의 방식.\n\n### 하이브리드 접근: 블렌딩의 예술\n\n블렌디드 스카치(Johnnie Walker, Chivas Regal)는 팟 스틸 몰트 위스키와 컬럼 스틸 그레인 위스키를 블렌딩. 복잡성(몰트)과 접근성(그레인)의 최적 조합.\n\n**결론**: 팟 스틸은 "개성"을, 컬럼 스틸은 "효율"을 추구한다. 어느 쪽이 더 낫다는 없다 — 목적이 다를 뿐이다.',
  '팟 스틸 vs 컬럼 스틸 증류기 형태가 위스키 맛을 결정하는 방식',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-10-05 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '팟 스틸 vs 컬럼 스틸 — 증류기 형태가 위스키 맛을 결정하는 방식');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '보리 한 알이 싱글 몰트가 되기까지 — 스카치 몰트 위스키 완전 제조 공정',
  'https://thewhiskeywash.com/whiskey-education/how-scotch-malt-whisky-is-made/',
  NULL,
  '## 보리 한 알이 싱글 몰트가 되기까지\n\n스카치 몰트 위스키의 원료는 단 세 가지다 — 보리(malted barley), 물, 효모.\n\n**STEP 1. 맥아화 (Malting)**: 보리를 발아시키고 건조. 피트를 태우면 훈연향이 흡수됨 (Ardbeg 54ppm, Laphroaig 45ppm).\n\n**STEP 2. 분쇄 (Milling)**: 맥아를 분쇄해 거스(grist) 생성.\n\n**STEP 3. 당화 (Mashing)**: 뜨거운 물로 전분을 당분으로 전환 → 워트(wort).\n\n**STEP 4. 발효 (Fermentation)**: 효모 첨가, 48~120시간. 긴 발효일수록 과실향·꽃향기 증가. 최종 알코올 7~9%의 워시.\n\n**STEP 5. 증류 (Distillation)**: 팟 스틸로 2회 증류. 증류사가 헤즈·하트·테일즈를 컷팅. 하트만 숙성 캐스크에.\n\n**STEP 6. 숙성 (Maturation)**: 최소 3년. 버번 캐스크(바닐라·카라멜), 셰리 캐스크(건과일·초콜릿). 연간 1~2% 천사의 몫 증발.\n\n**STEP 7. 병입 (Bottling)**: 도수 조정, 냉각 여과 여부, 색소 첨가 여부 결정.\n\n**결론**: 같은 보리, 같은 물로 시작해도 증류소마다 전혀 다른 위스키가 나오는 이유가 각 단계의 선택에 있다.',
  '보리 한 알이 싱글 몰트가 되기까지 스카치 몰트 위스키 완전 제조 공정',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-10-10 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '보리 한 알이 싱글 몰트가 되기까지 — 스카치 몰트 위스키 완전 제조 공정');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '버번은 왜 버번인가 — 미국 법이 규정한 버번의 조건과 제조 공정',
  'https://bourbonculture.com/how-bourbon-is-made/',
  NULL,
  '## 버번은 왜 버번인가\n\n버번이 되기 위해서는 엄격한 법적 기준을 충족해야 한다.\n\n### 버번의 법적 정의 (미국 연방법 27 CFR 5.22)\n\n① 미국산 ② 옥수수 51% 이상 매시빌 ③ 새 오크통(New Charred Oak) 숙성 ④ 125 proof(62.5%) 이하 증류 ⑤ 80 proof(40%) 이상 병입.\n\n### 매시빌 스타일\n\n- **하이 라이(High Rye)**: 스파이시·드라이 (Wild Turkey, Bulleit)\n- **위트(Wheated)**: 부드럽고 달콤 (Maker\'s Mark, Pappy)\n\n### 차링 (Charring)\n\n새 오크통 내부를 불꽃으로 태움. 레벨 #1~#4. #3이 바닐라·카라멜 극대화. #4(알리게이터)는 두꺼운 탄화층으로 스모키·초콜릿.\n\n### 사워 매싱 (Sour Mashing)\n\n이전 발효 슬러리를 새 매시에 15~25% 첨가. pH 안정화 + 배치 간 일관성.\n\n### 켄터키가 성지인 이유\n\n석회암 물(철분 제거·칼슘 풍부) + 극단적 기후(여름 고온·겨울 혹한 → 숙성 가속화).\n\n**결론**: 버번의 법적 기준 하나하나는 단순한 규정이 아니라 그 맛을 만드는 레시피다.',
  '버번은 왜 버번인가 미국 법이 규정한 버번의 조건과 제조 공정',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-10-15 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '버번은 왜 버번인가 — 미국 법이 규정한 버번의 조건과 제조 공정');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '오크통 안에서 무슨 일이 일어나는가 — 위스키 숙성의 화학',
  'https://thewhiskeywash.com/whiskey-education/whiskey-aging-science/',
  NULL,
  '## 오크통 안에서 무슨 일이 일어나는가\n\n뉴메이크 스피릿은 투명하고 거칠다. 오크통에서 수십 년을 보내고 나오면 완전히 다른 생명체가 되어 있다.\n\n### 숙성 중 일어나는 4가지 핵심 반응\n\n**① 추출 (Extraction)**: 리그닌(바닐린·시링알데히드), 헤미셀룰로스(카라멜·토피), 탄닌, 오크 락톤(코코넛·바닐라) 용해.\n\n**② 산화 (Oxidation)**: 산소가 미세 기공으로 유입 → 알데히드를 산으로 전환, 에스터 형성 촉진, 황 화합물 제거.\n\n**③ 에스터화 (Esterification)**: 알코올 + 산 → 에스터(과실향). 에틸 아세테이트(사과·배), 에틸 카프로에이트(열대 과일).\n\n**④ 증발 (Evaporation)**: 연간 1~3% "천사의 몫(Angel\'s Share)".\n\n### 캐스크 종류별 풍미\n\n퍼스트필 버번(바닐라·코코넛), 올로로소 셰리(건포도·초콜릿·너트), PX 셰리(꿀·건무화과), 포트(자두·붉은 과실), 소테른(꿀·복숭아).\n\n### 숙성 연수 = 품질? 이 공식이 틀린 이유\n\n과숙성은 탄닌 과다 추출로 쓰고 떫어진다. 켄터키 버번 10년 = 스코틀랜드 싱글 몰트 20년 수준의 오크 영향. 숫자보다 캐스크 컨디션·기후·증류사의 판단이 중요하다.',
  '오크통 안에서 무슨 일이 일어나는가 위스키 숙성의 화학',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-10-20 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '오크통 안에서 무슨 일이 일어나는가 — 위스키 숙성의 화학');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '3번 증류의 나라 — 아이리시 위스키가 가장 부드러운 이유',
  'https://thewhiskeywash.com/whiskey-education/how-irish-whiskey-is-made/',
  NULL,
  '## 3번 증류의 나라\n\n아이리시 위스키는 세상에서 가장 마시기 쉬운 위스키로 불린다. 그 비결은 3회 증류에 있다.\n\n### 3가지 아이리시 위스키 스타일\n\n**① 싱글 팟 스틸**: 아이리시만의 독창적 카테고리. 맥아 보리 + 미맥아 보리 혼합. 19세기 영국 맥아세 회피에서 탄생. "스파이시하면서 크리미한" 캐릭터. Redbreast, Green Spot.\n\n**② 싱글 몰트**: 100% 맥아 보리, 3회 증류.\n\n**③ 블렌디드**: Jameson, Tullamore D.E.W., Bushmills.\n\n### 3회 증류의 효과\n\n매 증류마다 무거운 화합물 제거 → 가볍고 깨끗한 스피릿. 부드럽고 날카로운 화합물 없음. 단, 복잡성 감소가 단점.\n\n### 아이리시 르네상스\n\n2024년 현재 아일랜드 전역 40개 이상 증류소 가동 중. 전통적 3회 증류에서 벗어나 2회 증류, 피티드 보리, 다양한 캐스크 피니싱 실험 중.\n\n**추천 입문 순서**: Jameson → Redbreast 12 → Yellow Spot → Midleton Very Rare',
  '3번 증류의 나라 아이리시 위스키가 가장 부드러운 이유',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-10-25 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '3번 증류의 나라 — 아이리시 위스키가 가장 부드러운 이유');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '스카치를 배워 스카치를 넘다 — 재패니즈 위스키 제조법의 모든 것',
  'https://thewhiskeywash.com/whiskey-education/how-japanese-whisky-is-made/',
  NULL,
  '## 스카치를 배워 스카치를 넘다\n\n1918년 마사타카 다케쓰루가 스코틀랜드에서 배워온 기술로 닛카(Nikka) 위스키가 시작됐다. 100년이 지난 지금 재패니즈 위스키는 독립적인 세계를 구축했다.\n\n### 재패니즈 위스키만의 독창성\n\n**① 미즈나라 오크 (Mizunara Oak)**: 일본 토종 참나무. 백단향, 코코넛, 향 연기. 15년 이상 숙성 후 진가 발휘.\n\n**② 자사 블렌딩**: 타사 원액 구매 없이 증류소 내 다양한 스타일 자체 블렌딩. 야마자키 내 10종류 이상 팟 스틸 보유.\n\n**③ 모노즈쿠리 정신**: 발효 온도, 증류 속도, 컷 포인트의 미세한 조정. 섬세하고 균형 잡힌 캐릭터.\n\n**④ 다양한 캐스크**: 버번·셰리·미즈나라·와인·우메슈 캐스크까지 활용.\n\n### 법적 기준 논란\n\n2021년까지 법적 정의 없음 → 수입 원액 병입도 "Japanese Whisky" 표기 가능. 2021년 JSA 자율 규정 발표. 라벨에 "Distilled and Bottled in Japan" 명시 제품 선택 권장.\n\n**추천 입문 순서**: Suntory Toki → Nikka From the Barrel → Yamazaki 12',
  '스카치를 배워 스카치를 넘다 재패니즈 위스키 제조법의 모든 것',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-11-01 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '스카치를 배워 스카치를 넘다 — 재패니즈 위스키 제조법의 모든 것');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '피트냐 언피트냐 — 훈연의 과학과 스카치 위스키의 스펙트럼',
  'https://thewhiskeywash.com/whiskey-education/peated-vs-unpeated-whisky/',
  NULL,
  '## 피트냐 언피트냐\n\n아일레이 위스키를 처음 마신 사람들의 반응은 항상 극단적이다. 혐오하거나, 완전히 빠지거나.\n\n### 피트란 무엇인가\n\n수천 년 축적된 부분 분해된 식물 유기물. 피트를 태울 때 페놀 화합물이 맥아 건조 중 보리에 흡수 → 훈연향. 지역마다 성분이 다르다: 아일레이(해초·아이오딘), 하이랜드(허브), 오크니(히스·마일드).\n\n### 피트 스펙트럼 (ppm)\n\n- 언피티드 (0~5): Glenlivet, Glenfiddich\n- 라이틀리 피티드 (5~15): Highland Park 12\n- 미디엄 (15~30): Bowmore 12\n- 헤비 피티드 (30~50): Laphroaig, Ardbeg\n- 수퍼 헤비 (50+): Octomore (최대 309ppm)\n\n### 피트 위스키 입문 로드맵\n\n1. Highland Park 12 → 2. Bowmore 12 → 3. Ardbeg 10 → 4. Laphroaig 10 → 5. Octomore\n\n**결론**: 강렬함 뒤에 숨겨진 복잡성이 중독성이 있다. 한번 그 세계에 발을 들이면 헤어나오기 어렵다.',
  '피트냐 언피트냐 훈연의 과학과 스카치 위스키의 스펙트럼',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-11-05 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '피트냐 언피트냐 — 훈연의 과학과 스카치 위스키의 스펙트럼');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '피니싱의 예술 — 두 번째 캐스크가 위스키를 어떻게 바꾸는가',
  'https://thewhiskeywash.com/whiskey-education/whiskey-cask-finishing/',
  NULL,
  '## 피니싱의 예술\n\nGlenmorangie Nectar D\'Or — 버번 캐스크 숙성 후 소테른 와인 캐스크에서 추가 숙성. 꿀, 복숭아, 살구의 풍미가 겹쳐진 위스키.\n\n### 피니싱의 역사\n\n1980~90년대 Glenmorangie가 개척. 지금은 거의 모든 증류소가 채택.\n\n### 주요 피니싱 캐스크\n\n- **올로로소 셰리**: 건포도·초콜릿·호두 (가장 널리 사용)\n- **PX 셰리**: 꿀·건무화과·건자두 (극도로 달콤)\n- **포트**: 루비(붉은 과실), 타우니(견과류·카라멜)\n- **소테른**: 꿀·복숭아·살구 (Glenmorangie Nectar D\'Or)\n- **STR 캐스크**: 사용된 와인 캐스크를 깎고 토스팅·재차링 (Kavalan)\n\n### 피니싱의 과학\n\n이전 캐스크의 와인·셰리 성분과 반응, 새 오크 표면과 재상호작용, 추가 산화. 기간이 너무 짧으면 표면적 풍미만, 너무 길면 원래 개성이 묻힘.\n\n**추천**: Glenmorangie Nectar D\'Or, Balvenie PortWood 21, Dalmore Cigar Malt',
  '피니싱의 예술 두 번째 캐스크가 위스키를 어떻게 바꾸는가',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-11-10 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '피니싱의 예술 — 두 번째 캐스크가 위스키를 어떻게 바꾸는가');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  'Diageo가 생산을 줄인다 — 글로벌 위스키 시장에 무슨 일이 생긴 것인가',
  'https://www.bbc.com/news/articles/diageo-production-cut-2024',
  NULL,
  '## Diageo가 생산을 줄인다\n\n2024년 초, 세계 최대 주류 기업 Diageo가 스카치 위스키 생산 감축을 발표했다.\n\n### 팬데믹 호황의 후폭풍\n\n2020~2022년 홈 음주 폭발 → 증류소들이 앞다투어 생산 증가. 그러나 팬데믹 종료 후 외식 증가·인플레이션으로 소비 패턴 변화. 결과: 과잉 재고 + 수요 둔화의 더블 펀치.\n\n### 글로벌 수요 지형의 변화\n\n- **미국 시장 포화**: 신규 버번·스카치 브랜드 폭발로 경쟁 치열\n- **중국 시장 침체**: 경기 둔화 + 반부패 캠페인으로 프리미엄 주류 위축\n- **인도의 부상**: 급성장 중이나 높은 관세 장벽 여전\n\n### 소비자에게 미치는 영향\n\n**단기**: 재고 과잉으로 가격 안정 또는 하락. 세컨더리 시장 버블 일부 소멸.\n\n**중장기**: 생산 감축이 장기화되면 공급 감소로 가격 상승 압력.\n\n**컬렉터 관점**: 지금이 적절한 가격에 좋은 위스키를 구할 수 있는 기회일 수 있다.',
  'Diageo가 생산을 줄인다 글로벌 위스키 시장에 무슨 일이 생긴 것인가',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-08-20 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = 'Diageo가 생산을 줄인다 — 글로벌 위스키 시장에 무슨 일이 생긴 것인가');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '13억 인구 시장의 문이 열린다 — 인도-EU FTA와 위스키 업계의 기대',
  'https://scotchwhisky.com/magazine/latest-news/india-eu-fta-whisky/',
  NULL,
  '## 13억 인구 시장의 문이 열린다\n\n인도는 세계에서 위스키를 가장 많이 소비하는 나라. 연간 2억 케이스 이상. 그러나 스카치는 150% 관세 장벽으로 고전 중.\n\n### FTA가 바꿀 풍경\n\n2024년 EU-인도 FTA 협상에서 위스키 관세 인하가 핵심 의제. 타결 시:\n- 프리미엄 스카치·아이리시 가격 하락\n- 인도 중산층 소비자 진입\n- 수입 위스키 점유율 1% → 5~10% 도약 가능\n\n### 인도 위스키 문화의 특수성\n\n믹서 문화, 단맛 선호, 사회적 음주. 단순히 관세만 낮춘다고 팔리는 게 아니라 취향에 맞는 마케팅 필요.\n\n### 인도 토종 위스키의 반격\n\nAmrut, Paul John이 국제 품평회에서 스카치에 견줄 품질 입증. 극단적 기후가 숙성 가속화 — 3~4년으로도 풍부한 오크 캐릭터.\n\n**한국 소비자에게**: Amrut Fusion, Paul John Classic은 뛰어난 가성비의 싱글 몰트.',
  '13억 인구 시장의 문이 열린다 인도EU FTA와 위스키 업계의 기대',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-09-10 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '13억 인구 시장의 문이 열린다 — 인도-EU FTA와 위스키 업계의 기대');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '위스키 한 병에 30억 원 — Macallan 60년산이 세운 경매 기록의 의미',
  'https://scotchwhisky.com/magazine/latest-news/macallan-60-year-auction/',
  NULL,
  '## 위스키 한 병에 30억 원\n\n2023년 11월 소더비 경매. Macallan 1926, 60년 숙성. 최종 낙찰가 £2,187,500 — 한화 약 38억 원. 위스키 단일 병 경매 세계 최고가.\n\n### Macallan 1926이란\n\n1926년 증류, 60년 셰리 오크통 숙성, 1986년 총 40병 병입. 팝 아트 작가 Peter Blake와 Valerio Adami가 라벨 디자인. 현재 시장에 유통되는 것은 극히 드물다.\n\n### 이 가격이 정당한가\n\n**정당하다**: 더 이상 만들 수 없는 유일한 빈티지, 60년 역사적 가치, 예술품으로서의 가치.\n\n**회의적**: 과연 마실까 아니면 보관할까, 위스키 본질(마시는 것)과 동떨어진 투기.\n\n### 한국 시장의 시각\n\n아시아 — 홍콩, 싱가포르, 한국 — 컬렉터들이 글로벌 희귀 위스키 경매의 주요 구매자로 부상 중. 한국의 고가 위스키 관심도 함께 상승.\n\n**결론**: 진정한 위스키의 가치는 손에 쥔 잔 안에 있다. 오늘 밤 5만 원짜리 싱글 몰트를 천천히 음미하는 것이 38억 원짜리보다 더 풍요로운 경험일 수 있다.',
  '위스키 한 병에 30억 원 Macallan 60년산이 세운 경매 기록의 의미',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-07-15 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '위스키 한 병에 30억 원 — Macallan 60년산이 세운 경매 기록의 의미');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '알코올 없는 위스키의 시대 — 논알코올 스피릿 트렌드와 그 한계',
  'https://thewhiskeywash.com/whiskey-news/non-alcoholic-whisky-alternatives-2024/',
  NULL,
  '## 알코올 없는 위스키의 시대\n\n"Dry January" 캠페인이 만든 거대한 시장 — 논알코올 스피릿.\n\n### 논알코올 위스키의 현황\n\nLyre\'s American Malt, CleanCo Clean Whisky, Spiritless Kentucky 74. 식물성 추출물·에센셜 오일 조합, 향미 증류, 연기향·오크향·색소 조합으로 제조.\n\n### 솔직한 평가\n\n**한계**: 알코올은 단순한 향 운반체가 아니다. 에탄올 자체가 텍스처와 바디감에 필수적. 오크 숙성의 수천 가지 화합물을 단순 혼합으로 재현 불가. "위스키 같은 맛"은 낼 수 있지만 "위스키의 맛"은 아님.\n\n**존재 이유**: 임신 중·투약 중·금주 중인 사람들의 사회적 참여 지원. 건강한 라이프스타일 추구자의 선택지.\n\n### 한국 시장\n\n2022년 이후 편의점 논알코올 맥주 주류화. 위스키 카테고리는 초기 단계지만 모크테일 메뉴 빠르게 증가.\n\n**결론**: 논알코올 위스키는 위스키를 대체하지 않는다. 하지만 "알코올을 마시지 않지만 그 문화를 즐기고 싶은" 사람들에게 의미 있는 선택지다.',
  '알코올 없는 위스키의 시대 논알코올 스피릿 트렌드와 그 한계',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-09-20 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '알코올 없는 위스키의 시대 — 논알코올 스피릿 트렌드와 그 한계');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '기후변화가 위스키를 바꾼다 — 스코틀랜드 증류소들의 위기와 대응',
  'https://scotchwhisky.com/magazine/features/climate-change-impact-scotch-whisky/',
  NULL,
  '## 기후변화가 위스키를 바꾼다\n\n스카치 위스키는 스코틀랜드의 기후와 떼려야 뗄 수 없다. 그런데 이 모든 것이 변하고 있다.\n\n### 보리: 원료의 위기\n\n스코틀랜드 여름 기온 50년간 약 1.5℃ 상승. 2023년 폭염으로 보리 수확량 20~30% 감소. 기후에 강한 보리 품종 연구 진행 중.\n\n### 물: 증류소의 생명선\n\n위스키 1리터 생산에 수십 리터의 물 필요. 여름 가뭄 잦아지면서 일부 증류소 생산 일시 중단 사례 발생.\n\n### 피트: 사라지는 자원\n\n현재 속도로 채취하면 일부 지역 수십 년 내 고갈 가능. 일부 아일레이 증류소들이 피트 사용량 감축 또는 대체 자원 연구 중.\n\n### 탄소 중립 선언\n\nSWA: 2040년까지 탄소 중립 목표. Glenfiddich(바이오 가스 100%), Bruichladdich(재생 에너지 전환 완료), Glenmorangie(증류 열 재사용) 등.\n\n**결론**: 기후 행동이 선택이 아닌 필수다. 우리가 지금 마시는 위스키의 맛이 미래에도 이어지려면.',
  '기후변화가 위스키를 바꾼다 스코틀랜드 증류소들의 위기와 대응',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-10-01 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '기후변화가 위스키를 바꾼다 — 스코틀랜드 증류소들의 위기와 대응');

INSERT INTO whiskey_columns
  (source_type, title, url, thumbnail_url, description, whiskey_keyword, author, source_name, published_at, created_at)
SELECT * FROM (SELECT
  'BLOG',
  '한국이 위스키를 사랑하기 시작했다 — K-위스키 열풍의 실체와 전망',
  'https://thewhiskeywash.com/whiskey-news/korea-whisky-market-growth-2024/',
  NULL,
  '## 한국이 위스키를 사랑하기 시작했다\n\n2018년 스카치 수입 약 2,000만 달러 → 2023년 7,000만 달러 돌파. 5년 만에 3배 이상 성장.\n\n### 한국 위스키 열풍의 3가지 원동력\n\n**① 하이볼의 대중화**: 2021~2022년 편의점 하이볼 RTD 대박. MZ세대가 위스키 기반 음료를 일상적으로 접함.\n\n**② MZ세대의 취향 변화**: 가심비 중시, 스토리 있는 위스키 선택. SNS에서 위스키가 라이프스타일 콘텐츠로 부상.\n\n**③ 위스키 바 문화 폭발**: 서울 이태원·성수·한남동에 2,000종 이상 보유 고급 위스키 바 등장.\n\n### 한국 소비자의 특성\n\n높은 학습 속도(커뮤니티·유튜브), 희귀 위스키에 높은 관심, 가성비 중시·세컨더리 거품 저항감.\n\n### 한국 로컬 위스키의 태동\n\n쓰리소사이어티스, 기원 등 신생 한국 위스키 브랜드 등장. 아직 숙성 부족하지만 미래 기대.\n\n**전망**: 구조적 변화. 위스키 문화가 뿌리내리는 과정을 놀랍도록 빠르게 밟아가고 있다.',
  '한국이 위스키를 사랑하기 시작했다 K위스키 열풍의 실체와 전망',
  'AI 칼럼니스트', 'WhiskeyNote 칼럼',
  '2024-11-15 10:00:00', NOW()) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM whiskey_columns WHERE title = '한국이 위스키를 사랑하기 시작했다 — K-위스키 열풍의 실체와 전망');
