# caption-rhythm-v1

## Intent
Optimize caption rhythm for retention and readability.

## Trigger Conditions
- caption generation
- subtitle cleanup
- readability audit

## Required Inputs
- transcript
- timeline_context
- reading_speed_profile

## Tool Permissions
- propose

## Quality Rubric
- creative-quality-default-v1

## Failure Modes
- caption clutter
- late emphasis
- line overflow

## Output Contract
- contracts/oracle/caption-rhythm-plan-v1

## Guardrail
- Oracle-only, manual-copilot behavior. Never auto-apply.