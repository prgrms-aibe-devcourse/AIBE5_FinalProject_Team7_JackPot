# AI 테이스팅 노트 분석 기능 설정 가이드

테이스팅 노트 작성 시 메모를 입력하면 AI가 자동으로 점수와 태그를 분석해주는 기능입니다.
이 기능을 로컬에서 사용하려면 **Anthropic API 키 발급 및 설정**이 필요합니다.

---

## 1. Anthropic API 키 발급

### 1-1. Anthropic Console 접속
```
https://console.anthropic.com
```

### 1-2. 회원가입 / 로그인
- Google 계정으로 바로 가입 가능

### 1-3. API 키 생성
1. 좌측 메뉴 → **API Keys** 클릭
2. **Create Key** 버튼 클릭
3. 키 이름 입력 (예: `whiskeynote-local`)
4. 생성된 키 복사 (`sk-ant-api03-...` 형식)

> ⚠️ **API 키는 생성 직후에만 전체 확인 가능합니다. 반드시 그 자리에서 복사해두세요!**

### 1-4. 크레딧 충전
1. 좌측 메뉴 → **Billing** → **Add credit**
2. 최소 $5부터 충전 가능
3. 사용 모델(`claude-haiku-4-5`)은 매우 저렴해 $5로 충분합니다

> 모델별 최신 가격 및 사용 가능 모델 목록:
> https://docs.anthropic.com/en/docs/about-claude/models

---

## 2. API 키 설정

### 2-1. `application-local.yaml` 파일 열기
```
backend/src/main/resources/application-local.yaml
```

> 파일이 없다면 `application-local.yaml.example`을 복사해서 만드세요.
> ```bash
> cp application-local.yaml.example application-local.yaml
> ```

### 2-2. 아래 내용 추가
```yaml
anthropic:
  api-key: sk-ant-api03-여기에_발급받은_키_붙여넣기
```

### 2-3. 최종 파일 예시
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/whiskeynote?serverTimezone=Asia/Seoul
    username: root
    password: your_password

anthropic:
  api-key: sk-ant-api03-xxxxxxxxxxxxxxxxxxxx
```

---

## 3. 서버 재시작

설정 후 Spring Boot 서버를 **재시작**하면 적용됩니다.

서버 시작 시 아래 로그가 출력되면 정상입니다:
```
AI 테이스팅 노트 분석 프롬프트 로드 완료 (XXXX chars)
```

---

## 4. 기능 사용 방법

1. 위스키 상세 페이지 → **테이스팅 노트 작성** 진입
2. **메모** 입력창에 자유롭게 위스키 시음 내용 작성
3. 메모 입력창 우측 상단 **✨ AI 분석** 버튼 클릭
4. 분석 완료 시 점수(바디/피니시/스모키/스파이시/단맛)와 태그가 자동으로 채워짐
5. 결과를 확인하고 필요하면 수동으로 수정 후 저장

---

## 5. 보안 주의사항

> ⚠️ **API 키를 절대 GitHub에 커밋하지 마세요!**

`application-local.yaml`은 `.gitignore`에 포함되어 있어 자동으로 제외됩니다.

```
# .gitignore
application-local.yaml   ← API 키가 여기 있으므로 안전
```

커밋 전 반드시 확인:
```bash
git status
# application-local.yaml 이 목록에 없어야 정상
```

---

## 6. 테스트 코드에서 AI 호출 테스트 (선택)

`AI-06` ~ `AI-08` 테스트는 실제 API를 호출합니다.
IntelliJ Run Configuration에서 환경변수를 추가하면 실행됩니다:

```
환경 변수(E): ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx
```

환경변수 없이 실행 시 해당 테스트는 자동으로 스킵됩니다.

---

## 7. 문제 해결

| 증상 | 원인 | 해결 방법 |
|---|---|---|
| `AI 분석 서비스가 설정되지 않았습니다` | API 키 미설정 | `application-local.yaml`에 키 추가 후 서버 재시작 |
| `AI 분석 요청에 실패했습니다` | 크레딧 부족 또는 네트워크 오류 | Billing에서 크레딧 확인 |
| 서버 시작 시 오류 발생 | 프롬프트 파일 없음 | `src/main/resources/prompts/tasting-note-analyze.md` 존재 여부 확인 |
| 점수는 나오는데 태그가 비어있음 | DB에 tags 데이터 없음 | `data.sql` 시드 데이터 실행 확인 |
