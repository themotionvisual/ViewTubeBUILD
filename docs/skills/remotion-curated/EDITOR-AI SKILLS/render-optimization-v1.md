# render-optimization-v1

## Intent
Recommend editable vs pre-render output mode for speed and reversibility.

## Trigger Conditions
- heavy scene
- lag mitigation
- export optimization

## Required Inputs
- asset_complexity
- timeline_context
- render_target

## Tool Permissions
- read
- propose
- apply-safe-patch

## Quality Rubric
- creative-quality-default-v1

## Failure Modes
- irreversible flattening
- quality loss
- wrong profile

## Output Contract
- contracts/oracle/render-optimization-v1

## Guardrail
- Oracle-only, manual-copilot behavior. Never auto-apply.