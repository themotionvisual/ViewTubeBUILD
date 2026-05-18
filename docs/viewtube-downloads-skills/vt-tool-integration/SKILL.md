---
name: vt-tool-integration
description: Use this skill when adding new tools, widgets, modules, or AI features to the ViewTube or ViewTubeX application. Covers UI standards, grid layouts, and the "Double Loop" Brain Engine integration.
---

# ViewTube Tool Integration Protocol

## 1. Overview
When building new tools for ViewTube, you must adhere to two core protocols:
1. **Neo-Brutalist Visual Fidelity:** Tools must match the "Hard-Sharp" component system (thick borders, specific chamfers, neon accents).
2. **The Global Brain Integration:** Tools must wire into the "Double-Loop" AI engine so they learn from and contribute to the user's permanent strategy.

## 2. UI & Component Standards

### 2.1 The Neo-Brutalist Aesthetic
- **Borders:** `border-2 border-black` (sometimes `border-4` for major containers).
- **Shadows:** Hard, non-blurred offsets. Use `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`.
- **Corners:** Generally rounded `rounded-lg` or `rounded-xl`, but inner components often use sharp or 4-corner chamfered geometry.
- **Colors:** Base is `bg-gray-100` or white. Accents are `bg-[#00e5ff]` (Cyan), `bg-[#ccff00]` (Yellow), `bg-[#ff0099]` (Pink).
- **Typography:** `font-black`, `uppercase`, `tracking-tight` for headers.

### 2.2 Standard Layouts
- **Toolbox Grid:** Use standard CSS grids for dashboards (`grid grid-cols-1 lg:grid-cols-3 gap-6`).
- **Pop-Boxes:** Containers should use the `.pop-box` class if available in `index.css`, with `.pop-header` for the title bar.
- **Inputs & Controls:** Use the global `CustomDropdown` component instead of native `<select>`. Enforce `box-sizing: border-box` to prevent layout shifts.

## 3. The Brain System Integration (Double-Loop)

Every AI tool in ViewTube MUST connect to the Central Intelligence Layer (The Brain). The Brain consists of four global memory fields: Identity, Content DNA, Performance Ledger, and Future-State Map.

### 3.1 The Inward Loop (Learning)
When the user takes an action (clicks a button, generates a report, toggles a setting), you must emit a signal to the Brain.
*   **Why:** This accumulates interactions until the Brain compresses them into permanent memory via a Gemini reflection.
*   **How:**
```typescript
import { emitSignal } from '../services/brainEngine';

// Inside your tool's event handler:
await emitSignal('YOUR_TOOL_ID', 'USER_DID_X', { payloadData: '...' });
```

### 3.2 The Outward Loop (Personalization)
Before your tool sends a prompt to the Gemini API, it MUST consult the Brain to inject the user's global context.
*   **Why:** This forces the AI to mix "Theological AI Logic" with rigid statistical reality, preventing generic outputs.
*   **How:**
```typescript
import { consultBrainSync, annotateSystemPrompt } from '../services/brainUtils';

// 1. Get the current brain state
const contextPacket = consultBrainSync('YOUR_TOOL_ID');

// 2. Wrap your base prompt with the brain annotation
const enhancedPrompt = annotateSystemPrompt(basePrompt, contextPacket);

// 3. Send enhancedPrompt to the Gemini API
```

## 4. Universal Source of Truth (Data Context)

When building analytics tools, never pull raw numbers without checking `unifiedSourceOfTruth.ts`.
- **Rigid Math:** Pull `CanonicalFactRow` data for hard statistics (Views, CTR, Retention).
- **AI Theology:** Use the Brain to interpret *why* the stats look the way they do (e.g., "The CTR is low because it violates the user's Content DNA").

## 5. Fast Integration Checklist
- [ ] Are inputs utilizing `box-sizing: border-box`?
- [ ] Is the tool using the neo-brutalist shadow classes?
- [ ] Does every user action fire `emitSignal`?
- [ ] Does every AI generation wrap its prompt via `annotateSystemPrompt`?
- [ ] Are analytics values routed through the `CanonicalAnalyticsStore`?
