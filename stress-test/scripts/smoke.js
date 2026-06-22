import http from 'k6/http';
import { check, sleep } from 'k6';

// 스모크 테스트 — 주요 공개 엔드포인트가 살아있는지 가볍게 점검
// 실행 예:
//   k6 run -e BASE_URL=https://whiskey-note.site/api/v1 scripts/smoke.js
const BASE = __ENV.BASE_URL || 'https://whiskey-note.site/api/v1';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ['rate>0.99'],
  },
};

const WHISKEY_ID = __ENV.WHISKEY_ID || '1';

const ENDPOINTS = [
  { method: 'GET', path: '/whiskeys?page=0&size=20', name: 'whiskey-list' },
  { method: 'GET', path: `/whiskeys/${WHISKEY_ID}/reviews?page=0&size=5`, name: 'review-list' },
  { method: 'GET', path: `/whiskeys/${WHISKEY_ID}/reviewstats`, name: 'review-stats' },
  { method: 'GET', path: '/lounge/feed', name: 'lounge-feed' },
  { method: 'GET', path: '/tags', name: 'tags' },
];

export default function () {
  for (const ep of ENDPOINTS) {
    const res = http.request(ep.method, `${BASE}${ep.path}`, null, {
      tags: { endpoint: ep.name },
    });
    check(res, {
      [`${ep.name} status < 500`]: (r) => r.status > 0 && r.status < 500,
    });
    sleep(0.3);
  }
}
