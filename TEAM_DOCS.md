# 🥃 WhiskeyNote 프로젝트 기술 문서

## 👥 팀원별 주요 담당

| GitHub ID | 주요 역할 |
|-----------|-----------|
| **skyun-ui** | 프론트 UI/UX 전체, 캐비넷, CI/CD 인프라 |
| **GyuSikYoon** | 커뮤니티 백+프론트 연동, 설문 API 연동, 검색 버그픽스, 크롤러 피드 |
| **Mi-no-Kim** | 위스키 추천 알고리즘, 설문 백엔드, 추천 페이지 |
| **minguk0825 / 김민국** | 위스키 검색(ES), 상세 API, 리뷰 기능, 테이스팅 노트 |
| **최준열** | 회원인증, 위시리스트, 위스키 등록 요청, 초기 설정 |
| **cjy** | PR 머지 관리, 캐비넷 연동 |

---

## 🔙 백엔드

### 1. 회원/인증 (담당: 최준열)

**기능:** 회원가입, 로그인, 로그아웃, OAuth 소셜로그인, JWT 토큰 재발급

**핵심 API**
```
POST /api/v1/auth/register                      # 회원가입
POST /api/v1/auth/login                         # 로그인 → accessToken + refreshToken 발급
POST /api/v1/auth/logout                        # RefreshToken 서버 폐기
POST /api/v1/auth/refresh                       # 토큰 재발급
POST /api/v1/auth/oauth/{provider}/callback     # 소셜로그인 (Google 등)
```

**핵심 구조**
```java
// JwtUserPrincipal — 모든 인증 엔드포인트에서 사용자 식별
record JwtUserPrincipal(Long userId, String role)

// 응답 공통 구조
record AuthData {
    String accessToken, refreshToken;
    Long userId;
    boolean isNewUser;   // true면 온보딩 페이지 자동 이동
    String nickname, role;
}
```

**특이사항**
- `isNewUser` 플래그로 첫 로그인 시 온보딩 페이지 자동 분기
- logout은 서버 RefreshToken 폐기만 담당, 클라이언트 localStorage clear는 프론트에서 처리
- `SecurityUserAccessor.requireUserId()`로 모든 인증 필요 엔드포인트에서 userId 추출

---

### 2. 위스키 검색/상세 (담당: 김민국)

**기능:** 전체 조회, 키워드 검색(Elasticsearch), 필터링, 상세 정보, 향/맛 태그, 유사 위스키 추천

**핵심 API**
```
GET  /api/v1/whiskeys                           # 전체 목록 (페이징)
GET  /api/v1/whiskeys/search?keyword=           # ES 키워드 검색
GET  /api/v1/whiskeys/{id}                      # 상세 조회 (노트 캐시 + 태그 포함)
GET  /api/v1/whiskeys/{id}/similar              # 유사 위스키 추천 (최대 3개)
GET  /api/v1/whiskeys/{id}/related-posts        # 관련 게시글 (좋아요순 3개)
POST /api/v1/admin/whiskeys/search/reindex      # ES 인덱스 재생성 (어드민)
```

**핵심 구조**
```java
// Elasticsearch Document
// 주의: @Id는 반드시 org.springframework.data.annotation.Id 사용
//       jakarta.persistence.Id 사용 시 인덱싱 오류 발생
@Document(indexName = "whiskeys")
class WhiskeyDocument {
    @Id  // org.springframework.data.annotation.Id
    private String id;
    private String name, region, country, type;
}

// 검색 서비스 핵심 로직
public Page<WhiskeyCardResponse> searchByKeyword(String keyword, int page, int size) {
    if (keyword == null || keyword.isBlank())
        return whiskeyRepository.findAll(pageRequest).map(WhiskeyCardResponse::from);
    return whiskeySearchRepository.findByNameContaining(keyword, pageRequest)
            .map(WhiskeySearchMapper::toCardResponse);
}
```

**특이사항**
- ES 9.2.8 + Spring Data Elasticsearch 6.x 조합
- `@Id` 어노테이션 import 실수 수정 이력 있음 (Fix#176)
- 브랜드 키워드 오타교정 기능 내장 (`BRAND_KEYWORDS` 리스트 기반)
- `whiskeys_note_cache` 테이블: 리뷰 집계값 미리 캐싱 (1~9 척도 합산값 저장)
- `@Profile("!test")` 적용 — 테스트 환경에서는 ES 서비스 빈 미등록

---

### 3. 취향 설문 & 위스키 추천 (담당: Mi-no-Kim)

**기능:** 5단계 설문 → 플레이버 벡터 생성 → 코사인+자카드 유사도 추천 → 유저 타입 분류

**핵심 API**
```
POST /api/v1/taste/survey         # 설문 계산 (비저장, 결과만 반환)
POST /api/v1/taste/survey/save    # 설문 계산 + 취향 프로필 저장 (JWT 필요)
GET  /api/v1/taste/survey/me      # 저장된 내 취향 프로필 + 추천 재계산
```

**핵심 알고리즘**
```java
// 1. 선택지 → 0~100 정규화
int choiceToScore(int choice) {
    return switch(choice) {
        case 1 -> 0; case 2 -> 25; case 3 -> 50;
        case 4 -> 75; default -> 100;
    };
}

// 2. DB 캐시값 정규화 (테이스팅노트 1~9 척도 → 0~100)
double normalize(Long sum, int count) {
    double avg = (double) sum / count;
    return Math.max(0, Math.min(100, (avg - 1) / 8.0 * 100));
}

// 3. 최종 추천 점수 = 코사인 50% + 자카드 50%
double flavorSim = cosineSimilarity(userVec, whiskeyVec);       // 방향 유사도
double tagSim    = jaccardSimilarity(userTagIds, whiskeyTagIds); // 태그 겹침
double score     = 0.5 * flavorSim + 0.5 * tagSim;

// 4. 점수 상위 3개 반환
sorted.stream().limit(3)
```

**유저 타입 분류 기준 (우선순위 순)**
```
smoky ≥ 75                   → 🔥 피트 탐험가
sweet ≥ 75 && body ≥ 50      → 🍯 달콤한 버번파
finish ≥ 75 && smoky < 50    → 🍎 과일향 싱글몰트파
body ≥ 75 && spicy ≥ 50      → 🥃 묵직한 셰리파
else                          → ⚖️ 균형잡힌 미각파
```

**특이사항**
- 추천 결과는 DB에 저장하지 않음 — 점수+태그 IDs만 저장 후 조회마다 재계산
- 따라서 위스키 데이터가 추가되면 동일 프로필로도 다른 위스키가 추천될 수 있음
- `getMyProfile()` 호출 시 매번 전체 whiskeys_note_cache 스캔 후 재추천

---

### 4. 캐비넷 — Pick & Wish (담당: 최준열)

**기능:** My Pick(추천 위스키 보관), 위시리스트(마시고 싶은 위스키, 폴더 기반 관리), 통계 집계

**핵심 API**
```
# Pick
GET    /api/v1/users/{userId}/picks                  # Pick 목록 (타인 조회 가능, 비로그인 허용)
GET    /api/v1/whiskeys/{whiskeyId}/pick             # 픽 여부 확인 (JWT 필요)
POST   /api/v1/whiskeys/{whiskeyId}/pick             # 픽 추가
DELETE /api/v1/whiskeys/{whiskeyId}/pick             # 픽 제거

# Wish (폴더 기반)
GET    /api/v1/users/me/wishlists                    # 내 폴더 목록
POST   /api/v1/users/me/wishlists                    # 폴더 생성
PATCH  /api/v1/users/me/wishlists/folders/{id}       # 폴더명 수정
PATCH  /api/v1/users/me/wishlists/folders/reorder    # 폴더 순서 변경
DELETE /api/v1/users/me/wishlists/folders/{id}       # 폴더 삭제 (내부 아이템 전체 삭제)
GET    /api/v1/users/me/wishlists/{folderId}/items   # 폴더 내 위시 목록
GET    /api/v1/whiskeys/{id}/wish/folders            # 특정 위스키가 담긴 폴더 ID 목록
POST   /api/v1/whiskeys/{whiskeyId}/wish             # 위시 추가 (?folderId=)
DELETE /api/v1/whiskeys/wish/{wishItemId}            # 위시 제거
PATCH  /api/v1/users/me/wishlists/items/{id}/move   # 폴더 간 아이템 이동

# 캐비넷 통계
GET    /api/v1/users/{userId}/cabinet/stats          # picks + wish + review + note 수 집계
```

**핵심 구조**
```java
// 캐비넷 통계 서비스
public CabinetStatsResponse getStats(Long userId) {
    Long pickCount   = pickRepository.countByUserId(userId);
    Long wishCount   = wishListItemRepository.countByUserId(userId);
    Long reviewCount = reviewRepository.countByUserId(userId);
    Long noteCount   = tastingNoteRepository.countByUserId(userId);
    return new CabinetStatsResponse(pickCount, wishCount, reviewCount, noteCount);
}
```

**DB 구조**
```
my_picks          : id, user_id, whiskey_id, created_at
wish_list_folders : id, user_id, name, sort_order
wish_list_items   : id, folder_id, whiskey_id, created_at
```

---

### 5. 커뮤니티 (담당: GyuSikYoon)

**기능:** 게시글 CRUD, 댓글·대댓글, 좋아요, 게시판 타입별 분리(공지/칼럼/자유/QnA)

**핵심 API**
```
GET    /api/v1/community/columns                # 칼럼 목록 (페이징)
GET    /api/v1/community/free                   # 자유게시판 목록
GET    /api/v1/community/notices                # 공지 목록
POST   /api/v1/posts                            # 게시글 작성
PATCH  /api/v1/posts/{id}                       # 게시글 수정
DELETE /api/v1/posts/{id}                       # 게시글 삭제 (소프트 딜리트)
POST   /api/v1/posts/{id}/like                  # 게시글 좋아요
DELETE /api/v1/posts/{id}/like                  # 좋아요 취소
POST   /api/v1/posts/{postId}/comments          # 댓글 작성
DELETE /api/v1/posts/{postId}/comments/{id}     # 댓글 삭제
GET    /api/v1/whiskeys/{id}/related-posts      # 위스키 관련 게시글 (좋아요순 3개)
```

**핵심 구조**
```java
// 게시판 타입 구분
enum PostType { NOTICE, COLUMN, QA, FREE, FEED }

// Post 엔티티 — 소프트 딜리트 방식
class Post {
    Long authorId;
    PostType postType;
    PostCategory category;
    String title, context;
    int likeCount;
    boolean isDeleted;
    LocalDateTime deletedAt;
}

// 위스키-게시글 연결 테이블 (관련 칼럼 기능의 핵심)
class PostWhiskey { Long postId, whiskeyId; }

// 관련 게시글 조회 — 좋아요순 상위 3개
public List<PostSummaryResponse> getRelatedPosts(Long whiskeyId) {
    List<Long> postIds = postWhiskeyRepository
            .findTopPostIdsByWhiskeyId(whiskeyId, PageRequest.of(0, 3));
    ...
}
```

---

### 6. 리뷰 (담당: 김민국)

**기능:** 위스키 리뷰 CRUD, 리뷰 좋아요, 별점 평균 표시

**핵심 API**
```
GET    /api/v1/reviews?userId=                  # 내 리뷰 목록 (페이징)
GET    /api/v1/whiskeys/{id}/reviews            # 위스키별 리뷰 목록
POST   /api/v1/whiskeys/{id}/reviews            # 리뷰 작성
PATCH  /api/v1/reviews/{id}                     # 리뷰 수정
DELETE /api/v1/reviews/{id}                     # 리뷰 삭제
POST   /api/v1/reviews/{id}/likes               # 리뷰 좋아요
DELETE /api/v1/reviews/{id}/likes               # 좋아요 취소
```

**핵심 구조**
```java
// 리뷰 저장 요청
record ReviewSaveRequest {
    double rating;       // 별점
    String publicText;   // 공개 리뷰 내용
    Long attachedNoteId; // 테이스팅 노트 연결 (선택)
}

// 좋아요 응답
record ReviewLikeResponse {
    Long reviewId;
    int likeCount;
    boolean likedByMe;
}
```

**특이사항**
- 리뷰 작성 시 테이스팅 노트 연결 가능 (`attachedNoteId`)
- 위스키 상세 페이지에서 연결된 노트를 "My Note 자세히" 버튼으로 펼쳐보기 가능

---

### 7. 테이스팅 노트 (담당: 김민국)

**기능:** 위스키별 개인 노트 CRUD, 향/맛/피니시 점수 기록, 태그 선택, 임시저장

**핵심 API**
```
GET    /api/v1/whiskeys/{id}/notes/my           # 위스키별 내 노트 단건 조회
GET    /api/v1/tasting-notes/my                 # 전체 내 노트 목록 (페이징)
GET    /api/v1/tasting-notes/{noteId}           # 노트 단건 조회
POST   /api/v1/tasting-notes                    # 노트 작성
PATCH  /api/v1/tasting-notes/{noteId}           # 노트 수정
DELETE /api/v1/tasting-notes/{noteId}           # 노트 삭제
```

**핵심 구조**
```java
// 노트 저장 요청
record TastingNoteSaveRequest {
    Long whiskeyId;
    int bodyScore, finishScore, smokyScore, spicyScore, sweetScore; // 1~9 척도
    String memo;
    boolean isDraft;   // true = 임시저장, false = 공개
    List<Long> tagIds; // 향/맛 태그 IDs
}

// 노트 태그 (category로 nose/taste/finish 구분)
record TastingNoteTag {
    Long id;
    String category; // "nose" | "taste" | "finish"
    String name;
    String imageUrl;
}
```

**특이사항**
- `isDraft: true` = 임시저장 상태 (본인만 조회 가능)
- 노트 점수가 `whiskeys_note_cache`에 집계되어 위스키 상세의 "유저 평균" 표시에 활용

---

### 8. 위스키 등록 요청 (담당: 최준열)

**기능:** 일반 사용자가 신규 위스키 등록 요청, 관리자가 승인/거절 처리

**핵심 API**
```
# 사용자
GET    /api/v1/whiskey-requests                      # 내 요청 목록 (?status=)
GET    /api/v1/whiskey-requests/{id}                 # 요청 상세
POST   /api/v1/whiskey-requests                      # 요청 등록
PATCH  /api/v1/whiskey-requests/{id}                 # 요청 수정
DELETE /api/v1/whiskey-requests/{id}                 # 요청 삭제

# 관리자 (ADMIN 역할 필요)
GET    /api/v1/admin/whiskey-requests                # 전체 요청 목록
PATCH  /api/v1/admin/whiskey-requests/{id}/review    # 승인/거절
```

**상태 흐름**
```
PENDING → APPROVED
        → REJECTED
```

---

### 9. 크롤러 콘텐츠 피드 (담당: GyuSikYoon)

**기능:** 외부 크롤러(블로그/YouTube)가 수집한 콘텐츠를 DB에 저장, 위스키별 관련 피드 조회

**핵심 API**
```
POST /api/v1/admin/feeds                     # 크롤러 → 백엔드 데이터 전송
GET  /api/v1/feeds                           # 전체 피드 목록 (페이징)
GET  /api/v1/feeds/related?keyword=위스키명   # 위스키 이름으로 관련 피드 검색 (최대 5개)
```

**핵심 구조**
```java
// ContentFeed 엔티티
@Entity @Table(name = "content_feeds")
class ContentFeed {
    FeedSourceType sourceType; // BLOG | YOUTUBE
    String title;
    String url;
    String thumbnailUrl;
    String description;
    String whiskeyKeyword; // 위스키 이름으로 관련 피드 필터링
    LocalDateTime publishedAt;
    LocalDateTime createdAt;
}

// 크롤러 요청 형식
record ContentFeedRequest {
    FeedSourceType sourceType;
    String title, url, thumbnailUrl, description;
    String whiskeyKeyword;
    LocalDateTime publishedAt;
}
```

**DB 구조**
```sql
content_feeds (
  id              BIGINT PK AUTO_INCREMENT,
  source_type     ENUM('BLOG','YOUTUBE') NOT NULL,
  title           VARCHAR(512) NOT NULL,
  url             VARCHAR(1024) NOT NULL,
  thumbnail_url   VARCHAR(1024),
  description     TEXT,
  whiskey_keyword VARCHAR(255),
  published_at    DATETIME,
  created_at      DATETIME NOT NULL
)
```

---

### 10. CI/CD & 인프라 (담당: skyun-ui)

**구성**
```
GitHub Actions → ECR (Docker 이미지 빌드/푸시) → EC2 SSH 자동 배포
RDS(MySQL) + S3(이미지 저장) + Elasticsearch (Docker)
```

**주요 작업**
- GitHub Actions 워크플로: 빌드 → ECR push → EC2 SSH 배포
- 배포 헬스체크 + RDS 스키마 마이그레이션 자동화 스크립트
- S3 버킷 IAM 정책 템플릿 관리 (`env.example` 포함)
- Docker Compose 로컬/운영 환경 분리 (`docker-compose.local.yml`)
- CI 오류 메시지 개선 (RDS 스키마 미반영 시 명확한 에러 출력)

---

## 🖥️ 프론트엔드

### 기술 스택

```
React 18 + TypeScript + Vite
React Router v6 (Feature-based routing)
TanStack Query (서버 상태 관리)
Axios (API 클라이언트, JWT 인터셉터)
html2canvas (추천 결과 이미지 저장)
```

### 아키텍처: Feature-based 구조

```
src/
├── app/
│   ├── router/          # 라우트 정의, paths.ts
│   └── providers/       # QueryClient, Router 등 전역 Provider
├── features/
│   ├── auth/            # 로그인·회원가입·OAuth 콜백
│   ├── whiskey/         # 위스키 상세·리뷰 목록·태그 버블
│   ├── search/          # 키워드 검색 페이지
│   ├── survey/          # 취향 설문
│   ├── recommendation/  # 추천 결과 페이지
│   ├── cabinet/         # 캐비넷 (Pick·Wish·통계·팔로우)
│   ├── community/       # 게시판 전체 (칼럼·자유·공지·QnA)
│   ├── tasting-note/    # 테이스팅 노트
│   ├── review/          # 리뷰 작성
│   ├── admin/           # 관리자 위스키 요청 관리
│   └── profile/         # 타인 캐비넷 조회
└── shared/
    ├── api/             # Axios 클라이언트, 공통 타입
    ├── components/      # 공통 UI 컴포넌트
    └── lib/             # 유틸 함수 (mediaUrl, authSession 등)
```

---

### 전체 페이지 라우트

```
/                                # 랜딩 페이지
/login                           # 로그인
/register                        # 회원가입
/oauth/:provider/callback        # 소셜로그인 콜백
/onboarding                      # 온보딩 (신규 가입자)
/survey                          # 취향 설문
/recommend                       # 추천 결과
/lounge                          # 라운지 (홈)
/search                          # 위스키 검색
/whiskey/:whiskeyId              # 위스키 상세
/whiskey/:whiskeyId/reviews      # 위스키 전체 리뷰
/whiskey/:whiskeyId/reviews/write  # 리뷰 작성
/whiskey/:whiskeyId/note         # 테이스팅 노트 작성
/note/pick                       # 노트용 위스키 선택
/cabinet                         # 내 캐비넷
/cabinet/follow                  # 팔로워/팔로잉
/user/:userId                    # 타인 캐비넷
/community                       # 커뮤니티
/community/columns               # 칼럼 목록
/community/free                  # 자유게시판
/community/notices               # 공지사항
/community/posts/:postId         # 게시글 상세
/community/posts/new             # 게시글 작성
/community/posts/:id/edit        # 게시글 수정
/whiskey-requests                # 위스키 등록 요청 목록
/whiskey-requests/:id            # 요청 상세
/admin                           # 관리자 페이지
/discover/taste-match            # 취향 매칭
/error/404                       # 404 페이지
/error/500                       # 서버 에러 페이지
```

---

### Axios 클라이언트 (shared/api/client.ts)

```ts
// 요청 인터셉터 — accessToken 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터 핵심 동작 3가지

// ① 비로그인 허용 공개 경로는 401이어도 로그인 리다이렉트 안 함
const PUBLIC_READ_PATH = /^\/users\/\d+\/(picks|cabinet\/stats)|^\/reviews/;

// ② 동시에 여러 요청이 401 뜰 때 → 큐에 대기 → 재발급 완료 후 일괄 재시도
let isRefreshing = false;
let failedQueue = [];

// ③ RefreshToken도 만료 → localStorage.clear() + /login 강제 이동
// ④ 500+ 에러 → /error/500 자동 이동
if (error.response?.status >= 500) window.location.href = '/error/500';
```

---

### 주요 페이지 상세

#### 위스키 상세 (WhiskeyDetailPage) — 담당: skyun-ui + GyuSikYoon

```tsx
// 핵심 상태 (모두 이른 return 이전에 선언 — React hooks 규칙)
const [isPicked, setIsPicked] = useState(false);
const [isWished, setIsWished] = useState(false);
const [imgError, setImgError] = useState(false);   // S3 이미지 로드 실패 fallback
const [wishModalOpen, setWishModalOpen] = useState(false);

// 이미지 폴백 처리
{imageSrc && !imgError
  ? <img onError={() => setImgError(true)} ... />
  : <div className="wf-placeholder" />}

// 탭 구조: 정보 / 리뷰 / 개인 노트
// 우측 사이드바: 위시리스트 / My Pick / 리뷰 작성 / My Note 작성 버튼
```

#### 취향 설문 (SurveyPage) — 담당: GyuSikYoon + Mi-no-Kim

```tsx
// 5개 슬라이더 (선택지 1~5)
// 코 태그 17개 + 미각 태그 12개 — 실제 DB ID로 매핑
// 코: 시트러스(1), 베리류(2), 꽃(3), 허브(4), 곡물(5) ... 피트(17), 흙(18), 가죽(16)
// 미각: 시트러스(101), 베리류(102) ... 피트(112), 짠맛(114)

const payload: SurveyApiRequest = {
  sweetChoice, bodyChoice, smokyChoice, spicyChoice, finishChoice,
  noseTags,   // number[] — DB tag ID
  tasteTags,  // number[] — DB tag ID
};
const result = await surveyApi.submit(payload);
navigate(PATHS.RECOMMEND, { state: { result, payload } });
```

#### 추천 결과 (RecommendationPage) — 담당: Mi-no-Kim + GyuSikYoon

```tsx
// navigation state에서 결과 수신
const { result, payload } = location.state as {
  result: SurveyResult, payload: SurveyApiRequest
};

// 유저 타입 + 플레이버 점수 바 표시 (0~100%)
// 추천 위스키 3개 카드 (rank, whiskeyName, score, reason)

// 취향 반영하기 버튼 — JWT 필요
const handleApply = async () => {
  if (!isLoggedIn()) { navigate(PATHS.LOGIN); return; }
  await surveyApi.save(payload); // POST /taste/survey/save
};

// 결과 이미지 저장 (html2canvas)
await saveResultImage(result);
```

#### 캐비넷 (CabinetPage) — 담당: 최준열 + skyun-ui

```tsx
// 탭: Pick / 위시리스트 / 리뷰 / 노트 / 팔로워·팔로잉
// 타인 캐비넷: /user/:userId (비로그인도 픽·통계 조회 가능)
// CabinetStatsBar: pick수, wish수, 리뷰수, 노트수

// 위시 폴더 선택 모달
<WishFolderModal
  whiskeyId={Number(id)}
  onClose={() => setWishModalOpen(false)}
  onSuccess={() => setIsWished(true)}
/>
```

#### 검색 (SearchPage) — 담당: 김민국 + skyun-ui

```tsx
// ES 키워드 검색 + 타입/국가/도수 필터
// 이미지 에러 상태를 Set으로 카드별 개별 관리
const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

{thumbSrc && !imgErrors.has(whiskey.id)
  ? <img onError={() =>
      setImgErrors(prev => new Set(prev).add(whiskey.id))} ... />
  : <div className="wf-placeholder" />}
```

#### 커뮤니티 — 담당: GyuSikYoon

```tsx
// CommunityPage → 탭: 칼럼 / 자유게시판 / 공지 / QnA
// PostFormPage → RichEditor 기반 글 작성 + 위스키 태그 연결
// CommentItem → 대댓글 트리 구조 렌더링
// Pagination 컴포넌트 독립 분리
```

#### 관리자 (AdminPage) — 담당: 최준열

```tsx
// 위스키 등록 요청 목록 / 상세 / 승인·거절
// ADMIN 역할 JWT 없으면 접근 불가 (라우트 가드)
// WhiskeyRequestModal 컴포넌트로 승인/거절 처리
```

---

### 공통 컴포넌트 (shared/) — 담당: skyun-ui

| 컴포넌트 | 역할 |
|----------|------|
| `Button` | variant(ghost/filled), `to` prop으로 Link 겸용 |
| `Toast` | 성공/에러/정보 토스트 메시지 |
| `ConfirmToast` | 확인/취소 선택 토스트 |
| `PageLoader` | 전체 화면 로딩 스피너 |
| `PagePlaceholder` | 빈 상태 안내 UI |
| `WireframePage` | 스크롤/고정 레이아웃 래퍼 |
| `UserProfileLink` | userId → 타인 캐비넷 페이지 링크 |
| `TopNav` | 상단 네비게이션 (인증 상태 반응형) |
| `AppFooter` | 하단 푸터 |
| `ErrorPage / NotFoundPage / ServerErrorPage` | 404·500 에러 페이지 |
| `Input` | 공통 인풋 컴포넌트 |

---

### 유틸 함수 (shared/lib/)

```ts
// mediaUrl.ts — S3 이미지 상대경로 → 절대 URL 변환
export function resolveMediaUrl(url?: string | null): string | null

// authSession.ts — 로그인 상태 확인
export function isLoggedIn(): boolean

// userCabinetPath.ts — userId → 캐비넷 경로 생성
export function getUserCabinetPath(userId: number): string
```

---

## 🗄️ DB 핵심 테이블 구조

| 테이블 | 설명 |
|--------|------|
| `users` | 회원 정보 |
| `whiskeys` | 위스키 마스터 데이터 |
| `whiskeys_note_cache` | 리뷰/노트 집계 캐시 (avg 계산 최적화, 1~9 척도 합산) |
| `tasting_notes` | 개인 테이스팅 노트 (isDraft 포함) |
| `reviews` | 공개 리뷰 + 별점 |
| `review_likes` | 리뷰 좋아요 |
| `tags` | 향/맛 태그 마스터 (category: nose/taste/finish) |
| `posts` | 커뮤니티 게시글 (PostType으로 게시판 구분) |
| `post_whiskeys` | 게시글-위스키 연결 (관련 칼럼 기능) |
| `post_comments` | 댓글 (대댓글 트리 구조) |
| `post_likes` | 게시글 좋아요 |
| `my_picks` | My Pick 목록 |
| `wish_list_folders` | 위시리스트 폴더 |
| `wish_list_items` | 위시리스트 아이템 |
| `user_taste_profiles` | 취향 설문 저장 (점수 5개 + 태그 IDs 콤마 구분 문자열) |
| `whiskey_requests` | 위스키 등록 요청 (PENDING/APPROVED/REJECTED) |
| `content_feeds` | 크롤러 수집 블로그/YouTube 콘텐츠 |
