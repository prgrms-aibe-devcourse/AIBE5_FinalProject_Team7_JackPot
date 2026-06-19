#!/usr/bin/env bash
# RDS → 로컬 MySQL 시드 동기화 (dump + load)
#
# 1) deploy/.env.rds.example → .env.rds (프로젝트 루트, git 제외)
# 2) docker compose up -d mysql
# 3) ./deploy/sync-rds-to-local.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

RDS_ENV_FILE="${RDS_ENV_FILE:-$ROOT_DIR/.env.rds}" \
OUT_FILE="${OUT_FILE:-$SCRIPT_DIR/rds-local-seed.sql}" \
"$SCRIPT_DIR/rds-dump-local-seed.sh"

LOCAL_ENV_FILE="${LOCAL_ENV_FILE:-$ROOT_DIR/.env}" \
SEED_FILE="${SEED_FILE:-$SCRIPT_DIR/rds-local-seed.sql}" \
RESET_BEFORE="${RESET_BEFORE:-1}" \
"$SCRIPT_DIR/rds-load-local-seed.sh"

echo "Done. RDS 데이터가 로컬 MySQL에 반영되었습니다."
