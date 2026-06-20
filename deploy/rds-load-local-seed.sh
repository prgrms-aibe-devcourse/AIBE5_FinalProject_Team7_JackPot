#!/usr/bin/env bash
# deploy/rds-local-seed.sql → 로컬 MySQL(docker compose) 적재
#
# 사용 예:
#   LOCAL_ENV_FILE=.env SEED_FILE=deploy/rds-local-seed.sql ./deploy/rds-load-local-seed.sh
#
# 전제: docker compose mysql 기동, application-local / .env 가 로컬 DB 가리킴
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${LOCAL_ENV_FILE:-$ROOT_DIR/.env}"
SEED_FILE="${SEED_FILE:-$SCRIPT_DIR/rds-local-seed.sql}"
RESET_BEFORE="${RESET_BEFORE:-1}"

if [[ ! -f "$SEED_FILE" ]]; then
  echo "ERROR: seed file not found: $SEED_FILE" >&2
  echo "먼저 RDS_ENV_FILE=.env.rds ./deploy/rds-dump-local-seed.sh 를 실행하세요." >&2
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

if [[ -z "$SPRING_DATASOURCE_URL" ]]; then
  echo "ERROR: SPRING_DATASOURCE_URL missing in $ENV_FILE" >&2
  exit 1
fi

JDBC_HOST_PORT_DB="$(echo "$SPRING_DATASOURCE_URL" | sed -E 's|^jdbc:mysql://([^/?]+)/([^?]+).*|\1 \2|')"
read -r MYSQL_HOST_PORT MYSQL_DB <<< "$JDBC_HOST_PORT_DB"
MYSQL_HOST="${MYSQL_HOST_PORT%%:*}"
MYSQL_PORT="${MYSQL_HOST_PORT##*:}"
[[ "$MYSQL_HOST" == "$MYSQL_PORT" ]] && MYSQL_PORT=3306

mysql_exec() {
  if [[ "$MYSQL_HOST" == "mysql" ]] && command -v docker >/dev/null 2>&1; then
    docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T mysql \
      mysql -u "$SPRING_DATASOURCE_USERNAME" "-p${SPRING_DATASOURCE_PASSWORD}" "$MYSQL_DB" "$@"
    return
  fi
  if command -v mysql >/dev/null 2>&1; then
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$SPRING_DATASOURCE_USERNAME" "-p${SPRING_DATASOURCE_PASSWORD}" "$MYSQL_DB" "$@"
  else
    docker run --rm -i mysql:8.4 mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$SPRING_DATASOURCE_USERNAME" "-p${SPRING_DATASOURCE_PASSWORD}" "$MYSQL_DB" "$@"
  fi
}

echo "Loading seed into ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB} ..."

if [[ "$RESET_BEFORE" == "1" ]]; then
  RESET_SQL="$SCRIPT_DIR/local-seed-reset.sql"
  echo "Resetting tables ($RESET_SQL) ..."
  mysql_exec < "$RESET_SQL"
fi

mysql_exec < "$SEED_FILE"

PATCH_SQL="$SCRIPT_DIR/patch-user-introduction.sql"
if [[ -f "$PATCH_SQL" ]]; then
  echo "Applying schema patch ($PATCH_SQL) ..."
  mysql_exec < "$PATCH_SQL"
fi

echo "Seed load OK."
echo "backend 재시작 후 http://localhost:5173 에서 확인하세요."
