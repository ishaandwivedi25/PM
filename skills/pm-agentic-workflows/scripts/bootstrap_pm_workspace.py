#!/usr/bin/env python3
"""Scaffold a PM initiative workspace with standard templates."""

from __future__ import annotations

import argparse
from pathlib import Path

TEMPLATES = {
    "01_prd.md": """# PRD: {initiative}\n\n## Executive Summary\n- Owner: {owner}\n- Horizon: {horizon}\n\n## Problem Statement\n\n## Goals\n\n## Non-Goals\n\n## Options and Tradeoffs\n\n## Recommended Approach\n\n## Success Metrics\n\n## Risks and Mitigations\n\n## Dependencies\n\n## Open Questions\n""",
    "02_execution_control_tower.md": """# Execution Control Tower: {initiative}\n\n## Current RAG Status\n\n## Planned vs Actual\n\n## Top Risks\n| Risk | Probability | Impact | Owner | Mitigation |\n|---|---|---|---|---|\n\n## Blockers and Escalations\n\n## Next 2 Weeks Priorities\n""",
    "03_stakeholder_update.md": """# Stakeholder Update: {initiative}\n\n## Executive Summary\n\n## Progress Since Last Update\n\n## Decisions Needed\n\n## Risks\n\n## Next Actions (Owner + Date)\n""",
    "04_launch_readiness.md": """# Launch Readiness: {initiative}\n\n## Scope Freeze Status\n\n## Quality / Reliability Checks\n\n## Security / Compliance Checks\n\n## Support & Communications Readiness\n\n## Rollback Plan\n\n## Go / No-Go Recommendation\n""",
    "05_retro_and_learning.md": """# Retro and Learning: {initiative}\n\n## What Went Well\n\n## What Did Not Go Well\n\n## Root Causes\n\n## Preventive Investments\n\n## Roadmap Changes\n\n## Follow-up Actions\n""",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--initiative", required=True, help="Initiative name")
    parser.add_argument("--owner", required=True, help="Primary owner")
    parser.add_argument("--horizon", required=True, help="Planning horizon")
    parser.add_argument(
        "--output",
        default=".",
        help="Output directory where initiative workspace folder is created",
    )
    return parser.parse_args()


def slugify(value: str) -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "-" for ch in value)
    while "--" in cleaned:
        cleaned = cleaned.replace("--", "-")
    return cleaned.strip("-") or "initiative"


def main() -> None:
    args = parse_args()
    root = Path(args.output).expanduser().resolve()
    workspace = root / slugify(args.initiative)
    workspace.mkdir(parents=True, exist_ok=True)

    for name, template in TEMPLATES.items():
        content = template.format(
            initiative=args.initiative,
            owner=args.owner,
            horizon=args.horizon,
        )
        (workspace / name).write_text(content, encoding="utf-8")

    print(f"Created workspace: {workspace}")
    print(f"Generated {len(TEMPLATES)} template files")


if __name__ == "__main__":
    main()
