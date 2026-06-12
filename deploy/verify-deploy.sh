#!/usr/bin/env bash
# EC2·CI 배포 직후 실행 — 백엔드 기동·RDS 스키마·API 응답 검증
set -euo pipefail

COMPOSE_DIR="${COMPOSE_DIR:-$HOME/whiskeynote}"
MAX_WAIT="${MAX_WAIT:-180}"

cd "$COMPOSE_DIR"

# Docker healthcheck 상태 기반 폴링 (로그 기반 오인식 방지)
echo "==> Waiting for backend healthy (max ${MAX_WAIT}s)..."
ELAPSED=0
INTERVAL=5
while [[ $ELAPSED -lt $MAX_WAIT ]]; do
  CONTAINER_ID="$(docker compose ps -q backend 2>/dev/null || true)"
  if [[ -n "$CONTAINER_ID" ]]; then
    HEALTH="$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_ID" 2>/dev/null || echo 'none')"
    if [[ "$HEALTH" == "healthy" ]]; then
      echo "==> Backend healthy after ${ELAPSED}s"
      break
    fi
    if [[ "$HEALTH" == "unhealthy" ]]; then
      echo "==> Backend marked unhealthy after ${ELAPSED}s"
      break
    fi
  fi
  # 치명적 기동 오류 조기 감지
  LOGS_SNIPPET="$(docker compose logs backend --tail 30 2>&1)"
  if echo "$LOGS_SNIPPET" | grep -qE 'Application run failed|missing table|Schema validation:|FlywayValidateException'; then
    echo "==> Fatal startup error detected after ${ELAPSED}s"
    HEALTH="failed"
    break
  fi
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "==> docker compose ps"
docker compose ps

LOGS="$(docker compose logs backend --tail 150 2>&1)"

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
  echo "FAIL: Started WhiskeynoteApplication 로그 없음 (${ELAPSED}s 경과)"
  echo "$LOGS" | tail -25
  exit 1
fi

# Docker healthcheck 최종 확인
if ! docker compose ps backend 2>/dev/null | grep -q '(healthy)'; then
  echo "BACKEND_HEALTH_FAILED"
  echo "FAIL: backend container not healthy after ${ELAPSED}s (see docker compose ps / logs)"
  docker compose logs backend --tail 30
  exit 1
fi

API_CODE="$(docker compose exec -T backend curl -s -o /dev/null -w '%{http_code}' 'http://localhost:8080/api/v1/community/columns?page=0&size=1' 2>/dev/null || echo '000')"
if [[ "$API_CODE" != "200" ]]; then
  echo "BACKEND_API_FAILED"
  echo "FAIL: API smoke test HTTP ${API_CODE}"
  exit 1
fi

echo "DEPLOY_VERIFY_OK"
echo "OK: backend container healthy, API smoke 200"
