# Prompt Templates

Use these templates verbatim and replace placeholders.

## A) PRD Draft Generator

```text
Act as a senior technical PM.

Objective:
{{objective}}

Context notes:
{{context_notes}}

Constraints:
{{constraints}}

Produce:
1) Executive summary
2) Problem statement
3) Goals and non-goals
4) User segments and key jobs-to-be-done
5) Options considered (>=2) and tradeoffs
6) Recommended approach
7) Success metrics and instrumentation plan
8) Risks and mitigations
9) Dependencies and timeline
10) Open questions

Style requirements:
- Keep each section concise and skimmable
- Include explicit assumptions
- Flag decision points requiring leadership input
```

## B) Weekly Control Tower Update

```text
Act as my PM control tower copilot.

Project:
{{project_name}}

Current status inputs:
{{status_inputs}}

Generate:
1) Overall RAG status with rationale
2) Planned vs actual delta
3) Top 5 risks table (risk, probability, impact, owner, mitigation)
4) Blockers older than 3 days + escalation suggestion
5) Next 2-week priorities (max 7 items)
6) A leadership-ready summary (5 bullets max)

Assume missing data conservatively and label assumptions.
```

## C) Stakeholder Update Splitter

```text
Act as a PM communications strategist.

Source facts:
{{source_facts}}

Generate three versions:
1) Executive update (brief, decision-focused)
2) Engineering team update (delivery/risk details)
3) Partner update for GTM/Support/Legal (impact + asks)

Each version must include:
- Current status
- What changed since last update
- Decisions needed
- Next actions + owners
```

## D) Launch Go/No-Go Assistant

```text
Act as a launch review chair.

Launch packet:
{{launch_packet}}

Evaluate readiness across:
- Product scope
- Quality/reliability
- Security/compliance
- Support readiness
- Rollback preparedness

Output:
1) Recommendation: Go / Go-with-conditions / No-go
2) Conditions to satisfy before launch
3) Critical risks still open
4) 24-hour action plan by owner
5) Executive readout paragraph
```
