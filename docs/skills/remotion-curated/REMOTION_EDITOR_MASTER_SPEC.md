# VT_E1 Remotion Editor Master Spec (V2)

Date: 2026-04-30  
Owner: ViewTube / VT_E1  
Status: Authoritative engineering spec (decision complete)

## 1) Purpose
This document defines the canonical technical contract for VT_E1 as a web-based, Remotion-native, AI-assisted video editor. It is the source of truth for architecture, data model, rendering parity, deterministic behavior, AI patching, and performance constraints.

## 2) Product + Technical Invariants
- Timeline is canonical source of truth. All edits and AI actions resolve to timeline mutations.
- Preview and export must be parity-safe for timing, layering, transforms, transitions, and effect outputs.
- Deterministic rendering is mandatory. No nondeterministic frame logic is allowed in render paths.
- AI is planner/co-pilot, not direct global mutator. AI outputs typed patches gated by validation.
- Editor must remain progressive: simple default UX, advanced tools on demand.

## 3) Canonical Domain Model

### 3.1 Core Entities
- `EditorProject`
  - Contains `meta`, `tracks`, `layers`, `clips`, `transitions`, `camera`, `render`, `ai`, and version metadata.
- `Track`
  - Ordered lane with `id`, `kind`, `order`, visibility/mute/lock flags, and optional UI hints.
- `Layer`
  - Visual/audio payload container. Bound to clips through `layerId`.
- `Clip`
  - Timeline segment with `start`, `end`, `trackId`, `layerId`, motion/effect refs, and keyframe channels.
- `Keyframe`
  - Typed channel point: `offsetSec`, interpolation, easing, value.
- `Transition`
  - Seam relation between adjacent clips with `type`, `durationSec`, and params.

### 3.2 Advanced Entities
- `EffectStack`
  - Ordered list of typed effect nodes with normalized params.
- `TimelineCommand`
  - Reducer command envelope for deterministic mutations and undo/redo.
- `RenderRequest`
  - Normalized export request used by both preview compiler and final renderer.
- `AIGenerationPatch`
  - Schema-constrained edit proposal from AI; never auto-applies in production mode.
- `OverlayVisualClipPayload`
  - Transparent effect clip payload for timeline-placed visual FX outputs.

## 4) Doc-Level Contracts (Authoritative Types)

```ts
type FeatureRegistryItem = {
  id: string;
  title: string;
  phase: 'A' | 'B' | 'C' | 'D' | 'E';
  status: 'done' | 'partial' | 'next' | 'later';
  tags: string[];
  mergedFrom: string[];
  acceptance: string[];
  score: number;
};

type FeatureMergeDecision = {
  sourceIds: string[];
  decision: 'merged' | 'new-101+';
  rationale: string;
};

type EffectParamDefinition = {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'enum' | 'color';
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  defaultValue: unknown;
};

type EffectDefinition = {
  id: string;
  label: string;
  category: string;
  summary: string;
  defaults: Record<string, unknown>;
  params: EffectParamDefinition[];
};

type AIGenerationPatch = {
  id: string;
  intent: string;
  commands: TimelineCommand[];
  costEstimate?: { tokens: number; usd: number };
};

type ApplyPatchGate = {
  mode: 'draft-only' | 'manual-apply';
  requiresDiffReview: boolean;
  requiresHumanConfirm: boolean;
};

type RenderParityContract = {
  previewRef: string;
  compileSnapshotRef: string;
  diagnostics: string[];
  mismatchPolicy: 'warn' | 'block-final';
};

type AgentSkillContract = {
  triggers: string[];
  requiredInputs: string[];
  invariants: string[];
  successChecks: string[];
};

type RuntimeMode = 'full-online' | 'portable-offline';

type FeatureGateState = {
  enabled: boolean;
  reason?: string;
  mode: RuntimeMode;
};

type RuntimeCapabilityMap = {
  providers: FeatureGateState;
  mcpBits: FeatureGateState;
  remoteAssets: FeatureGateState;
  localCatalog: FeatureGateState;
  localTimelineEdit: FeatureGateState;
};

type SchemaEvidenceItem = {
  id: string;
  sourceOffset: string;
  tag:
    | 'timeline'
    | 'schema-contracts'
    | 'transitions'
    | 'captions'
    | 'overlay-fx'
    | 'ai-orchestration'
    | 'render-determinism'
    | 'runtime';
  proposal: string;
  adoptedAs?: string;
  rationale: string;
};

type AdoptedContract = {
  name: string;
  domain: string;
  schemaShape: string;
  invariants: string[];
  fallbackBehavior: string;
};

type DocAdoptionRecord = {
  contractId: string;
  targetDoc: string;
  sectionAnchor: string;
  decision: 'adopted' | 'adapted' | 'rejected';
};
```

## 5) Remotion Standards and Invariants
- Use `useCurrentFrame()` and `useVideoConfig()` as the only frame/time base in visual components.
- Use seeded randomness (`random(seed)` or deterministic equivalent) for all procedural/noise behaviors.
- Avoid side-effectful frame logic (`Date.now`, unseeded `Math.random`, render-time network calls).
- Normalize composition metadata through one compile path (`fps`, `durationInFrames`, `width`, `height`).
- Use `delayRender`/`continueRender` for heavyweight async prerequisites.
- Keep animation transforms expressible through frame-indexed interpolation/spring logic.
- Ensure local preview and final render share compile contracts.

## 6) Timeline + Interaction Contract
- All editor operations map to `TimelineCommand` and are replayable.
- Required command families:
  - clip: add/move/trim/split/delete/group/ungroup
  - keyframe: add/update/delete/multi-edit/copy-paste
  - transition: add/update/delete/seam-link
  - effect: add/update/delete/reorder/toggle
  - track: add/reorder/mute/solo/lock/resize
- Snap policy supports `hard | soft | off` with deterministic behavior.
- Advanced seam operations must not violate clip timing invariants.

## 7) Visual FX Studio Contract
- Unified effect editing flow must be clip-first and live-preview-first.
- Effects can be applied to selected clip or inserted as transparent timeline overlay clips.
- Overlay clips are first-class timeline entities and reorderable in stack.
- Effect definitions are registry-driven for extensibility.
- Initial advanced visuals include shader-like overlays, light leaks, starburst/noise families, and CRT-style passes.

## 8) AI Orchestration Contract
- AI pipeline follows staged roles (analyze → plan → propose patch → validate → human apply).
- AI cannot mutate timeline state directly in final mode.
- Patch validation must enforce:
  - schema validity,
  - clip bounds/timing constraints,
  - deterministic effect parameter bounds,
  - cost and scope visibility.
- Patch application requires diff visualization and human confirmation unless explicitly downgraded to draft sandbox.

## 9) Performance + Reliability Envelope
- Target responsive preview at common creator resolutions with progressive quality controls.
- Use off-main-thread strategies for heavy compositing where possible.
- Support local-first editing and optional cloud/distributed final rendering.
- Render queue must capture diagnostics for parity and failure triage.
- Failure classes and required behavior:
  - asset missing/unreadable -> inline fault marker + fallback frame
  - decode/import mismatch -> non-crashing diagnostic state
  - AI patch validation failure -> reject + actionable error list
  - preview/final parity mismatch -> report + policy action (`warn` or `block-final`)

## 10) Integrations Contract (Value-First)
- External APIs are modular adapters with explicit capability flags.
- Integrations include (phased): media generation, stock/B-roll, TTS/audio polish, concept/story assist.
- Each adapter must expose:
  - latency/quality profile,
  - cost visibility,
  - deterministic usage mode where feasible,
  - graceful fallback.

## 11) Runtime Mode Contract
- VT_E1 supports two runtime modes:
  - `full-online` (localhost/server origin): all integrations, provider search, and MCP-assisted pathways available.
  - `portable-offline` (`file://`): origin-dependent features are gated off with explicit reason text, while local timeline/FX/template workflows remain fully usable.
- Gate keys are canonical and stable:
  - `providers`, `mcpBits`, `remoteAssets`, `localCatalog`, `localTimelineEdit`.
- Any blocked action must resolve into deterministic UI state (`disabled`/`error`) and must never hard-crash the editor.
- Mode disclosure is mandatory in UI with compact capability visibility so users understand active limitations.

## 12) Test and Acceptance Requirements

### 12.1 Determinism
- Same project + same seed + same build must produce stable output.
- No frame-level flicker from nondeterministic calls.

### 12.2 Parity
- 3-frame smoke (`start`, `mid`, `end`) must pass for compile snapshot.
- Preview transform/effect stack and final output must align within contract.

### 12.3 Timeline Integrity
- Split/trim/move/group/seam operations preserve deterministic ordering and bounds.
- Undo/redo reproduces exact prior state.

### 12.4 AI Safety + Clarity
- Patch diff required before apply in manual modes.
- Token/cost telemetry visible per AI action.

### 12.5 FX Studio
- Active effect preview updates live while editing.
- Clip-apply and overlay-insert both produce expected visual behavior.

### 12.6 Runtime Gating
- `file://` load path: app boots and core editing works without provider/MCP failures.
- `localhost` path: provider and MCP-assisted pathways remain available.
- Remote URL ingestion is blocked only in portable mode and remains available online.

## 13) Out-of-Scope for This Spec Revision
- Native app runtime targets.
- Non-Remotion export engines as primary path.
- Fully autonomous background AI edits without user confirmation.

## 14) Governance
- This spec and the unified intent document must remain vocabulary-aligned.
- Feature roadmap authority lives in `VT_E1_MASTERPLAN_100_PLUS.md`.
- Schema-harvest provenance authority lives in `VT_E1_SCHEMA_EVIDENCE_APPENDIX.md`.
- Any new subsystem must define entity impacts, command impacts, parity impacts, and deterministic guarantees before implementation.
