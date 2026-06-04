#!/usr/bin/env bash
# EC2에서 실행: RDS에 deploy/schema-migrate.sql 적용 후 backend 재시작
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-$HOME/whiskeynote/.env}"
SQL_FILE="${SQL_FILE:-$SCRIPT_DIR/schema-migrate.sql}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env not found: $ENV_FILE" >&2
  exit 1
fi
if [[ ! -f "$SQL_FILE" ]]; then
  echo "ERROR: SQL not found: $SQL_FILE" >&2
  exit 1
fi

read_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -1 || true)"
  if [[ -z "$line" ]]; then
    return 1
  fi
  printf '%s' "${line#*=}"
}

SPRING_DATASOURCE_URL="$(read_env SPRING_DATASOURCE_URL || true)"
SPRING_DATASOURCE_USERNAME="$(read_env SPRING_DATASOURCE_USERNAME || true)"
SPRING_DATASOURCE_PASSWORD="$(read_env SPRING_DATASOURCE_PASSWORD || true)"

if [[ -z "$SPRING_DATASOURCE_URL" ]]; then
  echo "ERROR: SPRING_DATASOURCE_URL missing in .env" >&2
  exit 1
fi

JDBC_HOST_PORT_DB="$(echo "$SPRING_DATASOURCE_URL" | sed -E 's|^jdbc:mysql://([^/?]+)/([^?]+).*|\1 \2|')"
read -r MYSQL_HOST_PORT MYSQL_DB <<< "$JDBC_HOST_PORT_DB"
MYSQL_HOST="${MYSQL_HOST_PORT%%:*}"
MYSQL_PORT="${MYSQL_HOST_PORT##*:}"
[[ "$MYSQL_HOST" == "$MYSQL_PORT" ]] && MYSQL_PORT=3306

echo "Applying migration to ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB} ..."

if command -v mysql >/dev/null 2>&1; then
  MYSQL_CMD=(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$SPRING_DATASOURCE_USERNAME" "-p${SPRING_DATASOURCE_PASSWORD}" "$MYSQL_DB")
else
  MYSQL_CMD=(docker run --rm -i mysql:8.4 mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$SPRING_DATASOURCE_USERNAME" "-p${SPRING_DATASOURCE_PASSWORD}" "$MYSQL_DB")
fi

"${MYSQL_CMD[@]}" < "$SQL_FILE"
echo "Migration OK."

if [[ -d "$HOME/whiskeynote" ]] && command -v docker >/dev/null 2>&1; then
  cd "$HOME/whiskeynote"
  docker compose pull
  docker compose up -d
  docker compose restart backend
  echo "Containers updated. Waiting for startup..."
  sleep 20
  curl -s -o /dev/null -w "columns %{http_code}\n" "http://localhost/api/v1/community/columns?page=0&size=10" || true
fi
