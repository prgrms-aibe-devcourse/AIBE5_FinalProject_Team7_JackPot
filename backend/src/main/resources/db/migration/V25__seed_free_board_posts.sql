-- 자유게시판 시드 데이터
-- 데모 유저 7명 (ID 100~106) + 자유게시판 게시글 25건
-- author_id는 posts 테이블이 FK 없이 Long으로만 저장하므로 유저가 없어도 무방하나
-- 프로필 조회 연동을 위해 유저도 함께 삽입 (INSERT IGNORE)
--
-- 유저 닉네임 중복 방지: 이미 동일 nickname이 있으면 건너뜀

SET NAMES utf8mb4;

-- ============================================================
-- 1. 데모 유저 삽입 (ID 100~106, GOOGLE 소셜 가입으로 처리)
-- ============================================================

INSERT IGNORE INTO users
  (id, email, password_hash, auth_provider, provider_id, nickname, birthday,
   role, is_new_user, is_email_verified, is_deleted, is_banned, created_at, updated_at)
VALUES
  (100, 'demo_minjun@example.com',   NULL, 'GOOGLE', 'demo_google_100', '위스키입문중',   '1999-03-12', 'USER', false, true, false, false, '2026-02-10 11:00:00', '2026-02-10 11:00:00'),
  (101, 'demo_seoyeon@example.com',  NULL, 'GOOGLE', 'demo_google_101', '피트마니아',     '1992-07-25', 'USER', false, true, false, false, '2026-01-05 09:30:00', '2026-01-05 09:30:00'),
  (102, 'demo_junhyuk@example.com',  NULL, 'GOOGLE', 'demo_google_102', '셰리러버',       '1988-11-04', 'USER', false, true, false, false, '2026-01-18 14:20:00', '2026-01-18 14:20:00'),
  (103, 'demo_yujin@example.com',    NULL, 'GOOGLE', 'demo_google_103', '버번바',         '1995-05-30', 'USER', false, true, false, false, '2026-02-22 19:45:00', '2026-02-22 19:45:00'),
  (104, 'demo_haeun@example.com',    NULL, 'GOOGLE', 'demo_google_104', '위스키소믈리에', '1985-09-17', 'USER', false, true, false, false, '2026-01-02 08:00:00', '2026-01-02 08:00:00'),
  (105, 'demo_minho@example.com',    NULL, 'GOOGLE', 'demo_google_105', '홈바마스터',     '1990-01-22', 'USER', false, true, false, false, '2026-02-01 16:10:00', '2026-02-01 16:10:00'),
  (106, 'demo_soyoung@example.com',  NULL, 'GOOGLE', 'demo_google_106', '위스키랜덤샷',   '1997-08-09', 'USER', false, true, false, false, '2026-03-03 21:00:00', '2026-03-03 21:00:00');

-- ============================================================
-- 2. 자유게시판 게시글 삽입 (INSERT IGNORE, 중복 방지)
-- ============================================================

-- 1. 입문자 첫 위스키 추천 요청
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (100, 'FREE', 'B',
'위스키 처음 시작하는데 뭐부터 마셔야 할까요?',
'<p>안녕하세요 ! 주변 친구가 위스키 권유해서 관심 갖게 된 사회초년생입니다 🙋</p>
<p>소주, 맥주 정도만 마셔봤고 위스키는 향이 너무 강할 것 같아서 겁먹고 있었는데, 이번에 용기내서 도전해보려 해요.</p>
<p>처음엔 어떤 위스키가 접근하기 좋을까요? 글렌피딕 같은 스카치 싱글몰트부터 시작하는 게 맞는지, 아니면 버번이 더 쉽게 마실 수 있는지 궁금합니다.</p>
<p>예산은 한 병에 5~7만 원 정도 생각하고 있어요. 추천 부탁드립니다! 🥃</p>',
12, 87, false, '2026-04-02 13:21:00', '2026-04-02 13:21:00');

-- 2. 글렌피딕 18년 리뷰
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (102, 'FREE', 'R',
'글렌피딕 18년 드디어 개봉했습니다 — 솔직 후기',
'<p>오랫동안 위시리스트에 담아두었던 <strong>글렌피딕 18년</strong>을 주말에 드디어 열었습니다.</p>
<p><strong>첫인상:</strong> 잔에 따르자마자 올라오는 오크와 건포도 향이 정말 인상적이었어요. 피트감은 거의 없고 셰리 캐스크 특유의 과일향이 지배적입니다.</p>
<p><strong>맛:</strong> 부드럽고 달콤한 시작, 중반부에 건자두 같은 진한 과일 맛, 피니시는 꽤 길게 남아요. 스파이시한 끝맛도 살짝 있어서 밋밋하지 않습니다.</p>
<p><strong>총평:</strong> 입문용으로 추천하기엔 가격이 좀 있지만, 셰리 스타일 좋아하시는 분께는 강력 추천입니다. 다음 번엔 18년 트리플 캐스크도 도전해볼 예정 😊</p>',
24, 163, false, '2026-04-05 20:10:00', '2026-04-05 20:10:00');

-- 3. 피트 위스키 입문 추천
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (101, 'FREE', 'L',
'피트 위스키 입문 로드맵 — 순서대로 마셔보세요',
'<p>피트 위스키 처음 도전하시는 분들이 많이 계시더라고요. 제가 4년간 마셔온 경험을 바탕으로 추천 순서를 정리해봤습니다.</p>
<ol>
  <li><strong>보모어 12년</strong> — 아일라 입문의 교과서. 피트하지만 바닷바람과 과일향이 균형 잡혀있어요.</li>
  <li><strong>라가불린 16년</strong> — 강렬하지만 묵직한 피트. 아일라 위스키의 정수라고 봐요.</li>
  <li><strong>폴존 피티드</strong> — 최근 국내에서 많이 화제가 된 아이리시 피트. 55% 캐스크 스트렝스라 물 한 방울 더해서 마시면 딱 좋아요.</li>
  <li><strong>아드벡 10년</strong> — 아일라 삼대장 중 하나. 퀴퀴한 약품향 느껴지면 아일라 중독의 시작입니다 😄</li>
</ol>
<p>피트 위스키 처음엔 낯설어도 3번 이상 마시면 빠져나올 수 없어요. 경고합니다 🔥</p>',
31, 218, false, '2026-04-08 18:45:00', '2026-04-08 18:45:00');

-- 4. 홈바 셋업 후기
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (105, 'FREE', 'F',
'드디어 홈바 셋업 완료 🥃 비용 및 구성 공유합니다',
'<p>2년간 모은 위스키들을 드디어 제대로 전시할 수 있게 됐습니다. 인테리어 좋아하시는 분들께 도움이 될까 하여 공유해요!</p>
<h3>현재 구성</h3>
<ul>
  <li>오픈 선반 (파인 목재 DIY) — 약 8만 원</li>
  <li>위스키 잔 6종 세트 — 글렌케언, 스누터, 튤립, 하이볼, 올드패션드, 노징 글라스</li>
  <li>비트 냉장고 (와인셀러) — 온도·습도 관리용, 중고로 15만 원</li>
  <li>현재 병 수: 14병 (스카치 9, 버번 3, 일본산 2)</li>
</ul>
<h3>운영 팁</h3>
<p>위스키는 직사광선 피하고 서늘한 곳에 세워서 보관하세요. 개봉 후엔 공기 접촉 최소화를 위해 내용물이 절반 이하로 줄었을 때 작은 병에 옮겨담는 것도 좋은 방법입니다.</p>
<p>다음 목표는 아드벡 위비스티 진열 🙌</p>',
19, 141, false, '2026-04-12 15:30:00', '2026-04-12 15:30:00');

-- 5. 맥캘란 15년 더블 캐스크 리뷰
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (104, 'FREE', 'R',
'맥캘란 15년 더블 캐스크 — 명성만큼 할까요?',
'<p>맥캘란을 처음 접하는 분들이 가장 많이 고르는 <strong>맥캘란 15년 더블 캐스크</strong>를 테이스팅했습니다.</p>
<p><strong>색상:</strong> 짙은 호박색. 유럽산 셰리 오크와 아메리칸 오크를 함께 사용한 더블 캐스크 숙성 덕분입니다.</p>
<p><strong>향:</strong> 열자마자 건포도, 오렌지 껍질, 바닐라가 풍성하게 올라와요. 약간의 생강 스파이스도 있습니다.</p>
<p><strong>맛:</strong> 달콤하고 풍부하며 잘 익은 과일 향이 가득. 오크와 다크 초콜릿이 어우러진 복잡한 미드 팔레트. 피니시는 비교적 짧은 편이에요.</p>
<p><strong>결론:</strong> 12년보다 확실히 깊이가 있고, 18년만큼 두드러지는 개성은 없지만 균형감이 아주 뛰어납니다. 셰리 스타일 처음 입문하는 분들께 강추 👍</p>',
28, 192, false, '2026-04-15 21:00:00', '2026-04-15 21:00:00');

-- 6. 주류 할인 정보 공유
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (103, 'FREE', 'G',
'이마트·롯데마트 위스키 가격 요즘 어때요? 최근 구매 가격 공유',
'<p>요즘 대형마트 위스키 가격 변동이 심해서, 최근 구매한 가격들 공유해드립니다 (2026년 4월 기준).</p>
<ul>
  <li><strong>글렌피딕 12년</strong>: 이마트 세일가 41,000원 (정가 48,000원)</li>
  <li><strong>발렌타인 17년</strong>: 롯데마트 54,000원</li>
  <li><strong>오켄토션 12년</strong>: 코스트코 38,500원 — 가성비 정말 좋아요</li>
  <li><strong>맥캘란 12년 더블 캐스크</strong>: 현대백화점 면세점 할인가 67,000원</li>
</ul>
<p>면세점은 구매 한도 이슈가 있어서, 국내 마트 vs 면세점 비교해서 보시면 좋을 것 같아요. 세일 정보는 앱 알림 켜두면 편리합니다!</p>
<p>다른 분들도 최근에 좋은 가격에 구매하셨다면 댓글로 공유 부탁드려요 🙏</p>',
15, 310, false, '2026-04-18 12:00:00', '2026-04-18 12:00:00');

-- 7. 위스키 잔 종류 질문
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (100, 'FREE', 'Q',
'위스키 잔 종류가 너무 많아서 뭘 사야할지 모르겠어요',
'<p>위스키를 마시려고 잔을 사려는데 종류가 너무 많아 고민됩니다.</p>
<p>글렌케언(Glencairn), 튤립, 노징 글라스, 스누터, 하이볼 잔, 록 글라스... 이게 다 용도가 다른 건가요?</p>
<p>처음 한 종류만 사야 한다면 뭘 추천하시나요? 주로 스트레이트나 니트로 마실 것 같아요. 가격대도 알려주시면 감사하겠습니다 🙏</p>',
8, 74, false, '2026-04-20 17:35:00', '2026-04-20 17:35:00');

-- 8. 폴존 피티드 충격 후기
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (101, 'FREE', 'R',
'폴존 피티드 클래식 셀렉트 캐스크 — 처음 마셨는데 충격이에요',
'<p>아이리시 위스키인데 피트향이 이렇게 강할 줄은 몰랐어요. 보통 아이리시는 부드럽다는 인식이 있었는데, 폴존 피티드는 완전히 딴 세상입니다.</p>
<p><strong>향:</strong> 병을 열자마자 훈제 냄새가 확 올라와요. 아일라 위스키 느낌이 납니다. 55.5%라는 도수도 코를 가까이 대면 느껴져요.</p>
<p><strong>맛:</strong> 강한 피트 연기, 뒤에 오는 바닐라와 약간의 달콤함. 물 몇 방울 추가하면 훨씬 마시기 편해집니다. 캐스크 스트렝스다 보니 가수가 정말 중요해요.</p>
<p><strong>후기:</strong> 피트 입문자에게 바로 추천하기엔 강도가 좀 있지만, 피트 매니아라면 꼭 경험해봐야 할 위스키입니다. 가격 대비 개성이 확실해요!</p>',
22, 177, false, '2026-04-22 19:50:00', '2026-04-22 19:50:00');

-- 9. 위스키 선물 추천
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (106, 'FREE', 'L',
'부모님 선물용 위스키 추천해주세요 — 예산 10만 원 이내',
'<p>아버지 환갑 선물로 위스키를 드리려 합니다. 위스키를 즐기시긴 하지만 셀프 구매는 잘 안 하시는 편이에요.</p>
<p>평소 즐겨 드시는 건 조니워커 블랙이라고 하셨어요. 블렌디드 좋아하시는 분께 어울리는 싱글몰트가 있다면 추천 부탁드립니다!</p>
<p>예산은 7~10만 원 이내, 선물 포장이 예쁜 것이면 더 좋겠어요 🎁</p>',
17, 129, false, '2026-04-25 10:20:00', '2026-04-25 10:20:00');

-- 10. 오늘의 한잔 에버펠디 12년
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (103, 'FREE', 'F',
'오늘의 한 잔 🥃 에버펠디 12년 + 오늘의 안주 조합 공유',
'<p>오늘 퇴근 후 조용히 에버펠디 12년을 열었습니다. 꿀향이 강한 하이랜드 위스키인데 오늘 날씨랑 너무 잘 어울리더라고요.</p>
<p><strong>오늘의 조합:</strong></p>
<ul>
  <li>에버펠디 12년 + 다크 초콜릿 — 위스키의 과일향이 초콜릿의 쓴맛을 잡아줌</li>
  <li>스트레이트 → 마지막 한 잔은 얼음 하나 추가해서 하이볼로</li>
</ul>
<p>원래 달달한 위스키가 제 취향이 아닌 줄 알았는데 에버펠디는 달달함이 너무 인위적이지 않아서 좋았어요. 부담 없는 평일 위스키로 강추합니다.</p>
<p>오늘 뭐 마시셨나요? 😊</p>',
11, 95, false, '2026-04-28 22:15:00', '2026-04-28 22:15:00');

-- 11. 위스키 냉장 보관 질문
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (100, 'FREE', 'Q',
'위스키 냉장 보관해도 되나요? 개봉 후 관리법이 궁금해요',
'<p>위스키 개봉하고 남은 거 어떻게 보관하시나요?</p>
<p>와인은 냉장 보관하던데 위스키도 그렇게 해야 하는 건지 모르겠어요. 지금은 그냥 주방 선반에 세워두고 있는데 이게 맞는 방법인지 걱정이 됩니다.</p>
<p>개봉 후 얼마나 오래 두고 마실 수 있는지도 알고 싶어요. 너무 오래 두면 맛이 변하나요?</p>',
6, 58, false, '2026-05-02 09:00:00', '2026-05-02 09:00:00');

-- 12. 가성비 위스키 리스트
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (104, 'FREE', 'L',
'가성비 위스키 TOP 5 — 5만 원 이하에서 이것만 있으면 됩니다',
'<p>위스키 입문자분들을 위해 제가 자주 추천하는 5만 원 이하 가성비 라인업을 정리했습니다.</p>
<ol>
  <li><strong>오켄토션 12년 (3~4만 원대)</strong> — 트리플 디스틸드, 라이트하고 깨끗한 로우랜드 스타일. 입문 1순위.</li>
  <li><strong>글렌모렌지 오리지널 10년 (4만 원대)</strong> — 하이랜드의 꽃. 화사하고 섬세한 향이 인상적.</li>
  <li><strong>에버펠디 12년 (4만 원대)</strong> — 꿀향이 가득한 스페이사이드. 달달한 위스키 입문에 최적.</li>
  <li><strong>스페이번 10년 (3만 원대)</strong> — 이 가격에 이 퀄리티? 가성비 끝판왕 중 하나.</li>
  <li><strong>발렌타인 파이니스트 (1.5만 원대)</strong> — 블렌디드지만 칵테일 베이스나 하이볼로 최고.</li>
</ol>
<p>이 다섯 병만 있어도 취향 파악하기에 충분합니다. 다 마셔보시면 어느 쪽이 더 맞는지 자연스럽게 알게 될 거예요! 🥃</p>',
38, 264, false, '2026-05-05 14:00:00', '2026-05-05 14:00:00');

-- 13. 오켄토션 12년 리뷰
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (106, 'FREE', 'R',
'오켄토션 12년 — 로우랜드의 깨끗함이란 이런 것',
'<p>친구 추천으로 처음 마셔본 <strong>오켄토션 12년</strong>. 솔직히 "이게 무슨 특색이야?" 싶었는데 두 번 마시니 이 깔끔함이 매력이더라고요.</p>
<p><strong>트리플 디스틸드의 힘:</strong> 불순물을 세 번 걸러낸 덕분에 정말 맑고 투명한 맛입니다. 잡내가 전혀 없어요.</p>
<p><strong>향·맛:</strong> 레몬, 그린 애플, 약간의 아몬드. 달콤하기보다는 시원하고 가벼운 느낌. 하이볼로 만들면 정말 청량합니다.</p>
<p><strong>총평:</strong> 강한 개성을 원하는 분께는 심심할 수 있지만, 가볍게 즐기기엔 최고입니다. 가격도 착하고 코스트코에서 자주 보여서 재구매 쉬운 것도 장점!</p>',
14, 108, false, '2026-05-08 20:30:00', '2026-05-08 20:30:00');

-- 14. 혼자 위스키 마시기
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (102, 'FREE', 'F',
'혼자 위스키 마시는 게 이상한 건 아니죠? 🤔',
'<p>주변에 위스키 좋아하는 사람이 없어서 혼자 마시는데, 가끔 이게 이상한 건 아닌가 싶더라고요.</p>
<p>술은 여럿이 마셔야 한다는 인식이 있어서... 근데 저는 사실 혼자 조용히 음악 틀어놓고 한 잔씩 음미하는 게 너무 좋거든요. 맛에 집중할 수 있고, 다음 날 술자리 피로감도 없고요.</p>
<p>여러분은 혼자 마시는 편인가요, 같이 마시는 편인가요? 혼술할 때 루틴이 있으면 공유해주세요 😊</p>',
25, 183, false, '2026-05-10 23:00:00', '2026-05-10 23:00:00');

-- 15. 스페이사이드 vs 아일라
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (105, 'FREE', 'B',
'스카치 위스키 지역별 특징 정리 — 입문자용 지도',
'<p>위스키 공부하다 보면 지역 이름이 엄청 많이 나와요. 헷갈리는 분들을 위해 주요 지역별 특징을 간단히 정리해봤습니다.</p>
<h3>스코틀랜드 주요 지역</h3>
<ul>
  <li><strong>스페이사이드</strong> — 달콤하고 과일향. 글렌피딕, 맥캘란, 글렌리벳이 여기 출신. 입문자 최강</li>
  <li><strong>하이랜드</strong> — 다양한 스타일. 꽃향기부터 묵직한 오크까지. 글렌모렌지, 에버펠디, 달모어</li>
  <li><strong>로우랜드</strong> — 라이트하고 깨끗함. 트리플 디스틸드 많음. 오켄토션이 대표주자</li>
  <li><strong>아일라</strong> — 강렬한 피트와 바다향. 라가불린, 아드벡, 보모어. 애증의 지역</li>
  <li><strong>캠벨타운</strong> — 약간 독특한 소금기. 스프링뱅크가 유명</li>
  <li><strong>아일랜드</strong> — 스코틀랜드가 아닙니다! 부드럽고 가볍습니다. 제임슨, 부시밀스</li>
</ul>
<p>처음엔 스페이사이드나 하이랜드부터 시작해서 조금씩 아일라로 나아가는 걸 추천해요 😄</p>',
29, 225, false, '2026-05-13 16:20:00', '2026-05-13 16:20:00');

-- 16. 위스키 보관 온도 질문
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (106, 'FREE', 'Q',
'위스키 보관 적정 온도가 얼마인가요? 여름이라 걱정됩니다',
'<p>요즘 기온이 올라가면서 위스키 보관이 걱정되네요.</p>
<p>와인은 와인셀러에 보관하는 걸 알고 있는데, 위스키도 온도에 민감한가요? 현재 거실 선반에 12병 정도 두고 있는데, 여름에 실내 온도가 30도까지 올라가기도 합니다.</p>
<p>냉장 보관은 해야 하나요? 냉장하면 향이 날아간다는 얘기도 들었는데 맞는 말인지 모르겠어요.</p>',
9, 67, false, '2026-05-16 11:45:00', '2026-05-16 11:45:00');

-- 17. 로얄 브라클라 21년 생일 선물 후기
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (102, 'FREE', 'F',
'생일 선물로 로얄 브라클라 21년 받았습니다 🎂',
'<p>오늘 생일인데 친구들이 제 취향을 너무 잘 파악했더라고요. <strong>로얄 브라클라 21년</strong>이라니!</p>
<p>사실 처음 들어보는 증류소였는데 찾아보니까 스코틀랜드 왕실에 납품하던 유서 깊은 곳이더라고요. 21년 숙성에 셰리 피니시가 들어간다고 합니다.</p>
<p>아직 아껴두고 있어요. 특별한 날에 열려고요. 마신 분 계세요? 어떤 맛인지 미리 좀 들을 수 있을까요? ㅎㅎ</p>',
20, 134, false, '2026-05-19 19:00:00', '2026-05-19 19:00:00');

-- 18. 와인 좋아하면 어떤 위스키
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (104, 'FREE', 'L',
'와인 좋아하는 분께 위스키 추천 — 셰리 캐스크가 답입니다',
'<p>와인에서 위스키로 넘어오고 싶은 분들 많이 보셨을 거예요. 이런 분들께는 단연 <strong>셰리 캐스크 숙성 위스키</strong>를 추천합니다.</p>
<p>셰리 와인에 담겼던 오크통에서 위스키를 숙성시키기 때문에, 건포도·말린 자두·다크 베리류 같은 와인에서 익숙한 과일 노트가 위스키에서도 느껴져요.</p>
<h3>추천 라인업</h3>
<ul>
  <li><strong>맥캘란 12년 셰리 오크</strong> — 셰리 위스키의 기준점</li>
  <li><strong>글렌피딕 18년</strong> — 유럽산 오크 + 아메리칸 오크 조합, 풍성한 과일향</li>
  <li><strong>아벨라워 아버나흐</strong> — 셰리 캐스크 100%, 강렬한 과일과 스파이스</li>
  <li><strong>달모어 12년</strong> — 화이트 와인 캐스크 피니시, 부드럽고 달콤함</li>
</ul>
<p>와인 좋아하시는 분이라면 셰리 위스키에서 출발해서 서서히 범위를 넓혀가보세요 🍷→🥃</p>',
33, 241, false, '2026-05-22 14:30:00', '2026-05-22 14:30:00');

-- 19. 해외 면세점 위스키 쇼핑 팁
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (105, 'FREE', 'G',
'해외 면세점 위스키 쇼핑 꿀팁 — 직접 경험한 내용 정리',
'<p>최근 일본·스코틀랜드 여행에서 면세점 쇼핑 경험을 정리해봤습니다.</p>
<h3>공항 면세점 vs 시내 면세점</h3>
<ul>
  <li>시내 면세점이 보통 조금 더 싸지만, 도착 공항에서 픽업해야 합니다</li>
  <li>공항 면세 한도: 주류 1병(1L 이하, $400 미만)</li>
  <li>초과 시 세관 신고 필수 — 덜미 잡히면 더 손해예요</li>
</ul>
<h3>스코틀랜드 증류소 직구</h3>
<ul>
  <li>증류소 방문 시 증류소 한정판을 구할 수 있습니다</li>
  <li>글렌리벳, 맥캘란, 아드벡 모두 방문자 센터 운영 중</li>
  <li>국내 미수입 라인업을 현지에서 구하는 재미가 있어요</li>
</ul>
<h3>일본 면세점 팁</h3>
<ul>
  <li>산토리, 니카 제품이 현지가 훨씬 저렴 (히비키, 야마자키 등)</li>
  <li>야마자키 12년은 일본 면세 기준 약 8만 원 수준</li>
</ul>
<p>다음 여행 계획 있으신 분들 참고하세요! ✈️</p>',
21, 287, false, '2026-05-25 10:00:00', '2026-05-25 10:00:00');

-- 20. 글렌모렌지 오리지널 10년 일상 위스키로
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (106, 'FREE', 'R',
'글렌모렌지 오리지널 10년 — 일상 위스키로 이만한 게 없다',
'<p>비싼 위스키만 좋은 거라는 편견을 깨준 위스키가 <strong>글렌모렌지 오리지널 10년</strong>이었어요.</p>
<p><strong>증류소 특징:</strong> 스코틀랜드에서 가장 목이 긴 포트 스틸을 사용해 가볍고 화사한 스타일이 나옵니다. 이 가벼움이 포인트예요.</p>
<p><strong>향:</strong> 복숭아, 살구, 꽃향기, 약간의 바닐라. 복잡하지 않고 맑아서 시음 피로가 없어요.</p>
<p><strong>맛:</strong> 미디엄 바디, 꽃향기와 과일의 균형. 끝맛이 짧은 편이지만 깔끔하게 떨어집니다.</p>
<p><strong>추천 시기:</strong> 봄·여름 가벼운 저녁에 딱입니다. 하이볼로 만들어도 맛있어요. 4만 원대 가성비 하이랜드 위스키론 탑이라 생각합니다 🌸</p>',
16, 122, false, '2026-05-28 21:40:00', '2026-05-28 21:40:00');

-- 21. 위스키 표현법 어렵다
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (100, 'FREE', 'B',
'위스키 테이스팅 용어 너무 어렵지 않나요? 😅',
'<p>위스키 리뷰 읽다보면 "피트", "캐스크 스트렝스", "피니시가 짧다" 이런 표현이 나오는데 처음엔 무슨 말인지 몰라서 너무 당황했어요.</p>
<p>지금은 조금씩 이해하고 있는데, 여러분은 어떻게 공부하셨나요?</p>
<ul>
  <li>유튜브 위스키 채널 보기?</li>
  <li>직접 여러 병 마셔보면서 비교?</li>
  <li>테이스팅 모임 참가?</li>
</ul>
<p>초보인 저도 자신 있게 테이스팅 노트 쓸 수 있는 날이 올까요 🥲</p>',
18, 149, false, '2026-06-01 13:00:00', '2026-06-01 13:00:00');

-- 22. 서울 위스키 바 추천
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (103, 'FREE', 'G',
'서울 위스키 바 추천 — 강남·이태원·마포 지역별 정리',
'<p>위스키 바에서 다양한 위스키를 잔으로 맛보는 건 취향을 넓히기에 정말 좋은 방법이에요. 최근에 다녀본 곳들 정리해봤습니다.</p>
<h3>강남권</h3>
<ul>
  <li><strong>앤 위스키</strong> — 스카치 라인업이 탄탄하고, 바텐더 설명이 친절함</li>
  <li><strong>하이볼 클럽</strong> — 하이볼 전문이지만 싱글몰트도 꽤 갖춰있음</li>
</ul>
<h3>이태원/한남</h3>
<ul>
  <li><strong>더 스카치</strong> — 이름처럼 스카치 전문. 희귀 싱글 캐스크 많음</li>
  <li><strong>빈티지 바</strong> — 아담하고 조용한 분위기, 가격도 합리적</li>
</ul>
<h3>마포/홍대</h3>
<ul>
  <li><strong>위스키 클럽</strong> — 가격이 친절하고 입문자 친화적</li>
</ul>
<p>혼자 가도 전혀 어색하지 않으니 부담 없이 방문해보세요! 바텐더분들한테 취향 얘기하면 잘 추천해주십니다 🥃</p>',
27, 312, false, '2026-06-04 18:00:00', '2026-06-04 18:00:00');

-- 23. 맥캘란 더블 캐스크 vs 셰리 오크 비교
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (104, 'FREE', 'R',
'맥캘란 12년 더블 캐스크 vs 셰리 오크 — 무엇이 더 맥캘란다울까?',
'<p>맥캘란을 처음 살 때 많이들 고민하는 "더블 캐스크 vs 셰리 오크"를 나란히 놓고 비교해봤습니다.</p>
<h3>맥캘란 12년 더블 캐스크</h3>
<ul>
  <li>유럽산 셰리 오크 + 아메리칸 오크 숙성</li>
  <li>달콤하고 과일향이 풍성, 오렌지 껍질·바닐라·캐러멜</li>
  <li>보다 접근하기 쉽고 부드러운 편</li>
</ul>
<h3>맥캘란 12년 셰리 오크</h3>
<ul>
  <li>유럽산 셰리 오크 100% 숙성</li>
  <li>더 진하고 강렬한 건포도·초콜릿·스파이스</li>
  <li>맥캘란 고유의 셰리 특성이 더 두드러짐</li>
</ul>
<p><strong>결론:</strong> 처음이라면 더블 캐스크, 맥캘란다운 맥캘란을 원한다면 셰리 오크. 어느 쪽이든 후회 없을 거예요!</p>',
32, 247, false, '2026-06-07 20:00:00', '2026-06-07 20:00:00');

-- 24. 올 한해 마신 위스키 결산
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (101, 'FREE', 'F',
'2026년 상반기 결산 🥃 — 올해 마신 위스키 베스트 3',
'<p>벌써 2026년도 절반이 지나가는 기념으로 올 상반기 인상 깊었던 위스키를 정리해봤어요!</p>
<h3>🥇 1위 — 폴존 피티드 클래식 셀렉트 캐스크</h3>
<p>이 해에 처음 접했는데 아이리시 피트가 이런 맛이구나 싶었어요. 스카치 피트와는 다른 결이 있어서 신선했습니다.</p>
<h3>🥈 2위 — 아드벡 우가달</h3>
<p>한정판이라 구하기 어려웠는데 운 좋게 득템. 강렬한 피트에 셰리 달콤함이 얹혀서 복잡하고 매력적이었어요.</p>
<h3>🥉 3위 — 로얄 브라클라 21년</h3>
<p>오래 숙성된 위스키만의 깊이가 느껴지는 한 병. 특별한 날에 천천히 마셨는데 그 여운이 아직도 남아있어요.</p>
<p>여러분의 2026년 상반기 베스트 위스키는 무엇인가요? 댓글로 공유해주세요 🥃✨</p>',
35, 276, false, '2026-06-10 22:30:00', '2026-06-10 22:30:00');

-- 25. 위스키 유튜브/콘텐츠 추천
INSERT IGNORE INTO posts (author_id, post_type, category, title, context, like_count, view_count, is_deleted, created_at, updated_at)
VALUES (105, 'FREE', 'L',
'위스키 공부하기 좋은 유튜브 채널·책 추천',
'<p>위스키를 공부하고 싶은 분들을 위해 제가 즐겨보는 채널과 책을 정리했어요.</p>
<h3>📺 유튜브 채널</h3>
<ul>
  <li><strong>Ralfy Review</strong> — 스코틀랜드 현지 테이스터의 솔직한 리뷰. 영어지만 자막 켜고 보면 공부됨</li>
  <li><strong>Whisky Advocate</strong> — 정보성 콘텐츠. 지역/증류소 역사를 잘 설명해줌</li>
  <li><strong>최성락 소믈리에</strong> — 국내에서 위스키 이해하기 가장 쉽게 설명하는 채널</li>
  <li><strong>The Whisky Vault</strong> — 재미있는 테이스팅 리액션. 시청각적 즐거움</li>
</ul>
<h3>📚 추천 도서</h3>
<ul>
  <li><strong>《위스키 바이블》 짐 머레이</strong> — 매년 업데이트되는 위스키 종합 평가서</li>
  <li><strong>《스카치 위스키》 마이클 잭슨</strong> — 위스키 지식의 고전</li>
  <li><strong>《위스키의 모든 것》 찰스 맥클린</strong> — 한국어 번역판, 입문서로 최적</li>
</ul>
<p>처음엔 너무 공부하려 하지 말고 그냥 마시면서 즐기세요. 지식은 나중에 따라옵니다 😄🥃</p>',
26, 198, false, '2026-06-13 15:45:00', '2026-06-13 15:45:00');
