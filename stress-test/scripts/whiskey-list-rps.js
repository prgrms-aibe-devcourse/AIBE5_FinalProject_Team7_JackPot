import http from 'k6/http';
import { check } from 'k6';

// 고정 RPS 부하 — 위스키 목록 조회 (인증 불필요)
// 실행 예:
//   k6 run -e BASE_URL=https://whiskey-note.site/api/v1 -e RATE=50 -e DURATION=3m scripts/whiskey-list-rps.js
//   TARGET=prod  SCENARIO=whiskey-list ./run-load.sh
//   TARGET=test  SCENARIO=whiskey-list ./run-load.sh   # backend-test :8081 필요
const BASE = __ENV.BASE_URL || 'https://whiskey-note.site/api/v1';
const ENDPOINT = __ENV.ENDPOINT || '/whiskeys?page=0&size=20';
const RATE = Number(__ENV.RATE || 50);
const DURATION = __ENV.DURATION || '3m';

export const options = {
  scenarios: {
    whiskey_list_fixed_rps: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: 50,
      maxVUs: 300,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
  },
};

export default function () {
  const res = http.get(`${BASE}${ENDPOINT}`, {
    tags: { endpoint: '/whiskeys' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
