---
name: viewtube-docs-grill
description: Stress-test ViewTube plans, claims and proposed changes against current repository docs, canonical owners and verification evidence before implementation or merge.
---

# VIEWTUBE DOCS GRILL

Use when a plan sounds plausible but may conflict with current architecture, migrations, or runtime reality.

## Grill sequence
1. Identify every factual or architectural claim in the proposal.
2. Find the strongest current document/code owner for each claim.
3. Mark each claim: supported, stale, contradicted, ambiguous, or unverified.
4. Challenge scope creep, duplicate ownership, hidden migration cost, missing mobile/error states, and release assumptions.
5. Rewrite the proposal into the smallest evidence-aligned mission with explicit non-goals and checks.

## Output
- claims matrix
- contradictions and stale assumptions
- required source reads
- corrected mission boundary
- tests/receipts required before merge

A grill is advisory. It does not change Task Index status or production code.
