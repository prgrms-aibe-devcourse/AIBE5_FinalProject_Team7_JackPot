import http from 'k6/http';
import { check } from 'k6';

// 위스키 리뷰 목록 부하 — test RDS 대량 데이터 성능 측정용
//
// prod (배포 사이트):
//   k6 run -e BASE_URL=https://whiskey-note.site/api/v1 scripts/review-list-rps.js
//
// test backend (대량 DB, 앱 EC2 :8081):
//   k6 run -e BASE_URL=http://3.34.23.43:8081/api/v1 scripts/review-list-rps.js
//
// 또는 run-load.sh 사용:
//   TARGET=prod  SCENARIO=review-list ./run-load.sh
//   TARGET=test  SCENARIO=review-list ./run-load.sh
const BASE = __ENV.BASE_URL || 'https://whiskey-note.site/api/v1';
const WHISKEY_IDS = (__ENV.WHISKEY_IDS || '1,2,3,5,10')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const PAGE = __ENV.PAGE || '0';
const SIZE = __ENV.SIZE || '5';
const RATE = Number(__ENV.RATE || 30);
const DURATION = __ENV.DURATION || '3m';
const P95_MS = Number(__ENV.P95_MS || 1500);
const P99_MS = Number(__ENV.P99_MS || 3000);

export const options = {
  scenarios: {
    review_list_fixed_rps: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: 30,
      maxVUs: 200,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: [`p(95)<${P95_MS}`, `p(99)<${P99_MS}`],
  },
};

export default function () {
  const whiskeyId = WHISKEY_IDS[__ITER % WHISKEY_IDS.length];
  const path = `/whiskeys/${whiskeyId}/reviews?page=${PAGE}&size=${SIZE}`;
  const res = http.get(`${BASE}${path}`, {
    tags: { endpoint: '/whiskeys/{id}/reviews', whiskey_id: String(whiskeyId) },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
