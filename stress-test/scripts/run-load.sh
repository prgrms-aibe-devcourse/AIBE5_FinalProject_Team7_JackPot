#!/usr/bin/env bash
# k6 부하 테스트 통합 실행기 — prod / test-backend 전환
#
# k6 전용 EC2(Termius)에서:
#   cd ~/stress-test
#   chmod +x run-load.sh
#
# ── prod (배포 사이트, prod RDS) ──
#   ./run-load.sh smoke
#   TARGET=prod SCENARIO=whiskey-list RATE=50 DURATION=3m ./run-load.sh
#   TARGET=prod SCENARIO=review-list  RATE=30 DURATION=3m ./run-load.sh
#
# ── test (backend-test :8081 → test RDS, 대량 데이터) ──
#   앱 EC2에서 먼저: ~/whiskeynote/deploy/run-backend-test.sh start
#   k6 서버 SG: 앱 EC2 8081 인바운드 허용 (k6→app EC2)
#   TARGET=test SCENARIO=review-list RATE=30 DURATION=3m ./run-load.sh
#
set -euo pipefail

TARGET="${TARGET:-prod}"
SCENARIO="${SCENARIO:-${1:-smoke}}"
PROD_URL="${PROD_URL:-https://whiskey-note.site/api/v1}"
TEST_APP_HOST="${TEST_APP_HOST:-3.34.23.43}"
TEST_URL="http://${TEST_APP_HOST}:8081/api/v1"

case "${TARGET}" in
  prod)
    BASE_URL="${PROD_URL}"
    ;;
  test)
    BASE_URL="${TEST_URL}"
    echo "[info] test backend → ${BASE_URL} (test RDS, prod 사이트와 무관)"
    echo "[info] backend-test 미기동 시: 앱 EC2에서 deploy/run-backend-test.sh start"
    ;;
  *)
    echo "TARGET must be prod or test (got: ${TARGET})" >&2
    exit 1
    ;;
esac

RATE="${RATE:-50}"
DURATION="${DURATION:-3m}"
WHISKEY_IDS="${WHISKEY_IDS:-1,2,3,5,10}"
RUNS="${RUNS:-1}"

case "${SCENARIO}" in
  smoke)
    echo "== smoke @ ${BASE_URL} =="
    k6 run -e "BASE_URL=${BASE_URL}" -e "WHISKEY_ID=${WHISKEY_ID:-1}" smoke.js
    ;;
  whiskey-list)
    SCRIPT="whiskey-list-rps.js"
    ;;
  review-list)
    SCRIPT="review-list-rps.js"
    RATE="${RATE:-30}"
    ;;
  standardized)
    export BASE_URL RATE DURATION WHISKEY_IDS
    export SCRIPT_NAME="${SCRIPT_NAME:-whiskey-list-rps.js}"
    export ENDPOINT="${ENDPOINT:-/whiskeys?page=0&size=20}"
    export RUNS="${RUNS:-3}"
    exec ./run-standardized-3x.sh
    ;;
  *)
    echo "SCENARIO must be smoke | whiskey-list | review-list | standardized (got: ${SCENARIO})" >&2
    exit 1
    ;;
esac

echo "== ${SCENARIO} @ ${BASE_URL} (TARGET=${TARGET}, RATE=${RATE}, DURATION=${DURATION}) =="
k6 run \
  -e "BASE_URL=${BASE_URL}" \
  -e "RATE=${RATE}" \
  -e "DURATION=${DURATION}" \
  -e "WHISKEY_IDS=${WHISKEY_IDS}" \
  "${SCRIPT}"
