/**
 * 공통 인증 헬퍼
 * 모든 테스트 파일에서 import 해서 사용
 *
 * ── 실행 방법 ──────────────────────────────────────────────────────────
 * 환경변수로 서버 주소와 계정 정보를 주입해서 사용 (환경별 하드코딩 제거)
 *
 * k6 run stress-test/scripts/auth.js \
 *   -e BASE_URL=http://localhost:8080 \
 *   -e USER_EMAILS="user1@test.com,user2@test.com,user3@test.com" \
 *   -e USER_PASSWORD=yourpassword \
 *   -e ADMIN_EMAIL=admin@test.com \
 *   -e ADMIN_PASSWORD=adminpassword
 *
 * ── 환경변수 목록 ───────────────────────────────────────────────────────
 *   BASE_URL      서버 주소              기본값: http://localhost:8080
 *   USER_EMAILS   쉼표 구분 계정 목록    기본값: 없음 (필수)
 *   USER_PASSWORD 유저 공통 비밀번호     기본값: 없음 (필수)
 *   ADMIN_EMAIL   관리자 이메일          기본값: 없음 (admin.js 사용 시 필수)
 *   ADMIN_PASSWORD 관리자 비밀번호       기본값: 없음 (admin.js 사용 시 필수)
 * ───────────────────────────────────────────────────────────────────────
 */

import http from 'k6/http';
import { check } from 'k6';

// ── 서버 주소 (환경변수 우선, 없으면 로컬 기본값) ─────────────────────
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// ── 테스트 계정 목록 (환경변수에서 파싱) ─────────────────────────────
// USER_EMAILS="a@test.com,b@test.com,c@test.com" 형태로 전달
const USER_PASSWORD = __ENV.USER_PASSWORD || '';
const ACCOUNTS = (__ENV.USER_EMAILS || '')
  .split(',')
  .map(e => e.trim())
  .filter(e => e.length > 0)
  .map(email => ({ email, password: USER_PASSWORD }));

if (ACCOUNTS.length === 0) {
  console.warn('[auth.js] USER_EMAILS 환경변수가 없습니다. -e USER_EMAILS="..." 로 전달하세요.');
}

// ── 관리자 계정 (환경변수에서 파싱) ──────────────────────────────────
const ADMIN_ACCOUNT = {
  email:    __ENV.ADMIN_EMAIL    || '',
  password: __ENV.ADMIN_PASSWORD || '',
};

/**
 * VU 번호 기반으로 계정을 고정 배분
 * __VU: k6가 각 VU에 부여하는 고유 번호 (1부터 시작)
 * 계정 수보다 VU가 많으면 순환 배정 (모듈로 연산)
 */
function pickAccount() {
  if (ACCOUNTS.length === 0) return { email: '', password: '' };
  const idx = (__VU > 0) ? (__VU - 1) % ACCOUNTS.length
                          : Math.floor(Math.random() * ACCOUNTS.length);
  return ACCOUNTS[idx];
}

/**
 * VU 전용 계정으로 로그인 후 accessToken 반환
 * 로그인 실패 시 null 반환
 */
export function login() {
  const account = pickAccount();

  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: account.email, password: account.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = check(res, {
    '로그인 성공 (200)': (r) => r.status === 200,
  });

  if (!ok) return null;

  try {
    return JSON.parse(res.body).data?.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * VU 전용 계정으로 로그인 후 { accessToken, refreshToken } 반환
 * auth.js처럼 두 토큰이 모두 필요한 경우 사용
 * 로그인 실패 시 null 반환
 */
export function loginFull() {
  const account = pickAccount();

  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: account.email, password: account.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = check(res, {
    '로그인 성공 (200)': (r) => r.status === 200,
  });

  if (!ok) return null;

  try {
    const data = JSON.parse(res.body).data;
    if (!data?.accessToken || !data?.refreshToken) return null;
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch {
    return null;
  }
}

/**
 * 관리자 계정으로 로그인 후 accessToken 반환
 */
export function loginAsAdmin() {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify(ADMIN_ACCOUNT),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = check(res, {
    '관리자 로그인 성공 (200)': (r) => r.status === 200,
  });

  if (!ok) return null;

  try {
    return JSON.parse(res.body).data?.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * 인증 헤더 생성
 * @param {string} token - accessToken
 * @returns k6 params 객체
 */
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
}

/** Content-Type 없이 Authorization 만 필요한 경우 (multipart 등) */
export function authOnlyHeaders(token) {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };
}
