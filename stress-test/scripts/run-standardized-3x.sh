#!/usr/bin/env bash
# 표준화 부하 실험 — 동일 조건으로 N회 반복 실행 후 평균±표준편차 집계.
# k6 전용 서버(Termius 접속)에서 실행 권장.
#
# 사용 예:
#   BASE_URL=https://whiskey-note.site/api/v1 ./run-standardized-3x.sh
#   TARGET=prod  SCENARIO=standardized RUNS=3 ./run-load.sh
#   TARGET=test  SCENARIO=standardized SCRIPT_NAME=review-list-rps.js RUNS=3 ./run-load.sh
#
# 인증이 필요한 엔드포인트를 칠 때만 TOKEN 을 export 하세요.
set -euo pipefail

SCRIPT_NAME="${SCRIPT_NAME:-whiskey-list-rps.js}"
RATE="${RATE:-50}"
DURATION="${DURATION:-3m}"
ENDPOINT="${ENDPOINT:-/whiskeys?page=0&size=20}"
RUNS="${RUNS:-3}"

if [[ -z "${BASE_URL:-}" ]]; then
  echo "BASE_URL is required. Export BASE_URL first. (예: https://whiskey-note.site/api/v1)"
  exit 1
fi

echo "== Standardized experiment =="
echo "SCRIPT_NAME=${SCRIPT_NAME}"
echo "RATE=${RATE}, DURATION=${DURATION}, ENDPOINT=${ENDPOINT}, RUNS=${RUNS}, BASE_URL=${BASE_URL}"
echo

for i in $(seq 1 "${RUNS}"); do
  echo "---- Run ${i}/${RUNS} ----"
  BASE_URL="${BASE_URL}" RATE="${RATE}" DURATION="${DURATION}" ENDPOINT="${ENDPOINT}" TOKEN="${TOKEN:-}" \
    k6 run "${SCRIPT_NAME}" --summary-export "result-${i}.json"
done

python3 - <<'PY'
import json
import statistics

runs = []
i = 1
while True:
    name = f"result-{i}.json"
    try:
        with open(name, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        break
    metrics = data.get("metrics", {})
    duration = metrics.get("http_req_duration", {})
    failed = metrics.get("http_req_failed", {})
    dropped = metrics.get("dropped_iterations", {})
    vus = metrics.get("vus_max", {})

    runs.append({
        "run": i,
        "avg_ms": duration.get("avg"),
        "p95_ms": duration.get("p(95)"),
        "p99_ms": duration.get("p(99)"),
        "failed_rate": failed.get("rate"),
        "dropped": dropped.get("count", 0),
        "max_vus": vus.get("max"),
    })
    i += 1

if not runs:
    print("No result-*.json files found.")
    raise SystemExit(1)

def mean_std(key):
    vals = [r[key] for r in runs if r[key] is not None]
    if not vals:
        return None, None
    mean = statistics.mean(vals)
    std = statistics.pstdev(vals) if len(vals) > 1 else 0.0
    return mean, std

print("\n== Per-run metrics ==")
for r in runs:
    print(
        f"run={r['run']}, avg={r['avg_ms']:.2f}ms, p95={r['p95_ms']:.2f}ms, "
        f"p99={r['p99_ms']:.2f}ms, failed_rate={r['failed_rate']:.4f}, "
        f"dropped={r['dropped']}, max_vus={r['max_vus']}"
    )

print("\n== Aggregated (mean +/- std) ==")
for key, label in [
    ("avg_ms", "avg_ms"),
    ("p95_ms", "p95_ms"),
    ("p99_ms", "p99_ms"),
    ("failed_rate", "failed_rate"),
    ("dropped", "dropped_iterations"),
    ("max_vus", "max_vus"),
]:
    m, s = mean_std(key)
    if m is None:
        continue
    print(f"{label}: {m:.4f} +/- {s:.4f}")
PY

echo
echo "Done. result-*.json files were generated."
