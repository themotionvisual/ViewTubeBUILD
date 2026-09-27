#!/usr/bin/env python3
"""Print a compact inventory of ViewTube authority documents and likely registries.

Usage:
  python scan_viewtube_authorities.py /path/to/ViewTubeBUILD
"""
from __future__ import annotations

import argparse
from pathlib import Path

KEYWORDS = {
    "architecture": ("architecture", "PRODUCT_ARCHITECTURE", "capabilities", "convergence"),
    "ai_brain": ("brain", "prompt", "AI_SYSTEM", "BRAIN"),
    "editor_render": ("editor", "remotion", "render", "video-director"),
    "ui_dashboard": ("toolbox", "widget", "dashboard", "studio", "component"),
    "youtube_analytics": ("youtube", "analytics", "sync", "publisher", "auth"),
    "governance": ("REGISTRY", "GOVERNANCE", "MASTER_RESOURCE", "MASTER-RESOURCE"),
}


def classify(path: Path) -> list[str]:
    text = str(path).lower()
    return [name for name, needles in KEYWORDS.items() if any(n.lower() in text for n in needles)]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("--max", type=int, default=250)
    args = parser.parse_args()
    root = args.repo.resolve()
    if not (root / "package.json").exists():
        parser.error(f"not a ViewTube repository: {root}")

    candidates = []
    for base in (root / "docs", root / "src", root / "server", root / "scripts"):
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if path.is_file() and (path.suffix.lower() in {".md", ".json", ".ts", ".tsx", ".js", ".mjs"}):
                groups = classify(path)
                if groups:
                    candidates.append((path.relative_to(root), groups))

    print(f"repository={root}")
    print(f"candidates={len(candidates)}")
    for relative, groups in sorted(candidates)[: args.max]:
        print(f"[{','.join(groups)}] {relative}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
