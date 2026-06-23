/**
 * 인증 API 부하 테스트
 *
 * 테스트 대상:
 *   POST /api/v1/auth/register              — 회원가입
 *   POST /api/v1/auth/login                 — 로그인
 *   POST /api/v1/auth/logout                — 로그아웃
 *   POST /api/v1/auth/refresh               — 토큰 재발급
 *   GET  /api/v1/auth/oauth/{provider}      — OAuth 로그인 URL 요청
 *
 * 실행:
 *   k6 run stress-test/scripts/auth.js
 */

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL, authHeaders, loginFull } from './helpers/auth.js';

// ── 커스텀 메트릭 ─────────────────────────────────
// Rate: 비율 추적 (성공/실패율)
const loginFailRate = new Rate('login_fail_rate');

// ── 테스트 설정 ───────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 10  }, // 30초 동안 10명으로 증가 (워밍업)
    { duration: '1m',  target: 30  }, // 1분 동안 30명 유지 (일반 트래픽)
    { duration: '30s', target: 50  }, // 30초 동안 50명으로 증가 (피크)
    { duration: '30s', target: 0   }, // 30초 동안 0명으로 감소 (쿨다운)
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 전체 요청의 95%가 2초 이내
    'login_fail_rate':   ['rate<0.05'],  // 로그인 실패율 5% 이하
    'http_req_failed':   ['rate<0.05'],  // 전체 에러율 5% 이하
  },
};

// ── 메인 시나리오 ─────────────────────────────────
// VU별 전용 계정 배정: VU1→test2, VU2→test3, VU3→test4, VU4→test5, VU5→test6
// 동일 계정 동시 접근으로 인한 refreshToken 충돌 방지
export default function () {

  // ── 1. 로그인 ──────────────────────────────────
  // loginFull(): VU 전용 계정으로 로그인 후 { accessToken, refreshToken } 반환
  const tokens = loginFull();

  const ok = tokens !== null;
  loginFailRate.add(!ok);
  if (!ok) return;

  check({ status: 200 }, {
    '상태코드 200':   () => true,
    '토큰 발급 확인': () => !!tokens.accessToken,
  });

  const { accessToken, refreshToken } = tokens;

  sleep(0.5);

  // ── 2. 토큰 재발급 ────────────────────────────
  // RefreshRequest: { refreshToken } body 필수
  group('토큰 재발급', () => {
    const refreshRes = http.post(
      `${BASE_URL}/api/v1/auth/refresh`,
      JSON.stringify({ refreshToken: refreshToken }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(refreshRes, {
      '재발급 성공 200': (r) => r.status === 200,
    });
  });

  sleep(0.5);

  // ── 3. 로그아웃 ───────────────────────────────
  // logout은 204 NO_CONTENT 반환
  group('로그아웃', () => {
    const logoutRes = http.post(
      `${BASE_URL}/api/v1/auth/logout`,
      null,
      authHeaders(accessToken)
    );
    check(logoutRes, {
      '로그아웃 204': (r) => r.status === 204,
    });
  });

  sleep(1);
}
