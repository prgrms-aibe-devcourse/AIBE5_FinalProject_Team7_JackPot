#!/usr/bin/env bash
# test RDS 를 바라보는 backend-test 컨테이너 기동/중지 (prod 와 분리)
#
# 앱 EC2(Termius whiskeynote-app)에서:
#   cd ~/whiskeynote
#   chmod +x deploy/run-backend-test.sh
#   ./deploy/run-backend-test.sh start    # :8081 에 test backend
#   ./deploy/run-backend-test.sh status
#   ./deploy/run-backend-test.sh stats    # docker stats (CLI 모니터링)
#   ./deploy/run-backend-test.sh logs
#   ./deploy/run-backend-test.sh stop
#
# Grafana Spring Boot Observability → Application Name: whiskeynote-test
#
# k6 서버에서 부하:
#   TARGET=test SCENARIO=review-list ./run-load.sh
#
set -euo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-backend-test}"
HOST_PORT="${HOST_PORT:-8081}"
TEST_DB_HOST="${TEST_DB_HOST:-team7-whiskeynote-test-db.coqwxjz7zumt.ap-northeast-2.rds.amazonaws.com}"
TEST_DB_USER="${TEST_DB_USER:-admin}"
TEST_DB_PASSWORD="${TEST_DB_PASSWORD:-WhiskeyTest2026}"
TEST_DB_NAME="${TEST_DB_NAME:-whiskeynote}"
BACKEND_IMAGE="${BACKEND_IMAGE:-495264909330.dkr.ecr.ap-northeast-2.amazonaws.com/team7/whiskeynote-backend:latest}"
COMPOSE_DIR="${COMPOSE_DIR:-$HOME/whiskeynote}"

if [[ "${TEST_DB_HOST}" == *prod* ]]; then
  echo "거부: prod 호스트입니다 (${TEST_DB_HOST}). test RDS 만 사용하세요." >&2
  exit 1
fi

ds_url="jdbc:mysql://${TEST_DB_HOST}:3306/${TEST_DB_NAME}?serverTimezone=Asia/Seoul&characterEncoding=UTF-8"

start() {
  if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
    docker rm -f "${CONTAINER_NAME}" >/dev/null
  fi
  cd "${COMPOSE_DIR}"
  docker run -d --name "${CONTAINER_NAME}" --network whiskeynote_default \
    --env-file .env \
    -e SPRING_PROFILES_ACTIVE=prod \
    -e SPRING_DATASOURCE_URL="${ds_url}" \
    -e SPRING_DATASOURCE_USERNAME="${TEST_DB_USER}" \
    -e SPRING_DATASOURCE_PASSWORD="${TEST_DB_PASSWORD}" \
    -e SPRING_ELASTICSEARCH_URIS=http://elasticsearch:9200 \
    -e MANAGEMENT_METRICS_TAGS_APPLICATION=whiskeynote-test \
    -p "${HOST_PORT}:8080" \
    "${BACKEND_IMAGE}"
  echo "backend-test started → http://$(curl -s ifconfig.me 2>/dev/null || echo '<EC2_IP>'):${HOST_PORT}/api/v1"
  echo "health: curl -s http://localhost:${HOST_PORT}/actuator/health"
}

stop() {
  docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true
  echo "backend-test stopped"
}

status() {
  docker ps -a --filter "name=${CONTAINER_NAME}" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
  curl -sf "http://localhost:${HOST_PORT}/actuator/health" 2>/dev/null && echo || echo "health: not ready"
}

logs() {
  docker logs -f "${CONTAINER_NAME}"
}

stats() {
  if ! docker ps --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
    echo "backend-test 가 실행 중이 아닙니다. ./deploy/run-backend-test.sh start 먼저 실행하세요." >&2
    exit 1
  fi
  echo "Ctrl+C 로 종료 | prod backend 와 나란히: docker stats backend backend-test"
  docker stats "${CONTAINER_NAME}"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  stats) stats ;;
  logs) logs ;;
  *)
    echo "Usage: $0 {start|stop|status|stats|logs}" >&2
    exit 1
    ;;
esac
