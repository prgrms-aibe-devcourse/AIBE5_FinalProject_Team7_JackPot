# stress-test/scripts/helpers/auth.js 사용 가이드

모든 k6 테스트 스크립트에서 공통으로 사용하는 인증 헬퍼 모듈입니다.
계정 정보를 코드에 직접 쓰지 않고 **환경변수로 주입**하는 방식입니다.

---

## 환경변수 목록

| 변수명          | 설명                  | 필수 여부                    | 기본값                  |
|-----------------|-----------------------|------------------------------|-------------------------|
| `BASE_URL`      | 서버 주소             | 선택                         | `http://localhost:8080` |
| `USER_EMAILS`   | 쉼표로 구분된 계정 목록 | **필수**                   | 없음                    |
| `USER_PASSWORD` | 유저 공통 비밀번호    | **필수**                     | 없음                    |
| `ADMIN_EMAIL`   | 관리자 이메일         | admin.js 사용 시 필수        | 없음                    |
| `ADMIN_PASSWORD`| 관리자 비밀번호       | admin.js 사용 시 필수        | 없음                    |

---

## 실행 명령어

### 일반 스크립트 (auth, user, pick, wishlist, cabinet, tasting_note, whiskey_request, report)

```bash
k6 run -e BASE_URL=https://whiskey-note.site \
       -e USER_EMAILS="user2@dummy.com,user3@dummy.com,user4@dummy.com" \
       -e USER_PASSWORD=password \
       stress-test/scripts/auth.js
```

### 관리자 스크립트 (admin)

```bash
k6 run -e BASE_URL=https://whiskey-note.site \
       -e USER_EMAILS="user2@dummy.com,user3@dummy.com,user4@dummy.com" \
       -e USER_PASSWORD=password \
       -e ADMIN_EMAIL=user1@example.com \
       -e ADMIN_PASSWORD=password \
       stress-test/scripts/admin.js
```

> **계정 수 주의**: `USER_EMAILS` 계정 수 ≥ stages 최대 VU 수여야 합니다.
> 계정보다 VU가 많으면 같은 계정을 여러 VU가 동시에 사용해 충돌이 발생합니다.
> 예) 최대 VU 50이면 계정 50개 이상 필요

---

## 제공 함수

### `login()`
일반 유저로 로그인 후 `accessToken`만 반환합니다.
대부분의 API 테스트에서 사용합니다.

```js
import { login, authHeaders, BASE_URL } from './helpers/auth.js';

export default function () {
  const token = login();
  if (!token) return;

  const res = http.get(`${BASE_URL}/api/v1/something`, authHeaders(token));
}
```

### `loginFull()`
로그인 후 `{ accessToken, refreshToken }` 을 모두 반환합니다.
refresh token이 필요한 경우 사용합니다. (auth.js 전용)

```js
import { loginFull, authHeaders, BASE_URL } from './helpers/auth.js';

export default function () {
  const tokens = loginFull();
  if (!tokens) return;

  const { accessToken, refreshToken } = tokens;
}
```

### `loginAsAdmin()`
관리자 계정으로 로그인 후 `accessToken`을 반환합니다.
`ADMIN_EMAIL`, `ADMIN_PASSWORD` 환경변수가 필수입니다.

```js
import { loginAsAdmin, authHeaders, BASE_URL } from './helpers/auth.js';

export default function () {
  const token = loginAsAdmin();
  if (!token) return;
}
```

### `authHeaders(token)`
`Authorization: Bearer {token}` + `Content-Type: application/json` 헤더를 반환합니다.
JSON body가 있는 요청에 사용합니다.

```js
http.post(`${BASE_URL}/api/v1/something`, JSON.stringify({ key: 'value' }), authHeaders(token));
http.get(`${BASE_URL}/api/v1/something`, authHeaders(token));
```

### `authOnlyHeaders(token)`
`Authorization: Bearer {token}` 헤더만 반환합니다.
multipart/form-data 요청처럼 Content-Type을 직접 지정해야 할 때 사용합니다.

```js
http.post(`${BASE_URL}/api/v1/upload`, formData, authOnlyHeaders(token));
```

---

## VU 계정 배분 방식

동일 계정을 여러 VU가 동시에 사용하면 refresh token 충돌이 발생합니다.
이를 방지하기 위해 k6의 `__VU` 번호를 기반으로 각 VU에 계정을 고정 배분합니다.

```
VU 1 → user2@dummy.com
VU 2 → user3@dummy.com
VU 3 → user4@dummy.com
...
계정 수보다 VU가 많으면 순환 배정 (VU 51 → user2@dummy.com)
```
