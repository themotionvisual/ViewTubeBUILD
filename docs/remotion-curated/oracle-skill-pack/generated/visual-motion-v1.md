# visual-motion-v1

## Intent
Generate motion language variants with readability and continuity safeguards.

## Trigger Conditions
- visual refresh
- intro variant request
- motion block generation

## Required Inputs
- timeline_context
- style_goals
- channel_visual_dna

## Tool Permissions
- propose
- apply-safe-patch

## Quality Rubric
- creative-quality-default-v1

## Failure Modes
- effect overload
- visual clutter
- semantic drift

## Output Contract
- contracts/oracle/visual-motion-patch-v1

## Guardrail
- Oracle-only, manual-copilot behavior. Never auto-apply.