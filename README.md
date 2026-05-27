<div align="center">

<img src="https://img.shields.io/badge/-🥃 Whiskey Note-6B3E26?style=for-the-badge" alt="Whiskey Note"/>

**AI 기반 위스키 큐레이션 & 소셜 플랫폼**

개인 취향 분석부터 테이스팅 노트, 라운지 피드, 취향 매칭까지

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)

</div>

---

## 📖 목차

- [서비스 소개](#-서비스-소개)
- [핵심 기능](#-핵심-기능)
- [시스템 아키텍처](#-시스템-아키텍처)
- [기술 스택](#-기술-스택)
- [API 명세](#-api-명세)
- [화면 구조](#-화면-구조)
- [데이터베이스 설계](#-데이터베이스-설계)
- [Getting Started](#-getting-started)
- [프로젝트 구조](#-프로젝트-구조)
- [팀원](#-팀원)

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
- **Rule-based 추천** — 위시리스트(+5), My Pick(+4), 조회(+2), 긍정 리뷰(+6), 부정 리뷰(-5)

### 🏠 메인 라운지 (소셜 피드)
- 팔로잉·인기·추천이 혼합된 세로 스크롤 피드
- 오늘의 추천·인기 위스키·취향 비슷한 유저 삽입 카드
- 글 작성·좋아요·댓글·대댓글

### 🔍 위스키 탐색
- 이름·브랜드·증류소 키워드 검색
- 종류·향·맛·도수·숙성연수 필터
- 검색 결과 없을 시 **위스키 등록 요청** (UGC)

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

### 📝 My Note *(Phase 2)*
- 향·맛 태그 선택 + N/P/F 슬라이더
- 레이더 차트 실시간 반영
- AI 점수·태그 제안 (자동 덮어쓰기 없음)

---

## 🏗 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│   React Web App   │   Admin Dashboard   │  Mobile*  │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────────────┐
│              API Gateway                             │
│       JWT 인증 · 라우팅 · Rate Limit · CORS          │
└──┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │
┌──▼──┐  ┌───▼──┐  ┌────▼───┐  ┌──▼──────────┐
│Auth │  │User  │  │Whiskey │  │ Recommend   │
│Svc  │  │Svc   │  │Svc     │  │ Svc         │
└─────┘  └──────┘  └────────┘  └─────────────┘
┌──────┐  ┌──────┐  ┌────────┐  ┌─────────────┐
│Review│  │Feed  │  │Cabinet │  │ Survey      │
│/Note │  │Svc   │  │Svc     │  │ Svc         │
└──────┘  └──────┘  └────────┘  └─────────────┘
         Spring Boot / Java 21 / JPA·Hibernate
┌─────────────────────────────────────────────────────┐
│                    Data Layer                        │
│  MySQL (Primary)  │  Redis (Cache)  │  S3 (Storage) │
│  AI Model* (P2)   │                 │               │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│              Infrastructure — AWS                    │
│  Docker  │  GitHub Actions CI/CD  │  EC2/ECS        │
│  CloudFront  │  Route 53          │                 │
└─────────────────────────────────────────────────────┘
```

> `*` 추후 확장 예정

---

## 🛠 기술 스택

### Backend
| 분류 | 기술 |
|------|------|
| Language | Java 21 |
| Framework | Spring Boot |
| ORM | JPA / Hibernate |
| Database | MySQL |
| Cache | Redis |
| Auth | JWT (Access + Refresh Token), OAuth 2.0 (Google, Kakao) |
| Storage | AWS S3 |

### Frontend
| 분류 | 기술 |
|------|------|
| Framework | React |
| 상태 관리 | (추후 확정) |
| 스타일 | (추후 확정) |

### DevOps
| 분류 | 기술 |
|------|------|
| Container | Docker |
| CI/CD | GitHub Actions |
| Cloud | AWS (EC2/ECS, S3, CloudFront, Route 53) |

---

## 📡 API 명세

> Base URL: `/api/v1` · 인증: `Authorization: Bearer {access_token}`

<details>
<summary><b>Auth / User</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/auth/register` | 회원가입 | ❌ |
| `POST` | `/auth/login` | 로그인 | ❌ |
| `GET` | `/auth/oauth/{provider}` | 소셜 로그인 (google/kakao) | ❌ |
| `POST` | `/auth/refresh` | 토큰 갱신 | ❌ |
| `POST` | `/auth/logout` | 로그아웃 | ✅ |
| `GET` | `/users/me` | 내 프로필 조회 | ✅ |
| `PATCH` | `/users/me` | 프로필 수정 | ✅ |
| `GET` | `/users/{userId}` | 타인 프로필 조회 | ✅ |
| `DELETE` | `/users/me` | 회원 탈퇴 (soft delete) | ✅ |

</details>

<details>
<summary><b>취향 설문 & 추천</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/survey/flavor-profile` | 설문 제출 | ✅ |
| `GET` | `/users/me/flavor-profile` | 취향 프로필 조회 | ✅ |
| `PUT` | `/users/me/flavor-profile` | 취향 재설문 | ✅ |
| `GET` | `/recommendations` | 맞춤 추천 리스트 | ✅ |
| `GET` | `/recommendations/today` | 오늘의 추천 (1개, 매일 갱신) | ✅ |
| `GET` | `/whiskeys/popular` | 인기 위스키 | ❌ |

</details>

<details>
<summary><b>위스키</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/whiskeys/search` | 위스키 검색 (`q`, `type`, `page`) | ❌ |
| `GET` | `/whiskeys/{id}` | 위스키 상세 | ❌ |
| `GET` | `/whiskeys/{id}/related-posts` | 관련 게시글 (좋아요 순 최대 3개) | ❌ |
| `POST` | `/whiskeys/{id}/recent` | 최근 본 기록 | ✅ |
| `GET` | `/users/me/recent-whiskeys` | 최근 본 목록 | ✅ |
| `POST` | `/whiskey-requests` | 위스키 등록 요청 (UGC) | ✅ |

</details>

<details>
<summary><b>리뷰 & My Note</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/whiskeys/{id}/reviews` | 리뷰 목록 | ❌ |
| `POST` | `/whiskeys/{id}/reviews` | 리뷰 작성 (My Note 첨부 가능) | ✅ |
| `PATCH` | `/reviews/{id}` | 리뷰 수정 | ✅ |
| `DELETE` | `/reviews/{id}` | 리뷰 삭제 | ✅ |
| `POST` | `/reviews/{id}/likes` | 리뷰 좋아요 / 취소 | ✅ |
| `GET` | `/users/me/tasting-notes` | 내 노트 목록 *(Phase 2)* | ✅ |
| `POST` | `/whiskeys/{id}/tasting-notes` | 노트 작성 *(Phase 2)* | ✅ |
| `PUT` | `/tasting-notes/{id}` | 노트 수정 *(Phase 2)* | ✅ |
| `DELETE` | `/tasting-notes/{id}` | 노트 삭제 *(Phase 2)* | ✅ |

</details>

<details>
<summary><b>Pick / 위시리스트 / 캐비넷</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/whiskeys/{id}/pick` | Pick 추가 | ✅ |
| `DELETE` | `/whiskeys/{id}/pick` | Pick 해제 | ✅ |
| `GET` | `/users/me/picks` | 내 Pick 목록 | ✅ |
| `GET` | `/users/me/wishlist/folders` | 위시 폴더 목록 | ✅ |
| `POST` | `/users/me/wishlist/folders` | 폴더 생성 | ✅ |
| `PATCH` | `/users/me/wishlist/folders/{id}` | 폴더 이름 변경 | ✅ |
| `DELETE` | `/users/me/wishlist/folders/{id}` | 폴더 삭제 (아이템 → 미분류) | ✅ |
| `POST` | `/whiskeys/{id}/wishlist` | 위시 추가 | ✅ |
| `DELETE` | `/whiskeys/{id}/wishlist` | 위시 제거 | ✅ |
| `PATCH` | `/wishlist-items/{id}` | 위시 폴더 이동 | ✅ |
| `GET` | `/users/me/cabinet/stats` | 캐비넷 집계 | ✅ |
| `GET` | `/users/{id}/cabinet/bar` | 타인 Bar 조회 (위시 제외) | ✅ |

</details>

<details>
<summary><b>라운지 피드 & 커뮤니티</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/feed` | 라운지 피드 (following/popular 혼합) | ✅ |
| `GET` | `/posts/{id}` | 글 상세 | ❌ |
| `POST` | `/posts` | 글 작성 | ✅ |
| `PATCH` | `/posts/{id}` | 글 수정 | ✅ |
| `DELETE` | `/posts/{id}` | 글 삭제 (soft delete) | ✅ |
| `POST` | `/posts/{id}/likes` | 글 좋아요 / 취소 | ✅ |
| `GET` | `/posts/{id}/comments` | 댓글 목록 (tree) | ❌ |
| `POST` | `/posts/{id}/comments` | 댓글 작성 (대댓글 지원) | ✅ |
| `DELETE` | `/comments/{id}` | 댓글 삭제 (soft delete) | ✅ |

</details>

<details>
<summary><b>팔로우 & Taste Match</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/users/{userId}/follow` | 팔로우 | ✅ |
| `DELETE` | `/users/{userId}/follow` | 언팔로우 | ✅ |
| `GET` | `/users/{userId}/followers` | 팔로워 목록 | ✅ |
| `GET` | `/users/{userId}/following` | 팔로잉 목록 | ✅ |
| `GET` | `/users/{userId}/mutual-follows` | 맞팔 목록 | ✅ |
| `GET` | `/discover/taste-match` | 취향 유사 유저 매칭 | ✅ |

</details>

<details>
<summary><b>신고 & 관리자</b></summary>

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/reports` | 신고 (게시글/댓글/리뷰/유저) | ✅ |
| `GET` | `/admin/whiskey-requests` | 등록 요청 목록 | 🔐 Admin |
| `PATCH` | `/admin/whiskey-requests/{id}` | 등록 요청 승인/반려 | 🔐 Admin |
| `GET` | `/admin/reports` | 신고 목록 | 🔐 Admin |
| `POST` | `/admin/reports/{id}/actions` | 신고 처리 | 🔐 Admin |
| `GET` | `/admin/users` | 회원 관리 | 🔐 Admin |

</details>

---

## 🗺 화면 구조

```
/                          → 랜딩 (01)
/login                     → 로그인·가입 (02)
/onboarding                → 온보딩, 레벨 선택 (03)
/survey                    → 취향 설문 (04)
/recommend                 → 맞춤 추천 (05)
/lounge                    → 메인 라운지 피드 (06) ★
/search                    → 검색·탐색 (07)
/whiskey/:id               → 위스키 상세 (09)
/whiskey/:id#reviews       → 위스키 리뷰 탭 (10)
/whiskey/:id/note          → My Note 작성 (15) [Phase 2]
/cabinet                   → 내 캐비넷 (12)
  ?tab=pick                  → My Pick 목록
  ?tab=wish                  → 위시리스트 (폴더 구조)
  ?tab=reviews               → 내 리뷰 목록
  ?tab=note                  → My Note 목록 [Phase 2]
/cabinet/follow            → 팔로우 목록 (12)
/me                        → 마이페이지 (13)
/user/:id                  → 타인 캐비넷 (13b)
/community                 → 커뮤니티 허브 (14) [Phase 2]
/discover/taste-match      → Taste Match (16) ★
```

---

## 🗃 데이터베이스 설계

<details>
<summary><b>주요 테이블 목록</b></summary>

| 테이블 | 설명 |
|--------|------|
| `users` | 회원·인증 (`uid`, `email`, `auth_provider`, `nickname`, `role`, `is_deleted`) |
| `whiskeys` | 위스키 카탈로그 (이름, 브랜드, 타입, 도수, 숙성연수 등) |
| `official_notes` | 오피셜 시음 노트 |
| `avg_whiskey_tags` | 유저 노트 태그 집계 캐시 |
| `tasting_notes` | 비공개 개인 노트 *(Phase 2)* |
| `reviews` | 공개 리뷰 (별점, 한줄평, My Note 첨부 참조) |
| `my_picks` | My Pick 목록 |
| `wishlist_folders` | 위시리스트 폴더 |
| `wishlist_items` | 위시리스트 아이템 |
| `posts` | 라운지·커뮤니티 게시글 (soft delete) |
| `post_comments` | 댓글 (대댓글 tree 구조, soft delete) |
| `post_likes` / `review_likes` | 좋아요 |
| `follows` | 팔로우 관계 |
| `flavor_profile` | 취향 프로필 (설문·누적 행동 데이터) |
| `flavor_profile_tags` | 취향 태그 가중치 |
| `recent_whiskeys` | 최근 본 위스키 |
| `whiskey_requests` | UGC 위스키 등록 요청 |
| `reports` / `report_actions` | 신고·처리 이력 |

</details>

---

## 🚀 Getting Started

### Prerequisites

```bash
Java 21+
Node.js 20+
MySQL 8.0+
Docker (선택)
```

### Backend

```bash
# 저장소 클론
git clone https://github.com/your-org/whiskey-note.git
cd whiskey-note/backend

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 DB, JWT, OAuth 값 설정

# 실행
./gradlew bootRun
```

### Frontend

```bash
cd whiskey-note/frontend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 개발 서버 실행
npm run dev
```

### Docker Compose

```bash
cd whiskey-note
docker-compose up -d
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

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS S3
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
AWS_S3_BUCKET=whiskey-note-bucket
AWS_REGION=ap-northeast-2
```

---

## 📁 프로젝트 구조

```
whiskey-note/
├── backend/                        # Spring Boot
│   ├── src/main/java/
│   │   └── com/whiskeynote/
│   │       ├── auth/               # 인증 (JWT, OAuth)
│   │       ├── user/               # 유저, 팔로우
│   │       ├── whiskey/            # 위스키, 등록 요청
│   │       ├── recommendation/     # 추천, Flavor Profile
│   │       ├── review/             # 리뷰
│   │       ├── note/               # My Note (Phase 2)
│   │       ├── feed/               # 라운지 피드, 게시글
│   │       ├── cabinet/            # 캐비넷, Pick, 위시
│   │       ├── survey/             # 취향 설문
│   │       ├── match/              # Taste Match
│   │       ├── report/             # 신고
│   │       └── admin/              # 관리자
│   └── src/main/resources/
│       └── application.yml
├── frontend/                       # React
│   ├── src/
│   │   ├── pages/                  # 라우팅 페이지
│   │   ├── components/             # 공통 컴포넌트
│   │   ├── features/               # 기능별 모듈
│   │   ├── hooks/                  # 커스텀 훅
│   │   ├── api/                    # API 클라이언트
│   │   └── store/                  # 상태 관리
│   └── public/
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
└── README.md
```

---

## 🗓 개발 로드맵

- [x] 서비스 기획 및 설계
- [x] API 명세서 v2 완성
- [x] 기능 명세서 v1.1 완성
- [ ] **Phase 1 — MVP**
  - [ ] 인증 (이메일 + Google OAuth)
  - [ ] 취향 설문 & 추천
  - [ ] 위스키 검색·상세
  - [ ] 리뷰 & Pick & 위시리스트
  - [ ] 메인 라운지 피드
  - [ ] 캐비넷 & 팔로우
  - [ ] Taste Match
  - [ ] 위스키 등록 요청 (UGC)
  - [ ] 관리자
- [ ] **Phase 2**
  - [ ] My Note (테이스팅 노트 + AI 분석)
  - [ ] 커뮤니티 게시판 4종
  - [ ] Kakao 소셜 로그인
  - [ ] 시각화 고도화

---

## 👥 팀원

| 역할 | 이름 | GitHub |
|------|------|--------|
| Backend | - | - |
| Backend | - | - |
| Frontend | - | - |
| Frontend | - | - |
| Design | - | - |

---

## 📄 관련 문서

- [서비스 기획안 (Notion)](링크를_여기에_추가)
- [기능 명세서 v1.1](링크를_여기에_추가)
- [API 명세서 v2](링크를_여기에_추가)
- [피그마 디자인](링크를_여기에_추가)

---

<div align="center">

Made with 🥃 by Whiskey Note Team

</div>
