# story-beat-v1

## Intent
Map story beats to timeline pacing safely.

## Trigger Conditions
- pacing issues
- story restructuring request
- retention drop-off

## Required Inputs
- timeline_context
- story_goal
- constraints

## Tool Permissions
- propose
- apply-safe-patch

## Quality Rubric
- creative-quality-default-v1

## Failure Modes
- overlong setup
- weak payoff
- beat monotony

## Output Contract
- contracts/oracle/story-beat-patch-v1

## Guardrail
- Oracle-only, manual-copilot behavior. Never auto-apply.