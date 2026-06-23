/**
 * Pick(마이픽) API 부하 테스트
 *
 * 테스트 대상:
 *   GET    /api/v1/users/{userId}/picks         — 유저 픽 목록 조회
 *   GET    /api/v1/whiskeys/{whiskeyId}/pick     — 픽 여부 확인
 *   POST   /api/v1/whiskeys/{whiskeyId}/pick     — 픽 추가
 *   DELETE /api/v1/whiskeys/{whiskeyId}/pick     — 픽 제거
 *
 * 실행:
 *   k6 run -e BASE_URL=https://whiskey-note.site \
 *          -e USER_EMAILS="user2@dummy.com,...,user50@dummy.com" \
 *          -e USER_PASSWORD=password \
 *          -e WHISKEY_IDS="1,2,3,...,220" \
 *          -e USER_IDS="2,3,4,...,50" \
 *          stress-test/scripts/pick.js
 *
 * 환경변수 목록:
 *   BASE_URL      서버 주소                  기본값: http://localhost:8080
 *   USER_EMAILS   쉼표 구분 로그인 계정 목록  기본값: 없음 (필수)
 *   USER_PASSWORD 유저 공통 비밀번호          기본값: 없음 (필수)
 *   WHISKEY_IDS   쉼표 구분 위스키 ID 목록    기본값: 1~10
 *   USER_IDS      쉼표 구분 유저 ID 목록      기본값: 2~6
 */

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { login, authHeaders, BASE_URL } from './helpers/auth.js';

export const options = {
  stages: [
    { duration: '30s', target: 10  }, // 워밍업
    { duration: '1m',  target: 50  }, // 일반 트래픽
    { duration: '30s', target: 100 }, // 피크 트래픽
    { duration: '30s', target: 0   }, // 쿨다운
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'http_req_failed':   ['rate<0.05'],
  },
};

// 위스키 ID 목록 — 환경변수 우선, 없으면 로컬 기본값
const WHISKEY_IDS = (__ENV.WHISKEY_IDS || '1,2,3,4,5,6,7,8,9,10')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

// 조회 대상 유저 ID 목록 — 환경변수 우선, 없으면 로컬 기본값
const USER_IDS = (__ENV.USER_IDS || '2,3,4,5,6')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

export default function () {
  const token = login();
  if (!token) return;
  const headers = authHeaders(token);

  // 매 반복마다 랜덤 위스키 선택 (동일 위스키 집중 방지)
  const whiskeyId = WHISKEY_IDS[Math.floor(Math.random() * WHISKEY_IDS.length)];
  const userId    = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  // ── 1. 유저 픽 목록 조회 ──────────────────────
  group('픽 목록 조회', () => {
    const res = http.get(
      `${BASE_URL}/api/v1/users/${userId}/picks`,
      headers
    );
    check(res, {
      '픽 목록 200': (r) => r.status === 200,
    });
  });

  sleep(0.3);

  // ── 2. 픽 여부 확인 ────────────────────────────
  group('픽 여부 확인', () => {
    const res = http.get(
      `${BASE_URL}/api/v1/whiskeys/${whiskeyId}/pick`,
      headers
    );
    check(res, {
      '픽 여부 200': (r) => r.status === 200,
    });
  });

  sleep(0.3);

  // ── 3. 픽 추가 ────────────────────────────────
  group('픽 추가', () => {
    const res = http.post(
      `${BASE_URL}/api/v1/whiskeys/${whiskeyId}/pick`,
      null, // body 없음
      headers
    );
    check(res, {
      // 201: 추가 성공 (CREATED) / 409: 이미 픽한 상태
      '픽 추가 201 또는 중복 409': (r) => r.status === 201 || r.status === 409,
    });
  });

  sleep(0.3);

  // ── 4. 픽 제거 ────────────────────────────────
  group('픽 제거', () => {
    // http.del() — k6에서 DELETE 요청 (delete는 JS 예약어라 del 사용)
    const res = http.del(
      `${BASE_URL}/api/v1/whiskeys/${whiskeyId}/pick`,
      null,
      headers
    );
    check(res, {
      // 204: 제거 성공 (NO_CONTENT) / 404: 이미 없는 상태
      '픽 제거 204 또는 없음 404': (r) => r.status === 204 || r.status === 404,
    });
  });

  sleep(1);
}
