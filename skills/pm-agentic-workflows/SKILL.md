---
name: pm-agentic-workflows
description: End-to-end agentic workflows for technical product/project managers to run discovery, planning, execution control, stakeholder communication, launches, and retrospectives with repeatable artifacts and decision gates. Use when a user asks to set up PM operating rhythms, create PM deliverables quickly, or turn ambiguous project context into structured plans.
---

# PM Agentic Workflows

## Operate with this default sequence

1. Clarify objective, timeline, stakeholders, and constraints.
2. Select one workflow from `references/workflow-playbooks.md`.
3. Use the matching prompt from `references/prompt-templates.md`.
4. Generate artifacts in markdown with explicit sections:
   - Assumptions
   - Risks
   - Decisions
   - Open Questions
   - Next Actions (owner + due date)
5. End with a confidence level and escalation trigger.

## Enforce lightweight intake

Collect only the minimum inputs before starting:

- Problem statement (1-3 sentences)
- Target date or planning horizon
- Team and owners
- Known constraints (budget, dependencies, compliance)
- Success metric

If any are missing, proceed with assumptions and label them clearly.

## Keep outputs manager-friendly

- Prefer bullet points over dense prose.
- Keep every section skimmable in under 2 minutes.
- Limit "next actions" to 3-7 items.
- Include one executive summary at top for leadership forwarding.

## Use the bootstrap script when useful

Use `scripts/bootstrap_pm_workspace.py` to quickly scaffold a new initiative workspace with all standard PM templates.

Example:

```bash
python3 skills/pm-agentic-workflows/scripts/bootstrap_pm_workspace.py \
  --initiative "Identity Migration" \
  --owner "A. Rivera" \
  --horizon "Q3 2026" \
  --output ./pm-workspaces
```

After scaffold generation, fill in each template in this order:

1. `01_prd.md`
2. `02_execution_control_tower.md`
3. `03_stakeholder_update.md`
4. `04_launch_readiness.md`
5. `05_retro_and_learning.md`
