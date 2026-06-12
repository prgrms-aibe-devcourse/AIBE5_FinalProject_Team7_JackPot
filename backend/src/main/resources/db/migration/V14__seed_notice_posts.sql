-- WhiskeyNote 공지사항 & FAQ 시드 데이터 (12건)
-- post_type = 'NOTICE', category = 'B', author_id = 1 (관리자)
-- 이미 동일 title의 NOTICE 포스트가 있으면 건너뜀

SET NAMES utf8mb4;

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '🥃 WhiskeyNote에 오신 걸 환영합니다 — 서비스 소개 및 시작 가이드',
  '<h2>WhiskeyNote에 오신 걸 환영합니다</h2>
<p>WhiskeyNote는 위스키 취향을 기록하고, 같은 취향의 사람들과 소통하는 위스키 커뮤니티 플랫폼입니다.</p>

<h3>🎯 WhiskeyNote로 할 수 있는 것</h3>
<ul>
  <li><strong>위스키 노트 기록</strong> — 마신 위스키의 향, 맛, 여운을 나만의 언어로 기록하세요</li>
  <li><strong>테이스팅 노트 공유</strong> — 내 기록을 커뮤니티와 나누고 다른 분들의 취향도 발견하세요</li>
  <li><strong>위시리스트 관리</strong> — 마셔보고 싶은 위스키를 폴더별로 정리하세요</li>
  <li><strong>칼럼 읽기</strong> — 국내외 위스키 전문 칼럼을 한곳에서 읽어보세요</li>
  <li><strong>커뮤니티</strong> — 위스키 관련 자유로운 이야기를 나눠보세요</li>
</ul>

<h3>🚀 3단계로 시작하기</h3>
<ol>
  <li><strong>온보딩 완료</strong> — 가입 후 간단한 취향 설문을 완료하면 맞춤 위스키를 추천받을 수 있어요</li>
  <li><strong>첫 노트 작성</strong> — 최근에 마신 위스키를 검색하고 테이스팅 노트를 작성해보세요</li>
  <li><strong>커뮤니티 참여</strong> — 자유게시판에서 위스키 이야기를 나눠보세요</li>
</ol>

<p>궁금한 점은 언제든 Q&A 게시판에 남겨주세요. 빠르게 답변드리겠습니다. 🙏</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '🥃 WhiskeyNote에 오신 걸 환영합니다 — 서비스 소개 및 시작 가이드' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '📝 테이스팅 노트 작성 방법 안내',
  '<h2>테이스팅 노트, 이렇게 작성하세요</h2>
<p>테이스팅 노트는 내가 마신 위스키의 경험을 기록하는 공간입니다. 전문가가 아니어도 괜찮아요 — 내가 느낀 그대로가 가장 좋은 노트입니다.</p>

<h3>📌 노트 작성 항목 설명</h3>
<ul>
  <li><strong>바디감 (Body)</strong> — 입 안에서 느껴지는 무게감. 가벼운 물 같은 느낌이면 낮게, 묵직한 시럽 같은 느낌이면 높게 점수를 주세요</li>
  <li><strong>여운 (Finish)</strong> — 삼킨 후 입 안에 얼마나 오래, 얼마나 좋은 맛이 남는지</li>
  <li><strong>스모키 (Smoky)</strong> — 훈연향, 피트향의 강도</li>
  <li><strong>스파이시 (Spicy)</strong> — 후추, 계피, 생강 같은 자극적인 향신료 느낌</li>
  <li><strong>스위트 (Sweet)</strong> — 바닐라, 카라멜, 꿀 같은 달콤한 풍미</li>
</ul>

<h3>💡 이런 방식으로 기록해보세요</h3>
<ol>
  <li>위스키 검색 → 상세 페이지 진입</li>
  <li>"노트 작성" 버튼 클릭</li>
  <li>5가지 항목을 슬라이더로 조절</li>
  <li>공개 리뷰 텍스트에 자유롭게 소감 작성 (선택)</li>
  <li>저장!</li>
</ol>

<h3>🔒 공개/비공개 설정</h3>
<p>테이스팅 노트는 기본적으로 공개됩니다. 나만 보고 싶은 기록은 리뷰 작성 시 비공개로 설정할 수 있어요.</p>

<blockquote>💬 "처음엔 어렵게 느껴져도, 10번 쓰다 보면 자신만의 언어가 생겨요. 그게 WhiskeyNote의 가장 큰 재미입니다."</blockquote>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '📝 테이스팅 노트 작성 방법 안내' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '📚 위스키 칼럼 게시판 이용 안내',
  '<h2>위스키 칼럼 게시판 안내</h2>
<p>칼럼 게시판은 국내외 위스키 전문 매체, 유튜브 채널의 콘텐츠를 자동으로 수집해 제공하는 공간입니다.</p>

<h3>📰 수집 소스</h3>
<ul>
  <li><strong>해외 매거진</strong> — The Whiskey Wash, Bourbon Culture 등 영어 위스키 전문 미디어</li>
  <li><strong>유튜브</strong> — The Whisky Bothy, Whiskey Tribe, ModernThirst, Whiskey Vault 등 전문 채널</li>
  <li><strong>AI 칼럼</strong> — 수집된 콘텐츠를 바탕으로 한국어로 재작성한 심층 칼럼</li>
</ul>

<h3>🔍 칼럼 검색 및 필터</h3>
<ul>
  <li>위스키 이름으로 관련 칼럼 검색 가능</li>
  <li>블로그 / 유튜브 소스별 필터링</li>
  <li>최신순 / 인기순 정렬</li>
</ul>

<h3>⚠️ 저작권 안내</h3>
<p>칼럼 게시판의 콘텐츠는 원문 출처가 명시되어 있습니다. 콘텐츠의 저작권은 원 작성자에게 있으며, 상업적 이용은 금지됩니다. 저작권 문의는 <strong>고객센터</strong>로 연락해 주세요.</p>

<h3>🆕 업데이트 주기</h3>
<p>새로운 칼럼은 매일 오전 자동으로 수집됩니다. 좋은 위스키 콘텐츠 소스를 알고 계시다면 Q&A 게시판에 추천해 주세요!</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '📚 위스키 칼럼 게시판 이용 안내' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '🔍 위스키 검색 & 위스키 등록 요청 방법',
  '<h2>위스키 검색 및 등록 요청 안내</h2>

<h3>🔍 위스키 검색</h3>
<p>상단 검색창에 위스키 이름을 입력하면 자동완성으로 빠르게 찾을 수 있습니다.</p>
<ul>
  <li>영어 / 한국어 모두 검색 가능</li>
  <li>오타가 있어도 유사한 결과를 보여줍니다 (오타 교정 기능)</li>
  <li>증류소명, 생산 지역으로도 검색 가능</li>
</ul>

<h3>📋 위스키가 검색되지 않는다면?</h3>
<p>찾는 위스키가 DB에 없을 경우, <strong>위스키 등록 요청</strong> 기능을 이용해 주세요.</p>
<ol>
  <li>검색 결과 하단의 <strong>"위스키 등록 요청"</strong> 버튼 클릭</li>
  <li>위스키 이름, 종류, 생산국, 도수 등 알고 있는 정보 입력</li>
  <li>관리자 검토 후 승인 시 DB에 등록됩니다</li>
</ol>

<h3>⏱️ 등록 요청 처리 기간</h3>
<p>요청 후 <strong>영업일 기준 3~5일</strong> 내 검토 완료를 목표로 합니다. 승인/거절 결과는 알림으로 안내드립니다.</p>

<h3>💡 더 빠른 등록을 위한 팁</h3>
<ul>
  <li>위스키 공식 홈페이지 URL을 함께 첨부하면 처리가 빨라집니다</li>
  <li>정확한 영문 제품명을 기재해 주세요</li>
  <li>동일한 위스키의 중복 요청은 자제 부탁드립니다</li>
</ul>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '🔍 위스키 검색 & 위스키 등록 요청 방법' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '👥 팔로우 & 커뮤니티 기능 이용 안내',
  '<h2>팔로우 & 커뮤니티 기능 안내</h2>

<h3>👥 팔로우 기능</h3>
<p>취향이 비슷한 위스키 애호가를 팔로우하고 그들의 테이스팅 노트를 피드에서 받아볼 수 있습니다.</p>
<ul>
  <li>유저 프로필 페이지에서 팔로우 버튼 클릭</li>
  <li>팔로잉한 유저의 새 노트가 피드에 노출</li>
  <li>맞팔로우 시 DM 기능 사용 가능 (추후 업데이트 예정)</li>
</ul>

<h3>💬 커뮤니티 게시판 카테고리</h3>
<ul>
  <li><strong>자유 (F)</strong> — 위스키에 관한 자유로운 이야기</li>
  <li><strong>리뷰 (R)</strong> — 위스키 리뷰 및 추천</li>
  <li><strong>질문 (Q)</strong> — 위스키 관련 궁금한 점</li>
  <li><strong>구매/거래 (G)</strong> — 위스키 구매 정보, 한정판 구입처 공유</li>
  <li><strong>공지 (B)</strong> — 운영팀 공지사항</li>
</ul>

<h3>📌 커뮤니티 이용 규칙</h3>
<ul>
  <li>타인을 비방하거나 혐오하는 게시글은 삭제 처리됩니다</li>
  <li>광고, 홍보성 게시글은 사전 승인 없이 삭제될 수 있습니다</li>
  <li>미성년자의 주류 구매/음용을 조장하는 콘텐츠는 금지합니다</li>
  <li>건전한 위스키 문화를 함께 만들어 주세요 🥃</li>
</ul>

<h3>🚨 신고 기능</h3>
<p>부적절한 게시글이나 댓글을 발견하셨다면 신고 버튼을 이용해 주세요. 24시간 내 검토하겠습니다.</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '👥 팔로우 & 커뮤니티 기능 이용 안내' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '⭐ 위시리스트 & 픽(Pick) 기능 사용 가이드',
  '<h2>위시리스트 & 픽 기능 안내</h2>

<h3>❤️ 픽 (Pick) 기능</h3>
<p>마음에 드는 위스키에 픽을 추가하면 나만의 즐겨찾기 목록이 만들어집니다.</p>
<ul>
  <li>위스키 상세 페이지에서 하트 버튼 클릭</li>
  <li>픽한 위스키는 마이페이지 → "내 픽" 에서 모아볼 수 있어요</li>
  <li>위스키당 픽은 1개만 가능합니다</li>
</ul>

<h3>📋 위시리스트 기능</h3>
<p>마셔보고 싶은 위스키를 폴더로 분류해서 관리할 수 있습니다.</p>
<ol>
  <li>위스키 상세 페이지 → "위시리스트에 추가" 클릭</li>
  <li>기존 폴더 선택 또는 새 폴더 생성</li>
  <li>마이페이지 → "위시리스트"에서 전체 목록 관리</li>
</ol>

<h3>💡 이렇게 활용해보세요</h3>
<ul>
  <li>🎁 <strong>"선물받고 싶은 위스키"</strong> 폴더 — 생일, 기념일 선물 힌트로 공유</li>
  <li>🌍 <strong>"나라별 도전 리스트"</strong> 폴더 — 스카치, 버번, 재패니즈 구분 관리</li>
  <li>💰 <strong>"예산별 버킷리스트"</strong> 폴더 — 5만원대, 10만원대 등으로 분류</li>
  <li>🏆 <strong>"마신 위스키 기록"</strong> 폴더 — 이미 마신 것들 체크리스트로 활용</li>
</ul>

<p>위시리스트는 현재 본인만 볼 수 있으며, 향후 공개/공유 기능 업데이트를 계획하고 있습니다.</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '⭐ 위시리스트 & 픽(Pick) 기능 사용 가이드' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '❓ [FAQ] 회원가입 & 로그인 관련 자주 묻는 질문',
  '<h2>회원가입 & 로그인 FAQ</h2>

<h3>Q. 카카오 로그인과 이메일 로그인의 차이가 있나요?</h3>
<p>기능상 차이는 없습니다. 카카오 로그인은 별도의 비밀번호 없이 카카오 계정으로 간편하게 로그인할 수 있습니다. 이메일 로그인은 이메일 인증 후 비밀번호로 로그인합니다.</p>

<h3>Q. 온보딩을 건너뛸 수 있나요?</h3>
<p>온보딩은 맞춤 위스키 추천을 위한 취향 설문입니다. 건너뛸 수 있지만, 완료하면 더 정확한 추천을 받을 수 있어요. 나중에 마이페이지에서 다시 진행할 수 있습니다.</p>

<h3>Q. 닉네임을 변경할 수 있나요?</h3>
<p>마이페이지 → 프로필 편집에서 닉네임을 변경할 수 있습니다. 단, 닉네임은 전체 회원 중 고유해야 하므로 이미 사용 중인 닉네임은 사용할 수 없습니다.</p>

<h3>Q. 비밀번호를 잊어버렸어요</h3>
<p>로그인 페이지 하단의 <strong>"비밀번호 찾기"</strong>를 클릭하세요. 가입 시 사용한 이메일로 재설정 링크를 발송해드립니다. 카카오 로그인 사용자는 카카오 비밀번호를 카카오에서 재설정해 주세요.</p>

<h3>Q. 계정을 삭제하고 싶어요</h3>
<p>마이페이지 → 설정 → <strong>"회원 탈퇴"</strong>에서 진행하실 수 있습니다. 탈퇴 후 계정 정보는 즉시 삭제되지만, 작성하신 게시글과 댓글은 커뮤니티 유지를 위해 익명으로 보존됩니다.</p>

<h3>Q. 이메일 인증 메일이 오지 않아요</h3>
<p>스팸함을 먼저 확인해 주세요. 그래도 없다면 로그인 후 마이페이지 → "이메일 재인증 발송"을 클릭하거나, Q&A 게시판으로 문의해 주세요.</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '❓ [FAQ] 회원가입 & 로그인 관련 자주 묻는 질문' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '❓ [FAQ] 테이스팅 노트 & 리뷰 관련 자주 묻는 질문',
  '<h2>테이스팅 노트 & 리뷰 FAQ</h2>

<h3>Q. 같은 위스키에 노트를 여러 개 작성할 수 있나요?</h3>
<p>위스키 1개당 테이스팅 노트는 1개만 작성할 수 있습니다. 마실 때마다 취향이 달라진다면 기존 노트를 수정해서 업데이트해 주세요. 수정 이력은 저장됩니다.</p>

<h3>Q. 작성한 노트를 삭제할 수 있나요?</h3>
<p>마이페이지 → 내 노트 목록에서 삭제할 수 있습니다. 단, 해당 노트를 기반으로 작성한 공개 리뷰가 있는 경우, 리뷰도 함께 삭제됩니다.</p>

<h3>Q. 점수 기준을 모르겠어요. 어떻게 매겨야 하나요?</h3>
<p>정해진 정답은 없습니다! 아래를 참고해보세요:</p>
<ul>
  <li><strong>1~3점</strong>: 해당 특성이 거의 없거나 약함</li>
  <li><strong>4~6점</strong>: 보통 수준, 느껴지긴 하지만 강하지 않음</li>
  <li><strong>7~9점</strong>: 뚜렷하게 느껴짐</li>
  <li><strong>10점</strong>: 매우 강렬하게 느껴짐</li>
</ul>
<p>무엇보다 <strong>나의 느낌</strong>을 그대로 반영하는 것이 가장 중요해요.</p>

<h3>Q. 다른 사람의 노트를 내 노트로 복사할 수 있나요?</h3>
<p>현재는 지원하지 않습니다. 다른 분의 노트는 참고용으로만 활용해 주세요.</p>

<h3>Q. 공개 리뷰를 쓰지 않아도 되나요?</h3>
<p>네, 공개 리뷰 텍스트는 선택사항입니다. 5가지 점수만 입력해도 노트 작성이 완료됩니다.</p>

<h3>Q. 내 리뷰에 좋아요가 눌렸는지 알 수 있나요?</h3>
<p>현재는 알림 기능이 준비 중입니다. 마이페이지 → 내 리뷰에서 좋아요 수를 직접 확인해 주세요. 알림 기능은 빠른 시일 내 업데이트 예정입니다.</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '❓ [FAQ] 테이스팅 노트 & 리뷰 관련 자주 묻는 질문' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '❓ [FAQ] 위스키 검색 & 데이터 관련 자주 묻는 질문',
  '<h2>위스키 검색 & 데이터 FAQ</h2>

<h3>Q. 위스키를 검색했는데 결과가 없어요</h3>
<p>현재 DB에 없는 위스키일 수 있습니다. 아래 방법을 시도해보세요:</p>
<ol>
  <li>영문 이름으로 다시 검색 (예: "글렌피딕" → "Glenfiddich")</li>
  <li>증류소명으로 검색</li>
  <li>그래도 없다면 <strong>"위스키 등록 요청"</strong> 기능 이용</li>
</ol>

<h3>Q. 위스키 정보가 틀린 것 같아요</h3>
<p>Q&A 게시판에 해당 위스키 이름과 수정이 필요한 내용을 남겨주세요. 확인 후 빠르게 수정하겠습니다. 정확한 정보를 위한 제보는 언제나 환영합니다!</p>

<h3>Q. 한국 미수입 위스키도 등록할 수 있나요?</h3>
<p>네, 가능합니다. 해외에서만 구매 가능한 위스키도 등록 요청하실 수 있습니다. 다만 정확한 정보 확인을 위해 공식 사이트 URL을 함께 첨부해 주시면 처리가 빠릅니다.</p>

<h3>Q. 단종된 위스키도 검색되나요?</h3>
<p>네, DB에 등록된 경우 단종 위스키도 검색 가능합니다. 단종 위스키를 소장하고 계신 분들의 테이스팅 노트도 환영합니다!</p>

<h3>Q. 위스키 이미지가 없는 경우는 어떻게 하나요?</h3>
<p>일부 위스키는 이미지가 없을 수 있습니다. 이미지 제보도 Q&A 게시판으로 해주시면 감사히 반영하겠습니다.</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '❓ [FAQ] 위스키 검색 & 데이터 관련 자주 묻는 질문' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '❓ [FAQ] 위시리스트 & 픽 관련 자주 묻는 질문',
  '<h2>위시리스트 & 픽 FAQ</h2>

<h3>Q. 위시리스트 폴더는 몇 개까지 만들 수 있나요?</h3>
<p>현재 폴더 수 제한은 없습니다. 자유롭게 원하는 만큼 만들어 사용하세요!</p>

<h3>Q. 위시리스트를 다른 사람에게 공유할 수 있나요?</h3>
<p>현재는 비공개 전용입니다. 위시리스트 공유 기능은 향후 업데이트에서 추가될 예정입니다. 기대해 주세요!</p>

<h3>Q. 픽과 위시리스트의 차이가 뭔가요?</h3>
<ul>
  <li><strong>픽 (Pick)</strong>: 좋아하는 위스키, 이미 마셨거나 특히 마음에 드는 위스키에 표시</li>
  <li><strong>위시리스트</strong>: 마셔보고 싶은 위스키, 구매 예정 목록 관리용</li>
</ul>
<p>두 기능을 함께 활용하면 "이미 즐기는 것" vs "도전하고 싶은 것"을 명확하게 구분할 수 있어요.</p>

<h3>Q. 위시리스트에 추가한 위스키가 DB에서 삭제되면 어떻게 되나요?</h3>
<p>위스키가 비활성화(INACTIVE)되면 위시리스트에서도 자동으로 제거됩니다. 단, 실제로 위스키 데이터가 삭제되는 경우는 거의 없으니 걱정하지 않으셔도 됩니다.</p>

<h3>Q. 픽한 위스키를 한꺼번에 삭제할 수 있나요?</h3>
<p>현재는 개별 삭제만 가능합니다. 일괄 삭제 기능은 향후 업데이트 예정입니다.</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '❓ [FAQ] 위시리스트 & 픽 관련 자주 묻는 질문' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '❓ [FAQ] 서비스 이용 & 기타 자주 묻는 질문',
  '<h2>서비스 이용 & 기타 FAQ</h2>

<h3>Q. WhiskeyNote는 무료인가요?</h3>
<p>네, 현재 모든 기능을 무료로 이용하실 수 있습니다. 향후 프리미엄 기능이 추가될 수 있으나, 기본 기능은 항상 무료로 유지할 예정입니다.</p>

<h3>Q. 미성년자도 가입할 수 있나요?</h3>
<p>WhiskeyNote는 주류 관련 서비스로, 가입 시 만 19세 이상 성인만 이용 가능합니다. 생년월일 인증을 통해 확인하고 있습니다.</p>

<h3>Q. 모바일에서도 이용할 수 있나요?</h3>
<p>현재 웹 브라우저 기반으로 운영 중이며, 모바일 브라우저에서도 이용 가능합니다. 네이티브 앱(iOS/Android)은 추후 출시 예정입니다.</p>

<h3>Q. 개인정보는 어떻게 처리되나요?</h3>
<p>수집된 개인정보는 서비스 제공 목적으로만 사용되며, 제3자에게 제공되지 않습니다. 자세한 내용은 <strong>개인정보처리방침</strong>을 확인해 주세요.</p>

<h3>Q. 버그나 오류를 발견했어요</h3>
<p>Q&A 게시판에 아래 내용을 포함해 제보해 주세요:</p>
<ul>
  <li>어떤 기능에서 발생했는지</li>
  <li>어떤 행동을 했을 때 오류가 났는지</li>
  <li>오류 메시지 내용 (스크린샷 첨부 환영)</li>
  <li>사용 중인 브라우저와 OS</li>
</ul>
<p>소중한 제보 덕분에 서비스가 더 좋아집니다. 감사합니다! 🙏</p>

<h3>Q. 서비스 관련 제안이나 피드백은 어디에 남기나요?</h3>
<p>Q&A 게시판의 <strong>"서비스 제안"</strong> 카테고리에 자유롭게 남겨주세요. 모든 피드백을 꼼꼼히 읽고 서비스 개선에 반영하겠습니다.</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '❓ [FAQ] 서비스 이용 & 기타 자주 묻는 질문' AND post_type = 'NOTICE'
);

INSERT INTO posts
  (author_id, post_type, category, title, context, like_count, is_deleted, created_at, updated_at)
SELECT * FROM (SELECT
  1, 'NOTICE', 'B',
  '🔔 서비스 업데이트 예정 기능 안내 (2024년 하반기)',
  '<h2>곧 만날 수 있는 새로운 기능들</h2>
<p>WhiskeyNote 팀이 준비 중인 업데이트 기능을 미리 소개합니다. 많은 기대 부탁드려요!</p>

<h3>🔜 준비 중인 기능</h3>

<h4>1. 알림 시스템</h4>
<ul>
  <li>내 리뷰에 좋아요가 눌렸을 때</li>
  <li>내 게시글에 댓글이 달렸을 때</li>
  <li>팔로우한 사람이 새 노트를 작성했을 때</li>
</ul>

<h4>2. 위시리스트 공유</h4>
<ul>
  <li>위시리스트를 링크로 공유하는 기능</li>
  <li>선물 힌트로 활용할 수 있는 공개 위시리스트</li>
</ul>

<h4>3. 위스키 추천 강화</h4>
<ul>
  <li>테이스팅 노트 기반 취향 분석</li>
  <li>"이 위스키를 좋아한다면 이것도 좋아할 거예요" 추천</li>
  <li>팔로잉 유저들의 평점 기반 추천</li>
</ul>

<h4>4. 모바일 앱 (iOS / Android)</h4>
<ul>
  <li>바코드 스캔으로 위스키 즉시 검색</li>
  <li>위스키 바에서 바로 노트 작성</li>
  <li>푸시 알림 지원</li>
</ul>

<h4>5. 위스키 캐비넷</h4>
<ul>
  <li>현재 보유 중인 위스키 재고 관리</li>
  <li>개봉일, 남은 양 기록</li>
  <li>캐비넷 공개 옵션</li>
</ul>

<h3>💬 기능 제안은 언제나 환영!</h3>
<p>원하시는 기능이 있다면 Q&A 게시판에 남겨주세요. 사용자 여러분의 의견이 WhiskeyNote을 만들어갑니다. 🥃</p>',
  0, false, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = '🔔 서비스 업데이트 예정 기능 안내 (2024년 하반기)' AND post_type = 'NOTICE'
);
