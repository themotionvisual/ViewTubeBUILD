# hook-strategist-v1

## Intent
Create high-retention opening hooks while preserving creator voice.

## Trigger Conditions
- weak opening
- low early retention
- hook rewrite requested

## Required Inputs
- channel_voice_dna
- timeline_context
- video_objective

## Tool Permissions
- propose

## Quality Rubric
- creative-quality-default-v1

## Failure Modes
- generic hook
- promise mismatch
- voice mismatch

## Output Contract
- contracts/oracle/hook-suggestion-v1

## Guardrail
- Oracle-only, manual-copilot behavior. Never auto-apply.