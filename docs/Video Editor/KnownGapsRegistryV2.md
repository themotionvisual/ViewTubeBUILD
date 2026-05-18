# KnownGapsRegistryV2

## Fields
- `id`
- `domain`
- `status` (`implemented|partial|missing|blocked|regressed`)
- `depends_on`
- `determinism_risk` (`low|medium|high`)
- `parity_risk` (`low|medium|high`)
- `owner_skill`
- `acceptance_test`

## Registry
| id | domain | status | depends_on | determinism_risk | parity_risk | owner_skill | acceptance_test |
|---|---|---|---|---|---|---|---|
| gap-bridge-adapter-v3 | remotion-bridge | missing | timeline-contract-frame-native | medium | high | vt-e1-remotion-render-performance | Export + load bridge smoke |
| gap-export-warning-panel | ux | missing | proj-03 | low | medium | vt-e1-architecture-governance | Warning panel visible with mock warnings |
| gap-parity-hash-snapshots | remotion-bridge | missing | runtime-07 | low | high | vt-e1-remotion-render-performance | start/mid/end hash compare |
| gap-audio-auto-duck | ai-orchestration | partial | audio-lane-analysis | medium | medium | vt-e1-remotion-render-performance | speech/music overlap auto-envelope test |
| gap-timeline-drag-stability | timeline | partial | tl-05 | high | high | vt-e1-architecture-governance | drag-drop stress test |
| gap-drag-create-track | timeline | partial | tl-06 | medium | high | vt-e1-architecture-governance | drag-down new track creation test |
