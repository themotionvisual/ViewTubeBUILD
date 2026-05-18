## Adaptive Editor Shell Plan (UI-Only Neo-Brutalism)

### Summary
Build a single adaptive editor shell where Neo-brutalism is strictly UI styling, not render logic.
Core behavior:
- Adaptive layout by aspect ratio
- Media player on the right side in vertical mode
- Bottom timeline is always the canonical editing surface
- 8 core mode tabs with one shared AI layer that can generate into any tab via preview-first insertion

### Implementation Changes
- Workspace layout system with vertical/landscape templates and per-project override.
- 8-tab architecture: media, ai, text, transitions, motion, audio, captions, extensions.
- AI workflow: Draft Then Insert only, explicit user confirmation before timeline mutation.
- Extensions: provider cards with Plan Gate/API Key states and capability mapping.
- Style boundary: `UIStyleLayer` vs `RenderStyleLayer`, with optional Neo preset only when selected.

### Public APIs / Interfaces / Types
- `EditorLayoutMode = "vertical" | "landscape"`
- `EditorTabId = "media" | "ai" | "text" | "transitions" | "motion" | "audio" | "captions" | "extensions"`
- `AIGenerateDraftRequest` / `AIGenerateDraftResponse`
- `TimelineApplyRequest` with mode + target
- `ExtensionProviderConfig`
- `StyleBoundaryPolicy`

### Test Plan
- Layout mode correctness and per-project override persistence.
- AI draft per-tab generation and explicit confirm-before-apply.
- Provider state transitions and capability gating.
- Style isolation between shell theme and render preset.

### Assumptions
- Existing `/shorts` implementation is the seed and gets refactored.
- Timeline remains single source of truth.
- Extensions configured in Extensions tab for V1.
- Export/publish can remain global actions outside the 8 tabs in V1.
