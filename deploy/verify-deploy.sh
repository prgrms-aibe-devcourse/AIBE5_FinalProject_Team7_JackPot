#!/usr/bin/env bash
# EC2·CI 배포 직후 실행 — 백엔드 기동·RDS 스키마·API 응답 검증
set -euo pipefail

COMPOSE_DIR="${COMPOSE_DIR:-$HOME/whiskeynote}"
WAIT_SEC="${WAIT_SEC:-25}"
LOG_TAIL="${LOG_TAIL:-120}"

cd "$COMPOSE_DIR"

echo "==> docker compose ps"
docker compose ps

LOGS="$(docker compose logs backend --tail "$LOG_TAIL" 2>&1)"

if echo "$LOGS" | grep -q 'missing table'; then
  echo "FAIL: RDS 스키마 불일치 (Hibernate validate — missing table)"
  echo "$LOGS" | grep -E 'missing table|Schema validation' || true
  exit 1
fi

if echo "$LOGS" | grep -q 'Application run failed'; then
  echo "FAIL: Spring Boot 기동 실패"
  echo "$LOGS" | tail -20
  exit 1
fi

if ! echo "$LOGS" | grep -q 'Started WhiskeynoteApplication'; then
  echo "FAIL: Started WhiskeynoteApplication 로그 없음 (아직 기동 중이면 WAIT_SEC 늘리기)"
  echo "$LOGS" | tail -20
  exit 1
fi

HEALTH_CODE="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/actuator/health/readiness || echo '000')"
if [[ "$HEALTH_CODE" != "200" ]]; then
  echo "FAIL: actuator readiness HTTP $HEALTH_CODE"
  exit 1
fi

API_CODE="$(curl -s -o /dev/null -w '%{http_code}' 'http://localhost/api/v1/community/columns?page=0&size=1' || echo '000')"
if [[ "$API_CODE" != "200" ]]; then
  echo "FAIL: API smoke test HTTP $API_CODE"
  exit 1
fi

echo "OK: backend healthy, API 200"
