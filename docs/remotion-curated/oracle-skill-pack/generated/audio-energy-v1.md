# audio-energy-v1

## Intent
Shape audio dynamics for energy without harming speech clarity.

## Trigger Conditions
- flat audio
- music/sfx planning
- ducking optimization

## Required Inputs
- audio_tracks
- speech_regions
- timeline_context

## Tool Permissions
- propose

## Quality Rubric
- creative-quality-default-v1

## Failure Modes
- voice masking
- energy flatline
- cue spam

## Output Contract
- contracts/oracle/audio-energy-plan-v1

## Guardrail
- Oracle-only, manual-copilot behavior. Never auto-apply.