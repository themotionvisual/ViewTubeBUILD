# VT_E1 Remotion Tools Integration Pack

## Sources
- `/Users/cwb/Downloads/viewtube/skills/remotion_skills.md`
- `/Users/cwb/Downloads/viewtube/viewtubeX/public/editors/VT_E1.html`

## Rule Mapping
| Rule | Status | VT_E1 Implementation |
|---|---|---|
| Composition mapping | implemented | `buildResolvedCompositionMeta()` computes fps, duration frames/seconds, width/height, aspect, profile. |
| Props resolution trace | implemented | `buildPropsResolutionTrace()` exports default/input/resolved metadata. |
| Export validation gate | implemented | `validateExportContract()` blocks zero/invalid composition values. |
| Keyframe interpolation semantics | implemented | `valueFromKeyframes()` applies deterministic easing and clamps. |
| Layer mapping (text/shape/media/audio/template) | implemented | Existing `stageLayers`, `renderLayerNode`, `renderTemplateAsset`, preview/export pipeline. |
| Sequencing + transition timing | implemented | Timeline clip start/end with transition influence functions and parity diagnostics. |
| Render payload generation | implemented | `exportRemotionJob()` now emits VT_E1 V3 bridge payload with validated metadata. |
| Unsupported runtime warnings | implemented | `REMOTION_SKILL_RULE_STATUS` injects blocked/partial warnings into preflight/exports. |
| Direct Remotion Composition runtime in HTML | blocked | Standalone HTML cannot run React Remotion composition graph directly. |
| Automated audio ducking lanes | partial | Manual keyframe volume automation works; full auto-duck engine not in VT_E1 HTML runtime. |

## Runtime Constraints
- VT_E1 is a standalone React+Babel HTML editor embedded by iframe.
- Remotion Composition runtime is not directly available inside this standalone HTML execution model.
- Output parity is managed by metadata contracts + deterministic preview/export semantics.

## Verification Checklist
1. Open `/editor-v1` and confirm VT_E1 loads.
2. Export JSON and confirm `schemaVersion` is `VT_E1_EditorProjectV3`.
3. Export Remotion job and confirm payload includes:
   - `compositionMeta.{fps,durationInFrames,durationInSeconds,width,height,aspectRatio,resolutionProfile}`
   - `propsResolutionTrace`
   - `validation.{valid,errors,warnings,normalizedMeta}`
4. Empty timeline export still yields non-zero duration/size metadata.
5. Run preflight diagnostics and confirm blocked runtime rules are shown as warnings, not silent failures.

## Expected Outputs
- `VT_E1.project.v3.json`
- `VT_E1.remotion.mp4.job.v3.json` / `VT_E1.remotion.mov.job.v3.json`
