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
for PATTERN in "${PATTERNS[@]}"; do
  if rg -n "$PATTERN" src --glob '*.{ts,tsx}' >/tmp/viewtube_privacy_hits.txt 2>/dev/null; then
    echo "[privacy-audit] Found restricted pattern: $PATTERN"
    cat /tmp/viewtube_privacy_hits.txt
    EXIT_CODE=1
  fi
done

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "[privacy-audit] PASS: no restricted personal/source patterns found in src/**/*.ts(x)."
fi

exit $EXIT_CODE
