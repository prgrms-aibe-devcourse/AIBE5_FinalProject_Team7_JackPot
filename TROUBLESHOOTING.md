# 트러블슈팅 기록

커뮤니티 기능 개발 및 시드 데이터 작업 과정에서 발생한 주요 문제와 해결 방법을 기록합니다.

---

## 1. 칼럼 클릭 시 외부 URL로 이동하는 문제

**발생 상황**
칼럼 목록에서 항목을 클릭하면 원문 URL(블로그, YouTube)로 직접 이동했다.
서비스 내에서 칼럼 내용을 읽을 수 없어 사용자 경험이 단절됨.

**원인**
`FeedList` 컴포넌트에서 `<a href={feed.url} target="_blank">` 로 외부 링크 이동 처리.
내부 상세 페이지가 없었음.

**해결**
- `ColumnDetailPage` 신규 구현 (`/community/columns/:columnId`)
- `ReactMarkdown`으로 `description` 필드의 마크다운 본문 렌더링
- 원문은 하단 "출처" 카드(`SourceCard`)에서 별도 링크로 제공
- `<Link to={PATHS.COMMUNITY_COLUMN}>` 로 라우터 내부 이동으로 전환

---

## 2. Anthropic API 크레딧 부족으로 번역 실패

**발생 상황**
RSS로 수집한 영문 칼럼(The Whiskey Wash, Bourbon Culture)을 한국어로 번역하려 했으나
Anthropic API 호출 시 크레딧 초과 오류 발생.

**원인**
사용 중인 API 키(`sk-ant-api03-...`)의 잔여 크레딧이 없었음.

**해결**
- Anthropic API 대신 Google Translate 비공식 엔드포인트로 전환 시도
- 결과적으로 번역 품질 문제로 인해 AI가 직접 작성한 고품질 한국어 칼럼 20개(`whiskey_columns_insert.sql`)를 DB에 삽입하는 방식으로 전환

---

## 3. 외부 사이트 OG 이미지 크롤링 차단

**발생 상황**
칼럼 썸네일 이미지를 원문 사이트의 OG 이미지에서 자동으로 가져오려 했으나
대부분의 외부 사이트가 봇 요청을 차단해 이미지 로드 실패.

**원인**
- 서버사이드에서 `<meta property="og:image">` 파싱 시도
- User-Agent 봇 차단 및 CORS 정책으로 응답 거부

**해결**
- SQL `UPDATE` 문으로 20개 레코드에 직접 Unsplash 이미지 URL 할당
- 위스키별 분위기에 맞는 이미지를 수동 큐레이션
- `thumbnailUrl` 필드 값이 있으면 본문 첫 번째 `###` 섹션 직전에 자동 삽입

---

## 4. 정렬 오류 — 오래된 글이 상단에 노출

**발생 상황**
칼럼 목록에서 2018년에 발행된 Bourbon Culture 글이 최상단에 표시됨.

**원인**
`findAllByOrderByCreatedAtDesc` 사용 — DB 삽입 시각(`createdAt`) 기준 정렬이었으나
데이터 마이그레이션 순서 때문에 오래된 글의 `createdAt`이 최신으로 기록됨.

**해결**
Repository 메서드를 `findAllByOrderByPublishedAtDescCreatedAtDesc`로 변경.
`publishedAt`(원문 발행일) 우선, 동일 날짜는 `createdAt` 보조 정렬.

```java
// Before
Page<WhiskeyColumn> findAllByOrderByCreatedAtDesc(Pageable pageable);

// After
Page<WhiskeyColumn> findAllByOrderByPublishedAtDescCreatedAtDesc(Pageable pageable);
```

---

## 5. 다크 테마에서 텍스트 색상이 보이지 않음

**발생 상황**
칼럼 상세 페이지에서 본문 텍스트가 배경과 구분되지 않아 읽기 어려움.
배경: `#0c0c0f` (거의 검정), 텍스트: `#333` `#111` `#444` (어두운 회색).

**원인**
`ReactMarkdown` 컴포넌트 커스텀 스타일에 하드코딩된 라이트 테마 색상 사용.

**해결**
CSS 변수로 전환:

| 적용 위치 | 변경 전 | 변경 후 |
|-----------|---------|---------|
| 본문 텍스트 | `#333`, `#111` | `var(--wf-text)` (#ececf0) |
| 보조 텍스트 | `#666`, `#999` | `var(--wf-muted)` (#8b8b96) |
| 소제목 (h3) | `#444` | `var(--wf-accent)` (#c9a227, 골드) |
| 링크 | blue | `var(--wf-accent)` |
| 인용구 border | gray | `var(--wf-accent)` |
| 구분선 | `#ccc` | `var(--wf-border)` (#2e2e38) |

---

## 6. SQL 중복 삽입 오류 (Duplicate entry)

**발생 상황**
`whiskey_columns_insert.sql` 재실행 시 `ERROR 1062 (23000): Duplicate entry` 발생.

**원인**
이미 이전 세션에서 해당 SQL이 실행되어 20개 레코드가 존재하는 상태였음.

**해결**
재삽입하지 않고 현재 데이터 확인 후 그대로 사용:
```sql
SELECT COUNT(*) FROM whiskey_columns;  -- 20 (정상)
```

---

## 7. `fetchColumns` 함수명 충돌

**발생 상황**
`communityApi.ts`에서 커뮤니티 게시판 칼럼(`/community/columns`)과
위스키 칼럼(`/columns`) 양쪽에 `fetchColumns` 함수가 필요해 이름이 겹침.

**원인**
두 도메인이 동일한 파일 내에 공존하면서 함수명이 충돌.

**해결**
위스키 칼럼 함수만 prefix를 추가해 구분:
```ts
// 커뮤니티 게시판 칼럼 (기존 유지)
fetchColumns()          → GET /community/columns

// 위스키 칼럼 (신규 추가, 이름 구분)
fetchWhiskeyColumns()   → GET /columns
fetchWhiskeyColumn(id)  → GET /columns/{id}
```

---

## 8. `feed` / `column` 용어 혼재

**발생 상황**
커뮤니티 칼럼 도메인 전반에 `feed`라는 용어가 사용되어 라운지 기능의 `feed`와 혼동.

**원인**
RSS 크롤링 → `content_feeds` 테이블 → `ContentFeed` 엔티티 → `FeedList` 컴포넌트 순으로
초기 개발 시 `feed`로 명명한 것이 전파됨.

**해결 범위**

| 계층 | 변경 전 | 변경 후 |
|------|---------|---------|
| DB 테이블 | `content_feeds` | `whiskey_columns` |
| BE 패키지 | `domain/community/feed/` | `domain/community/column/` |
| BE 엔티티 | `ContentFeed`, `FeedSourceType` | `WhiskeyColumn`, `ColumnSourceType` |
| BE API | `POST /api/v1/admin/feeds`, `GET /api/v1/feeds` | `POST /api/v1/admin/columns`, `GET /api/v1/columns` |
| FE 타입 | `ContentFeedResponse` | `WhiskeyColumnResponse` |
| FE 훅 | `useFeeds`, `useFeed` | `useWhiskeyColumns`, `useWhiskeyColumn` |
| FE 쿼리키 | `communityKeys.feeds`, `.feed` | `communityKeys.columns`, `.column` |
| FE 컴포넌트 | `FeedList.tsx`, `FeedDetailPage.tsx` | `ColumnList.tsx`, `ColumnDetailPage.tsx` |
| FE 라우트 | `/community/feeds/:feedId` | `/community/columns/:columnId` |

**규칙 (이후 개발 시 준수)**
- `feed` 용어는 라운지(`/lounge`) 기능 전용
- 커뮤니티 위스키 칼럼은 `column` 사용

---

## 9. 이미지 크기 및 위치 조정

**발생 상황**
칼럼 본문 상단에 이미지가 삽입되어 글 흐름을 방해함.
이미지 크기가 너무 커서 본문 읽기에 어려움.

**해결**
- 삽입 위치: 첫 번째 `###` 섹션 직전 (도입부 다음, 본문 중간)
- 크기: `width: 40%, minWidth: 160px`
- 정렬: `display: flex, justifyContent: center`
- 스타일: `borderRadius: 10, boxShadow: 0 2px 12px rgba(0,0,0,0.40)`

```ts
function injectImageIntoMarkdown(markdown: string, imageUrl: string): string {
  const h3Match = markdown.search(/\n###\s/);
  if (h3Match !== -1)
    return markdown.slice(0, h3Match) + `\n\n![](${imageUrl})\n` + markdown.slice(h3Match);
  // fallback: 두 번째 빈 줄 이후
  ...
}
```

---

## 10. Flyway 마이그레이션 버전 번호 중복 충돌

**발생 상황**
배포 서버 기동 시 애플리케이션이 시작 단계에서 바로 크래시.
로그:
```
Found more than one migration with version 27
```

**원인**
서로 다른 브랜치에서 작업한 팀원들이 동일한 버전 번호(`V27`)를 사용한 SQL 파일을 각자 생성해 `main`에 병합. Flyway는 버전이 중복되면 무조건 기동을 거부한다.

동일한 사고가 2회 발생:
1. `V27__tag_images.sql` vs 우리 팀의 `V27__seed_post_whiskeys.sql`
2. `V27__tag_images.sql` vs 다른 팀원의 `V27__whiskey_aliases_final.sql`

**해결**
중복된 우리 측 파일을 `git mv`로 비어 있는 가장 높은 버전 번호로 리네임 후 재커밋:
```bash
git mv V27__seed_post_whiskeys.sql V32__seed_post_whiskeys.sql
git mv V27__whiskey_aliases_final.sql V33__whiskey_aliases_final.sql
```

**예방 규칙**
새 마이그레이션 파일 생성 전 반드시 `main` 브랜치 기준으로 현재 최고 버전을 확인:
```bash
ls backend/src/main/resources/db/migration/ | sort -V | tail -5
```
PR 머지 타이밍이 겹치면 충돌이 발생할 수 있으므로, 버전 번호는 PR 머지 직전에 확정하는 것을 권장.

---

## 11. 배포 환경에서 자유게시판 댓글이 칼럼 게시글에 표시되는 문제

**발생 상황**
로컬에서는 자유게시판 게시글에 댓글이 정상적으로 달려 있으나, 배포 환경에서 동일한 댓글이 칼럼 게시글에 표시됨. 자유게시판 조회수도 0으로 표시.

**원인**
`V25__seed_free_board_posts.sql`에서 자유게시판 게시글을 `INSERT IGNORE INTO posts`로 삽입할 때 명시적 ID 없이 auto_increment에 의존함.

로컬과 배포 환경에서 `V11__seed_column_posts.sql` 실행 시 `whiskey_columns` 테이블의 행 수가 달라 COLUMN 게시글 수(= auto_increment 시작 오프셋)가 달랐고, 결과적으로 V25 자유게시판 게시글이 로컬(ID 45~69)과 배포(다른 ID)에서 서로 다른 ID를 할당받았다.

`V26__seed_comments_and_viewcounts.sql`은 로컬 기준 ID(45~69)를 하드코딩했기 때문에, 배포 DB에서는 해당 ID가 COLUMN 게시글을 가리켜 댓글과 조회수가 잘못된 게시글에 적용됨. `V30`(카테고리), `V32`(post_whiskeys)도 동일한 원인으로 영향받음.

**해결**
`V34__fix_free_post_references.sql` 마이그레이션 추가:
```sql
-- 첫 번째 FREE 게시글의 실제 ID를 title로 조회하여 오프셋 계산
SET @actual_start = (
  SELECT id FROM posts
  WHERE post_type = 'FREE'
    AND title = '위스키 처음 시작하는데 뭐부터 마셔야 할까요?'
  LIMIT 1
);
SET @offset = IFNULL(@actual_start, 45) - 45;

-- 오프셋이 0이면 로컬 환경 → 변경 없음
UPDATE post_comments SET post_id = post_id + @offset
WHERE post_id BETWEEN 45 AND 69 AND @offset <> 0;
```
조회수·카테고리는 title 기반으로 재적용하여 환경 무관하게 항상 정확히 적용.

**예방 규칙**
시드 데이터에서 다른 시드 데이터를 참조할 때는 하드코딩된 ID 대신 title/unique 컬럼 기반 서브쿼리를 사용:
```sql
-- 나쁜 예
UPDATE posts SET view_count = 524 WHERE id = 45;

-- 좋은 예
UPDATE posts SET view_count = 524
WHERE post_type = 'FREE' AND title = '위스키 처음 시작하는데 뭐부터 마셔야 할까요?';
```
