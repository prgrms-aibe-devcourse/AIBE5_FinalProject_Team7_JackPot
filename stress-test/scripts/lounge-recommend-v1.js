import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8080';

export const options = {
  vus: 50,
  iterations: 50, // 유저당 1번씩, 총 50번
};

export default function () {
  const n = 2 + (__VU - 1); // VU 1→user2, VU 50→user51
  const email = `user${n}@example.com`;

  // 1. 로그인
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password: 'password' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'login 200': (r) => r.status === 200 });

  const token = loginRes.json('data.accessToken');

  // 2. 추천 요청
  const recRes = http.get(
    `${BASE_URL}/api/v1/lounge/recommend-whiskey`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  check(recRes, {
    'recommend 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}