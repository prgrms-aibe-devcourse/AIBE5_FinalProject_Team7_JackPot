#!/usr/bin/env bash
# EC2·CI 배포 직후 실행 — 백엔드 기동·RDS 스키마·API 응답 검증
set -euo pipefail

COMPOSE_DIR="${COMPOSE_DIR:-$HOME/whiskeynote}"
WAIT_SEC="${WAIT_SEC:-30}"
LOG_TAIL="${LOG_TAIL:-150}"

cd "$COMPOSE_DIR"

echo "==> Waiting ${WAIT_SEC}s for backend startup..."
sleep "$WAIT_SEC"

echo "==> docker compose ps"
docker compose ps

LOGS="$(docker compose logs backend --tail "$LOG_TAIL" 2>&1)"

# RDS 테이블 누락 (ddl-auto=validate)
if echo "$LOGS" | grep -q 'missing table'; then
  MISSING_TABLE="$(echo "$LOGS" | sed -n 's/.*missing table \[\([^]]*\)\].*/\1/p' | head -1)"
  MISSING_TABLE="${MISSING_TABLE:-unknown}"

  echo ""
  echo "RDS_SCHEMA_OUTDATED"
  echo "========================================"
  echo "RDS 스키마 최신화 필요 — backend 기동 실패"
  echo "누락 테이블: ${MISSING_TABLE}"
  echo ""
  echo "조치:"
  echo "  1) backend/src/main/resources/db/migration/V*__*.sql Flyway migration 추가"
  echo "  2) main merge → Deploy workflow 재실행"
  echo "========================================"
  echo "$LOGS" | grep -E 'missing table|Schema validation' || true
  exit 1
fi

if echo "$LOGS" | grep -q 'Schema validation:'; then
  echo ""
  echo "RDS_SCHEMA_OUTDATED"
  echo "========================================"
  echo "RDS 스키마 검증 실패 (Hibernate validate)"
  echo "$LOGS" | grep -E 'Schema validation|missing' | tail -5
  echo "========================================"
  exit 1
fi

if echo "$LOGS" | grep -q 'Application run failed'; then
  echo ""
  echo "BACKEND_START_FAILED"
  echo "FAIL: Spring Boot 기동 실패 (로그 확인)"
  echo "$LOGS" | tail -25
  exit 1
fi

if ! echo "$LOGS" | grep -q 'Started WhiskeynoteApplication'; then
  echo ""
  echo "BACKEND_START_FAILED"
  echo "FAIL: Started WhiskeynoteApplication 로그 없음"
  echo "$LOGS" | tail -25
  exit 1
fi

# backend는 expose만 하고 호스트 8080 publish 없음 → compose healthcheck(컨테이너 내부 readiness)로 확인
if ! docker compose ps backend 2>/dev/null | grep -q '(healthy)'; then
  echo "BACKEND_HEALTH_FAILED"
  echo "FAIL: backend container not healthy (see docker compose ps / logs)"
  docker compose logs backend --tail 30
  exit 1
fi

API_CODE="$(curl -s -o /dev/null -w '%{http_code}' 'http://localhost/api/v1/community/columns?page=0&size=1' 2>/dev/null || echo '000')"
if [[ "$API_CODE" != "200" ]]; then
  echo "BACKEND_API_FAILED"
  echo "FAIL: API smoke test HTTP ${API_CODE}"
  exit 1
fi

echo "DEPLOY_VERIFY_OK"
echo "OK: backend container healthy, API smoke 200"
