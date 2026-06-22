#!/usr/bin/env bash
# 테스트 RDS 대량 데이터 시드 스크립트
#
# reviews / tasting_notes 를 INSERT...SELECT 로 지수 증식시켜
# 대용량 상태에서의 쿼리/응답 성능을 측정하기 위한 용도.
#
# !!! 반드시 테스트 RDS 에서만 실행 (prod 호스트는 자동 차단) !!!
#
# 사용 (앱 EC2 안에서, VPC 경유로 RDS 접근):
#   TEST_DB_PASSWORD='...' ./test-db-bulk-seed.sh                  # 기본 목표치로 증식
#   TARGET_REVIEWS=1000000 TARGET_NOTES=500000 ./test-db-bulk-seed.sh
#
set -euo pipefail

TEST_DB_HOST="${TEST_DB_HOST:-team7-whiskeynote-test-db.coqwxjz7zumt.ap-northeast-2.rds.amazonaws.com}"
TEST_DB_USER="${TEST_DB_USER:-admin}"
TEST_DB_PASSWORD="${TEST_DB_PASSWORD:-WhiskeyTest2026}"
TEST_DB_NAME="${TEST_DB_NAME:-whiskeynote}"

# 목표 행 수 (도달할 때까지 두 배씩 증식)
TARGET_REVIEWS="${TARGET_REVIEWS:-500000}"
TARGET_NOTES="${TARGET_NOTES:-300000}"

# prod 보호: 호스트명에 prod 가 들어가면 즉시 중단
if [[ "$TEST_DB_HOST" == *prod* ]]; then
  echo "거부: prod 호스트로 보입니다 ($TEST_DB_HOST). 테스트 RDS 에서만 실행하세요." >&2
  exit 1
fi

mysql_exec() {
  mysql -h "$TEST_DB_HOST" -u "$TEST_DB_USER" -p"$TEST_DB_PASSWORD" "$TEST_DB_NAME" -N -e "$1"
}

count_of() { mysql_exec "SELECT COUNT(*) FROM $1;"; }

echo "대상 DB: $TEST_DB_HOST/$TEST_DB_NAME"
echo "시작 시점 reviews=$(count_of reviews) tasting_notes=$(count_of tasting_notes)"

# reviews 증식 (attached_note_id 는 FK 충돌 방지 위해 NULL)
# 매 라운드 (목표 - 현재) 만큼만 복제해 목표 근처에서 정확히 멈춤
echo "--- reviews -> 목표 $TARGET_REVIEWS ---"
while :; do
  cur="$(count_of reviews)"; [ "$cur" -ge "$TARGET_REVIEWS" ] && break
  remain=$(( TARGET_REVIEWS - cur ))
  mysql_exec "INSERT INTO reviews (user_id, whiskey_id, attached_note_id, rating, public_text, created_at, updated_at)
              SELECT user_id, whiskey_id, NULL, rating, public_text, NOW(6), NOW(6) FROM reviews LIMIT $remain;"
  echo "  reviews=$(count_of reviews)"
done

# tasting_notes 증식
echo "--- tasting_notes -> 목표 $TARGET_NOTES ---"
while :; do
  cur="$(count_of tasting_notes)"; [ "$cur" -ge "$TARGET_NOTES" ] && break
  remain=$(( TARGET_NOTES - cur ))
  mysql_exec "INSERT INTO tasting_notes (user_id, whiskey_id, body_score, finish_score, smoky_score, spicy_score, sweet_score, memo, is_draft, created_at, updated_at)
              SELECT user_id, whiskey_id, body_score, finish_score, smoky_score, spicy_score, sweet_score, memo, is_draft, NOW(6), NOW(6) FROM tasting_notes LIMIT $remain;"
  echo "  tasting_notes=$(count_of tasting_notes)"
done

echo "완료: reviews=$(count_of reviews) tasting_notes=$(count_of tasting_notes)"
