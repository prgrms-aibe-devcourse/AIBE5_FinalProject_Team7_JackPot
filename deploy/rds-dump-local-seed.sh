#!/usr/bin/env bash
# RDS(또는 원격 MySQL) 데이터 전체 → 로컬 확인용 단일 시드 SQL 생성
#
# 사용 예 (RDS .env 별도 파일 권장):
#   RDS_ENV_FILE=.env.rds OUT_FILE=deploy/rds-local-seed.sql ./deploy/rds-dump-local-seed.sh
#
# OUT_FILE 은 .gitignore (deploy/rds-*.sql) — 커밋하지 마세요.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${RDS_ENV_FILE:-$ROOT_DIR/.env}"
OUT_FILE="${OUT_FILE:-$SCRIPT_DIR/rds-local-seed.sql}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found: $ENV_FILE" >&2
  echo "RDS 접속 정보가 담긴 .env.rds 를 만들고 RDS_ENV_FILE=.env.rds 로 실행하세요." >&2
  exit 1
fi

read_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -1 || true)"
  [[ -z "$line" ]] && return 1
  printf '%s' "${line#*=}"
}

SPRING_DATASOURCE_URL="$(read_env SPRING_DATASOURCE_URL || true)"
SPRING_DATASOURCE_USERNAME="$(read_env SPRING_DATASOURCE_USERNAME || true)"
SPRING_DATASOURCE_PASSWORD="$(read_env SPRING_DATASOURCE_PASSWORD || true)"

if [[ -z "$SPRING_DATASOURCE_URL" || -z "$SPRING_DATASOURCE_USERNAME" ]]; then
  echo "ERROR: SPRING_DATASOURCE_URL / USERNAME missing in $ENV_FILE" >&2
  exit 1
fi

# 호스트만 넣은 경우 jdbc URL 로 보정 (예: team7-....rds.amazonaws.com)
if [[ "$SPRING_DATASOURCE_URL" != jdbc:* ]]; then
  if [[ "$SPRING_DATASOURCE_URL" == */* ]]; then
    SPRING_DATASOURCE_URL="jdbc:mysql://${SPRING_DATASOURCE_URL}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul"
  else
    SPRING_DATASOURCE_URL="jdbc:mysql://${SPRING_DATASOURCE_URL}:3306/whiskeynote?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul"
  fi
fi

JDBC_HOST_PORT_DB="$(echo "$SPRING_DATASOURCE_URL" | sed -E 's|^jdbc:mysql://([^/?]+)/([^?]+).*|\1 \2|')"
read -r MYSQL_HOST_PORT MYSQL_DB <<< "$JDBC_HOST_PORT_DB"
MYSQL_HOST="${MYSQL_HOST_PORT%%:*}"
MYSQL_PORT="${MYSQL_HOST_PORT##*:}"
[[ "$MYSQL_HOST" == "$MYSQL_PORT" ]] && MYSQL_PORT=3306

EXCLUDE_REFRESH="${EXCLUDE_REFRESH:-0}"

echo "Dumping ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB} → ${OUT_FILE}"

DUMP_ARGS=(
  -h "$MYSQL_HOST"
  -P "$MYSQL_PORT"
  -u "$SPRING_DATASOURCE_USERNAME"
  "-p${SPRING_DATASOURCE_PASSWORD}"
  --single-transaction
  --quick
  --hex-blob
  --no-create-info
  --complete-insert
  --skip-triggers
  --set-gtid-purged=OFF
  --default-character-set=utf8mb4
  --ignore-table="${MYSQL_DB}.flyway_schema_history"
)

if [[ "$EXCLUDE_REFRESH" == "1" ]]; then
  DUMP_ARGS+=(--ignore-table="${MYSQL_DB}.refresh_tokens")
fi

if command -v mysqldump >/dev/null 2>&1; then
  MYSQLDUMP=(mysqldump "${DUMP_ARGS[@]}" "$MYSQL_DB")
else
  MYSQLDUMP=(docker run --rm mysql:8.4 mysqldump "${DUMP_ARGS[@]}" "$MYSQL_DB")
fi

{
  echo "-- whiskeynote RDS/local seed dump"
  echo "-- generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "-- source: ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB}"
  echo "-- load: RDS_ENV_FILE=.env.local ./deploy/rds-load-local-seed.sh"
  echo ""
  echo "SET NAMES utf8mb4;"
  echo "SET FOREIGN_KEY_CHECKS = 0;"
  echo "SET UNIQUE_CHECKS = 0;"
  echo ""
  "${MYSQLDUMP[@]}"
  echo ""
  echo "SET UNIQUE_CHECKS = 1;"
  echo "SET FOREIGN_KEY_CHECKS = 1;"
} > "$OUT_FILE"

BYTES="$(wc -c < "$OUT_FILE" | tr -d ' ')"
echo "OK: ${OUT_FILE} (${BYTES} bytes)"
echo "다음: 로컬 MySQL .env 로 바꾼 뒤 ./deploy/rds-load-local-seed.sh"
