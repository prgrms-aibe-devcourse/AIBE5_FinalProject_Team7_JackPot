#!/usr/bin/env bash
# RDS 시드 한 방 적재 (팀원용)
#
# 1) Discord 등에서 받은 rds-local-seed.sql → deploy/ 에 저장
# 2) ./deploy/seed-local.sh
# 3) cd backend && ./gradlew bootRun  (+ frontend npm run dev)
#
# 옵션: SEED_FILE=/path/to/dump.sql ./deploy/seed-local.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_FILE="${SEED_FILE:-$SCRIPT_DIR/rds-local-seed.sql}"
LOCAL_YAML="$ROOT_DIR/backend/src/main/resources/application-local.yaml"
LOCAL_YAML_EXAMPLE="$ROOT_DIR/backend/src/main/resources/application-local.yaml.example"

if [[ ! -f "$SEED_FILE" ]]; then
  echo "ERROR: 시드 파일 없음 — $SEED_FILE" >&2
  echo "  Discord에서 rds-local-seed.sql 받아 deploy/ 폴더에 넣고 다시 실행하세요." >&2
  exit 1
fi

if [[ ! -f "$LOCAL_YAML" ]]; then
  if [[ -f "$LOCAL_YAML_EXAMPLE" ]]; then
    cp "$LOCAL_YAML_EXAMPLE" "$LOCAL_YAML"
    echo "application-local.yaml 없어서 example 복사함 (MySQL 3307)"
  else
    echo "ERROR: application-local.yaml 이 없습니다." >&2
    exit 1
  fi
fi

echo "▶ MySQL 컨테이너 기동 ..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d mysql

echo "▶ MySQL ready 대기 ..."
for _ in $(seq 1 60); do
  if docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T mysql \
    mysqladmin ping -h localhost -uroot -plocalroot --silent 2>/dev/null; then
    break
  fi
  sleep 1
done

table_exists() {
  docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T mysql \
    mysql -uroot -plocalroot -N -e \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='whiskeynote' AND table_name='whiskeys';" \
    2>/dev/null | tr -d '[:space:]' | grep -q '^1$'
}

if ! table_exists; then
  echo "▶ 테이블 없음 — Hibernate로 스키마 생성 (bootRun 잠깐 기동) ..."
  (cd "$ROOT_DIR/backend" && ./gradlew bootRun -q) &
  boot_pid=$!
  cleanup_boot() { kill "$boot_pid" 2>/dev/null || true; wait "$boot_pid" 2>/dev/null || true; }
  trap cleanup_boot EXIT
  for _ in $(seq 1 90); do
    if curl -sf http://127.0.0.1:8080/actuator/health >/dev/null 2>&1; then
      echo "▶ 스키마 생성 완료"
      cleanup_boot
      trap - EXIT
      break
    fi
    if ! kill -0 "$boot_pid" 2>/dev/null; then
      echo "ERROR: backend 기동 실패 — application-local.yaml / Docker 확인" >&2
      exit 1
    fi
    sleep 2
  done
  if ! table_exists; then
    echo "ERROR: whiskeys 테이블이 생성되지 않았습니다." >&2
    exit 1
  fi
fi

echo "▶ RDS 시드 적재 (reset + import) ..."
LOCAL_ENV_FILE="$ROOT_DIR/.env" \
SEED_FILE="$SEED_FILE" \
RESET_BEFORE=1 \
"$SCRIPT_DIR/rds-load-local-seed.sh"

echo ""
echo "▶ 적재 결과"
docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T mysql \
  mysql -uroot -plocalroot whiskeynote -e \
  "SELECT 'whiskeys' AS t, COUNT(*) AS c FROM whiskeys
   UNION SELECT 'tags', COUNT(*) FROM tags
   UNION SELECT 'reviews', COUNT(*) FROM reviews;" 2>/dev/null

echo ""
echo "✅ 완료 — backend 재시작 후 확인:"
echo "   cd backend && ./gradlew bootRun"
echo "   cd frontend && npm run dev"
echo "   http://localhost:5173"
