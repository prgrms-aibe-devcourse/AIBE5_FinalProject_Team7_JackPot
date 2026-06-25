<div align="center">

<img src="https://img.shields.io/badge/-🥃 Whiskey Note-6B3E26?style=for-the-badge" alt="Whiskey Note"/>

**AI 기반 위스키 큐레이션 & 소셜 플랫폼**

개인 취향 분석부터 테이스팅 노트, 라운지 피드, 취향 매칭까지

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=flat-square&logo=elasticsearch&logoColor=white)](https://www.elastic.co/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)

</div>

---

## 📖 목차

- [서비스 소개](#-서비스-소개)
- [핵심 기능](#-핵심-기능)
- [시스템 아키텍처](#-시스템-아키텍처)
- [기술 스택](#-기술-스택)
- [팀원 및 역할](#-팀원-및-역할)
- [API 명세](#-api-명세)
- [화면 구조](#-화면-구조)
- [데이터베이스 설계](#-데이터베이스-설계)
- [Getting Started](#-getting-started)
- [프로젝트 구조](#-프로젝트-구조)
- [트러블슈팅](#-트러블슈팅)
- [개발 로드맵](#-개발-로드맵)

---

## 🥃 서비스 소개

> **Whiskey Note**는 사용자 취향 분석과 음용 데이터를 기반으로 개인에게 최적화된 위스키를 추천하고, 시음 경험을 기록·공유할 수 있는 AI 기반 위스키 큐레이션 플랫폼입니다.

코로나19 이후 홈술·혼술 문화 확산으로 위스키 시장은 빠르게 성장하고 있지만, 제품 종류의 다양성과 전문 용어로 인해 **초보자의 진입장벽이 높은 상황**입니다. 기존 플랫폼은 체계적인 노트 관리와 취향 기반 소셜 기능이 부재합니다.

**Whiskey Note**는 이 문제를 해결합니다.

| 대상 | 문제 | 해결 |
|------|------|------|
| 🔰 입문자 | 어떤 위스키를 골라야 할지 모름 | 취향 설문 → 맞춤 추천 |
| 🥃 애호가 | 시음 경험 기록이 비체계적 | My Note + AI 분석 (Phase 2) |
| 👥 모두 | 취향이 비슷한 사람과 연결되고 싶음 | 라운지 피드 + Taste Match |

---

## ✨ 핵심 기능

### 🎯 취향 분석 & 추천

- **온보딩 설문** — 입문자(간접 질문)와 애호가(향·맛 직접 선택) 분기
- **Flavor Profile** — 설문 결과를 기반으로 생성, 행동 데이터로 지속 보완
- **추천 알고리즘** — 코사인 유사도(50%) + 자카드 유사도(50%) 혼합
- **유저 타입 5종 분류** — 피트 탐험가 / 달콤한 버번파 / 과일향 싱글몰트파 / 묵직한 셰리파 / 균형잡힌 미각파

### 🔍 위스키 탐색

- **Elasticsearch** 기반 키워드 검색 (이름·브랜드·증류소)
- 브랜드 키워드 오타교정 기능 내장
- 종류·향·맛·도수·숙성연수 필터
- 검색 결과 없을 시 **위스키 등록 요청** (UGC)

### 🏠 메인 라운지 (소셜 피드)

- 팔로잉·인기·추천이 혼합된 세로 스크롤 피드
- 오늘의 추천·인기 위스키·취향 비슷한 유저 삽입 카드
- 글 작성·좋아요·댓글·대댓글

### 📋 위스키 상세

- 오피셜 시음 노트 / 유저 평균 토글
- TASTING TAGS 버블 차트 (빈도 = 크기)
- 5각형 레이더 차트 (단맛·피니시·바디·스파이시·스모키)

### 🗄️ 캐비넷 (My Bar)

- Pick·위시리스트(폴더 구조)·리뷰·My Note 통합 관리
- 팔로워·팔로잉·맞팔 목록
- 보틀 쉐어 설정

### 💫 Taste Match

- `flavor_profile_tags` 코사인 유사도 기반 취향 유사 유저 매칭
- 라운지에서만 진입 가능

### 📰 위스키 칼럼

- AI가 작성한 한국어 위스키 칼럼 20개 제공
- ReactMarkdown으로 내부 상세 페이지 렌더링 (외부 URL 이동 없음)
- Unsplash 이미지를 본문 중간에 자동 삽입

### 📝 My Note *(Phase 2)*

- 향·맛 태그 선택 + N/P/F 슬라이더
- 레이더 차트 실시간 반영
- AI 점수·태그 제안

---

## 🏗 시스템 아키텍처

<p align="center">
  <img src="https://github.com/user-attachments/assets/1298b63c-663d-46cf-b147-4168590e571a" width="70%" alt="Image" />
</p>

---

## 🛠 기술 스택

### Backend

| 분류 | 기술 |
|------|------|
| Language | Java 21 |
| Framework | Spring Boot |
| ORM | JPA / Hibernate |
| Database | MySQL |
| Search | Elasticsearch 9.2.8 + Spring Data 6.x |
| Auth | JWT (Access + Refresh Token), OAuth 2.0 (Google) |
| Storage | AWS S3 |

### Frontend

| 분류 | 기술 |
|------|------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| 서버 상태 | TanStack Query |
| HTTP | Axios (JWT 인터셉터 내장) |
| 마크다운 | ReactMarkdown |
| 이미지 저장 | html2canvas |

### DevOps

| 분류 | 기술 |
|------|------|
| Container | Docker |
| CI/CD | GitHub Actions → ECR → EC2 SSH |
| Cloud | AWS (EC2/ECS, RDS, S3, CloudFront, Route 53) |

---

## 👥 팀원 및 역할

| GitHub ID | 이름 | 주요 역할 |
|-----------|------|-----------|
| **minguk0825** | 김민국 | 위스키 검색(Elasticsearch), 상세 API, 리뷰·테이스팅 노트 백엔드 |
| **skyun-ui** | 윤석규 | 프론트 UI/UX 전체, 캐비넷, CI/CD 인프라 (GitHub Actions → AWS) |
| **GyuSikYoon** | 윤규식 | 커뮤니티 백+프론트 연동, 설문 API 연동, 위스키 칼럼, 검색 버그픽스 |
| **Mi-no-Kim** | 김민호 | 위스키 추천 알고리즘 (코사인+자카드), 설문 백엔드, 추천 페이지 |
| **최준열** | 최준열 | 회원인증 (JWT/OAuth), 위시리스트, 위스키 등록 요청, 초기 설정 |
| **cjy** | — | PR 머지 관리, 캐비넷 연동 |

---

## 📡 API 명세

> Base URL: `/api/v1` · 인증: `Authorization: Bearer {access_token}`

<details>
<summary><b>Auth / User</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/auth/register` | 회원가입 | ❌ |
| `POST` | `/auth/login` | 로그인 → accessToken + refreshToken 발급 | ❌ |
| `GET` | `/auth/oauth/{provider}/callback` | 소셜 로그인 (Google) | ❌ |
| `POST` | `/auth/refresh` | 토큰 재발급 | ❌ |
| `POST` | `/auth/logout` | 로그아웃 (서버 RefreshToken 폐기) | ✅ |
| `GET` | `/users/me` | 내 프로필 조회 | ✅ |
| `PATCH` | `/users/me` | 프로필 수정 | ✅ |
| `GET` | `/users/{userId}` | 타인 프로필 조회 | ✅ |
| `DELETE` | `/users/me` | 회원 탈퇴 (soft delete) | ✅ |

</details>

<details>
<summary><b>취향 설문 & 추천</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/taste/survey` | 설문 계산 (비저장, 결과만 반환) | ❌ |
| `POST` | `/taste/survey/save` | 설문 계산 + 취향 프로필 저장 | ✅ |
| `GET` | `/taste/survey/me` | 저장된 내 취향 프로필 + 추천 재계산 | ✅ |
| `GET` | `/recommendations/today` | 오늘의 추천 (1개, 매일 갱신) | ✅ |
| `GET` | `/whiskeys/popular` | 인기 위스키 | ❌ |

</details>

<details>
<summary><b>위스키</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/whiskeys` | 전체 목록 (페이징) | ❌ |
| `GET` | `/whiskeys/search?keyword=` | ES 키워드 검색 | ❌ |
| `GET` | `/whiskeys/{id}` | 위스키 상세 (노트 캐시 + 태그 포함) | ❌ |
| `GET` | `/whiskeys/{id}/similar` | 유사 위스키 추천 (최대 3개) | ❌ |
| `GET` | `/whiskeys/{id}/related-posts` | 관련 게시글 (좋아요순 3개) | ❌ |
| `POST` | `/whiskey-requests` | 위스키 등록 요청 (UGC) | ✅ |
| `POST` | `/admin/whiskeys/search/reindex` | ES 인덱스 재생성 | 🔐 Admin |

</details>

<details>
<summary><b>리뷰 & My Note</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/reviews?userId=` | 내 리뷰 목록 (페이징) | ✅ |
| `GET` | `/whiskeys/{id}/reviews` | 위스키별 리뷰 목록 | ❌ |
| `POST` | `/whiskeys/{id}/reviews` | 리뷰 작성 (테이스팅 노트 첨부 가능) | ✅ |
| `PATCH` | `/reviews/{id}` | 리뷰 수정 | ✅ |
| `DELETE` | `/reviews/{id}` | 리뷰 삭제 | ✅ |
| `POST` | `/reviews/{id}/likes` | 리뷰 좋아요 / 취소 | ✅ |
| `GET` | `/whiskeys/{id}/notes/my` | 위스키별 내 노트 단건 조회 | ✅ |
| `GET` | `/tasting-notes/my` | 전체 내 노트 목록 | ✅ |
| `POST` | `/tasting-notes` | 노트 작성 (isDraft 지원) | ✅ |
| `PATCH` | `/tasting-notes/{noteId}` | 노트 수정 | ✅ |
| `DELETE` | `/tasting-notes/{noteId}` | 노트 삭제 | ✅ |

</details>

<details>
<summary><b>Pick / 위시리스트 / 캐비넷</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/whiskeys/{id}/pick` | Pick 추가 | ✅ |
| `DELETE` | `/whiskeys/{id}/pick` | Pick 해제 | ✅ |
| `GET` | `/users/{userId}/picks` | Pick 목록 (비로그인 허용) | ❌ |
| `GET` | `/users/me/wishlists` | 위시 폴더 목록 | ✅ |
| `POST` | `/users/me/wishlists` | 폴더 생성 | ✅ |
| `PATCH` | `/users/me/wishlists/folders/{id}` | 폴더 이름 변경 | ✅ |
| `PATCH` | `/users/me/wishlists/folders/reorder` | 폴더 순서 변경 | ✅ |
| `DELETE` | `/users/me/wishlists/folders/{id}` | 폴더 삭제 (아이템 전체 삭제) | ✅ |
| `POST` | `/whiskeys/{id}/wish` | 위시 추가 | ✅ |
| `DELETE` | `/whiskeys/wish/{wishItemId}` | 위시 제거 | ✅ |
| `GET` | `/users/{userId}/cabinet/stats` | 캐비넷 통계 (pick·wish·review·note 수) | ❌ |

</details>

<details>
<summary><b>라운지 피드 & 커뮤니티</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/feed` | 라운지 피드 | ✅ |
| `POST` | `/posts` | 글 작성 | ✅ |
| `PATCH` | `/posts/{id}` | 글 수정 | ✅ |
| `DELETE` | `/posts/{id}` | 글 삭제 (soft delete) | ✅ |
| `POST` | `/posts/{id}/like` | 글 좋아요 / 취소 | ✅ |
| `POST` | `/posts/{id}/comments` | 댓글 작성 (대댓글 지원) | ✅ |
| `GET` | `/columns` | 위스키 칼럼 목록 (publishedAt DESC) | ❌ |
| `GET` | `/columns/{id}` | 칼럼 단건 조회 | ❌ |
| `GET` | `/columns/related?keyword=` | 위스키명 기반 관련 칼럼 | ❌ |

</details>

<details>
<summary><b>팔로우 & Taste Match</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/users/{userId}/follow` | 팔로우 | ✅ |
| `DELETE` | `/users/{userId}/follow` | 언팔로우 | ✅ |
| `GET` | `/users/{userId}/followers` | 팔로워 목록 | ✅ |
| `GET` | `/users/{userId}/following` | 팔로잉 목록 | ✅ |
| `GET` | `/discover/taste-match` | 취향 유사 유저 매칭 | ✅ |

</details>

<details>
<summary><b>신고 & 관리자</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/reports` | 신고 (게시글/댓글/리뷰/유저) | ✅ |
| `GET` | `/admin/whiskey-requests` | 등록 요청 목록 | 🔐 Admin |
| `PATCH` | `/admin/whiskey-requests/{id}/review` | 등록 요청 승인/반려 | 🔐 Admin |
| `GET` | `/admin/reports` | 신고 목록 | 🔐 Admin |
| `GET` | `/admin/users` | 회원 관리 | 🔐 Admin |

</details>

---

## 🗺 화면 구조

```
/                                # 랜딩 페이지
/login                           # 로그인
/register                        # 회원가입
/oauth/:provider/callback        # 소셜로그인 콜백
/onboarding                      # 온보딩 (신규 가입자)
/survey                          # 취향 설문
/recommend                       # 추천 결과
/lounge                          # 라운지 (홈) ★
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
/community/columns/:columnId     # 칼럼 상세
/community/posts/:postId         # 게시글 상세
/whiskey-requests                # 위스키 등록 요청 목록
/admin                           # 관리자 페이지
/discover/taste-match            # 취향 매칭 ★
/error/404                       # 404 페이지
/error/500                       # 서버 에러 페이지
```

---

## 🗃 데이터베이스 설계

<details>
<summary><b>주요 테이블 목록</b></summary>

| 테이블 | 설명 |
|--------|------|
| `users` | 회원·인증 (`uid`, `email`, `auth_provider`, `nickname`, `role`, `is_deleted`) |
| `whiskeys` | 위스키 카탈로그 (이름, 브랜드, 타입, 도수, 숙성연수 등) |
| `whiskeys_note_cache` | 리뷰/노트 집계 캐시 (avg 계산 최적화, 1~9 척도 합산값 저장) |
| `tasting_notes` | 개인 테이스팅 노트 (`isDraft` 포함) |
| `reviews` | 공개 리뷰 (별점, 한줄평, My Note 첨부 참조) |
| `review_likes` / `post_likes` | 좋아요 |
| `tags` | 향/맛 태그 마스터 (category: nose/taste/finish, 총 29개) |
| `my_picks` | My Pick 목록 |
| `wish_list_folders` | 위시리스트 폴더 |
| `wish_list_items` | 위시리스트 아이템 |
| `posts` | 커뮤니티 게시글 (PostType: NOTICE/COLUMN/QA/FREE/FEED) |
| `post_whiskeys` | 게시글-위스키 연결 (관련 칼럼 기능) |
| `post_comments` | 댓글 (대댓글 tree 구조, soft delete) |
| `follows` | 팔로우 관계 |
| `user_taste_profiles` | 취향 설문 저장 (점수 5개 + 태그 IDs) |
| `whiskey_requests` | 위스키 등록 요청 (PENDING/APPROVED/REJECTED) |
| `whiskey_columns` | AI 작성 한국어 위스키 칼럼 (마크다운 본문, Unsplash 썸네일) |

</details>

---

## 🚀 Getting Started

### Prerequisites

```bash
Java 21+
Node.js 20+
MySQL 8.0+
Elasticsearch 9.2.8
Docker (선택)
```

### Backend

```bash
git clone https://github.com/prgrms-aibe-devcourse/AIBE5_FinalProject_Team7_JackPot.git
cd AIBE5_FinalProject_Team7_JackPot/backend

cp .env.example .env
# .env 파일에서 DB, JWT, OAuth, ES 값 설정

./gradlew bootRun
```

### Frontend

```bash
cd AIBE5_FinalProject_Team7_JackPot/frontend

npm install
cp .env.example .env.local
npm run dev
```

### Docker Compose

```bash
docker-compose up -d           # 운영
docker-compose -f docker-compose.local.yml up -d   # 로컬
```

### 환경 변수

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whiskey_note
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS S3
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
AWS_S3_BUCKET=whiskey-note-bucket
AWS_REGION=ap-northeast-2

# Elasticsearch
ES_HOST=localhost
ES_PORT=9200
```

---

## 📁 프로젝트 구조

```
AIBE5_FinalProject_Team7_JackPot/
├── backend/                        # Spring Boot
│   └── src/main/java/com/whiskeynote/
│       ├── auth/               # 인증 (JWT, OAuth) — 담당: 최준열
│       ├── user/               # 유저, 팔로우
│       ├── whiskey/            # 위스키, ES 검색 — 담당: 김민국
│       ├── recommendation/     # 추천, Flavor Profile — 담당: Mi-no-Kim
│       ├── review/             # 리뷰 — 담당: 김민국
│       ├── note/               # My Note (테이스팅 노트)
│       ├── feed/               # 라운지 피드, 게시글 — 담당: GyuSikYoon
│       ├── cabinet/            # 캐비넷, Pick, 위시 — 담당: 최준열
│       ├── survey/             # 취향 설문 — 담당: Mi-no-Kim
│       ├── community/column/   # 위스키 칼럼 — 담당: GyuSikYoon
│       ├── match/              # Taste Match
│       ├── report/             # 신고
│       └── admin/              # 관리자
├── frontend/                       # React + TypeScript + Vite
│   └── src/
│       ├── app/router/         # 라우트 정의, paths.ts
│       ├── features/
│       │   ├── auth/           # 로그인·회원가입·OAuth
│       │   ├── whiskey/        # 위스키 상세·리뷰·태그 버블
│       │   ├── search/         # 키워드 검색
│       │   ├── survey/         # 취향 설문
│       │   ├── recommendation/ # 추천 결과
│       │   ├── cabinet/        # 캐비넷
│       │   ├── community/      # 게시판 전체 (칼럼·자유·공지·QnA)
│       │   ├── tasting-note/   # 테이스팅 노트
│       │   └── admin/          # 관리자
│       └── shared/
│           ├── api/            # Axios 클라이언트, 공통 타입
│           ├── components/     # 공통 UI 컴포넌트 (Button, Toast 등)
│           └── lib/            # 유틸 (mediaUrl, authSession 등)
├── deploy/
├── docker-compose.yml
├── docker-compose.local.yml
└── .github/workflows/
    ├── backend-ci.yml
    └── frontend-ci.yml
```

---

## 🔧 트러블슈팅

개발 중 발생한 주요 이슈와 해결 방법은 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참고하세요.

주요 해결 사례:

| 이슈 | 원인 | 해결 |
|------|------|------|
| ES `@Id` 어노테이션 충돌 | `jakarta.persistence.Id` 사용 | `org.springframework.data.annotation.Id` 로 교체 (Fix#176) |
| `feed`/`column` 용어 혼재 | 초기 RSS 크롤러 명명 전파 | DB·BE·FE 전 계층 일괄 리네이밍 |
| 다크테마 텍스트 불가시 | 하드코딩된 라이트 테마 색상 | CSS 변수 (`--wf-text`, `--wf-accent` 등) 전환 |
| Anthropic API 크레딧 초과 | 잔여 크레딧 없음 | AI 직접 작성 한국어 칼럼 20개 DB 삽입으로 전환 |
| 칼럼 외부 URL 이동 문제 | `<a href>` 외부 링크 처리 | `ColumnDetailPage` 신규 구현, 내부 마크다운 렌더링 |
| OG 이미지 크롤링 차단 | 봇 차단 및 CORS | Unsplash 이미지 수동 큐레이션 후 SQL UPDATE |

---

## 🗓 개발 로드맵

- [x] 서비스 기획 및 설계
- [x] API 명세서 v2 완성
- [x] 기능 명세서 v1.1 완성
- [x] **Phase 1 — MVP**
  - [x] 인증 (이메일 + Google OAuth)
  - [x] 취향 설문 & 추천 (코사인+자카드 알고리즘)
  - [x] 위스키 검색(Elasticsearch)·상세
  - [x] 리뷰 & Pick & 위시리스트
  - [x] 메인 라운지 피드
  - [x] 캐비넷 & 팔로우
  - [x] Taste Match
  - [x] 위스키 등록 요청 (UGC)
  - [x] 위스키 칼럼 (AI 작성 한국어 20개)
  - [x] CI/CD (GitHub Actions → AWS)
  - [x] 관리자
- [x] **Phase 2**
  - [x] My Note (테이스팅 노트 + AI 분석)
  - [x] 커뮤니티 게시판 3종 고도화
  - [x] Kakao 소셜 로그인
  - [x] 시각화 고도화

---

## 📄 관련 문서

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — 트러블슈팅 기록
- [TEAM_DOCS.md](./TEAM_DOCS.md) — 팀원별 기술 문서 (API·구조·특이사항)

---

<div align="center">

Made with 🥃 by **JackPot Team** (AIBE5 Final Project)

김민국 · 윤석규 · 윤규식 · 김민호 · 최준열

</div>
