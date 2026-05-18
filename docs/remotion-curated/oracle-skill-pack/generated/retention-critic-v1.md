# retention-critic-v1

## Intent
Diagnose attention risks and suggest reversible fixes.

## Trigger Conditions
- retention audit
- drop-off investigation
- final quality review

## Required Inputs
- timeline_context
- engagement_signals
- caption_audio_state

## Tool Permissions
- read
- propose

## Quality Rubric
- creative-quality-default-v1

## Failure Modes
- false positives
- over-prescriptive edits
- style flattening

## Output Contract
- contracts/oracle/retention-diagnostic-v1

## Guardrail
- Oracle-only, manual-copilot behavior. Never auto-apply.