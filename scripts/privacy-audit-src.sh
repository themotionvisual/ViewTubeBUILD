#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PATTERNS=(
  "UCnWQhc0LxuJPtFhLBZYfgFw"
  "omcLj50cj4M"
  "v3sy18T2MbA"
  "Napoleon"
  "Austerlitz"
  "Brunswickers"
  "Pyramids"
  "Napoleonic"
)

EXIT_CODE=0
HITS_FILE="$(mktemp -t viewtube-privacy-hits.XXXXXX)"
trap 'rm -f "$HITS_FILE"' EXIT

for PATTERN in "${PATTERNS[@]}"; do
  if rg -n "$PATTERN" src --glob '*.{ts,tsx}' >"$HITS_FILE" 2>/dev/null; then
    echo "[privacy-audit] Found restricted pattern: $PATTERN"
    sed -n '1,80p' "$HITS_FILE"
    EXIT_CODE=1
  fi
done

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "[privacy-audit] PASS: no restricted personal/source patterns found in src/**/*.ts(x)."
fi

exit $EXIT_CODE
