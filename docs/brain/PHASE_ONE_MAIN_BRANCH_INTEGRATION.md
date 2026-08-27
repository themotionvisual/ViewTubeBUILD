# ViewTube Brain — Phase One Main-Branch Integration

This document maps the Phase-One adaptive-intelligence architecture to the actual production systems currently present on `main`.

## Canonical rule

Brain does **not** become a second Analytics store, Projects store, Vault, Comment service, Editor, or Publisher. It reads and acts through the canonical ViewTube systems and records provenance for the evidence it uses.

## Main-branch map

| Domain | Canonical main-branch code | Phase-One integration |
|---|---|---|
| Analytics | `src/services/analytics/DataStore.ts`, `MetricRegistry.ts`, `Selectors.ts`, `SyncPipeline.ts`; VT-SYNC local analytics shell | Brain reads selectors/canonical data and converts query provenance into evidence |
| Gemini | `src/services/gemini.ts`, `src/context/GeminiKeyContext.tsx` | Keep current key/access rules; progressively route Brain orchestration through shared context/evidence contracts |
| Projects | `src/components/ProjectStudio.tsx`, `src/views/ProjectCalendarPage.tsx`, Brain project state | Brain reads/writes projects through existing project actions instead of a parallel repository |
| Studio Hub | `src/views/StudioHub.tsx`, `src/services/superToolRegistry.ts`, `src/data/liveCanvasRegistry.tsx` | Each tool receives Channel/Profile/Project context and emits structured handoffs/artifacts |
| Comments | `src/features/creator-engagement/useCommentResponderController.ts`, `src/services/youtubeService.ts` | Existing comment + source-video + catalog workflow becomes a first-class Brain workflow |
| Vault | `src/services/vaultAdapter.ts`, `src/views/CreatorVaultOS.tsx`, `nexusSyncService` | Reuse current local/generated/Drive asset model and preserve tool/project provenance |
| Editor | `/editor`, `EditorV1Page`, VT_E1 | Receive handoff packets and Vault assets; later emit edit decisions/outcomes back to Brain |
| Publisher | `/video-publisher`, `VideoPublisher.tsx` | Prepare/dry-run/publish actions; external execution stays approval-gated |
| Routing | `src/app/AppRoutes.tsx` | Global Brain Sidecar should mount outside route content so its session survives navigation |
| Super Tools | `src/services/superToolRegistry.ts` | Registry is the canonical discovery layer for Brain-aware tool capabilities |

## Evidence UX

Every substantive recommendation should be able to expose:

- claim;
- measured fact vs inference;
- confidence;
- primary evidence;
- baseline/context evidence;
- contradictions;
- freshness/date range;
- missing evidence;
- caveats;
- source route.

Suggested compact control:

`WHY THIS? · 3 SOURCES · 87% · INFERENCE`

The expanded drawer should use creator language, not raw debugging output.

## Comment Responder integration

The current controller already combines comment text, creator video assets, Brain context, and Gemini reply generation. It also validates a returned `suggestedVideoId` against the creator's actual video list before adding the recommendation.

Phase-One hardening:

1. include metadata for the video receiving the comment in the recommendation context;
2. exclude that source video from recommendations;
3. return ranked candidate/evidence metadata instead of only a string ID;
4. label the recommendation as optional;
5. keep `postCommentReply` as an external action requiring the existing permission plus the Brain/User-Control action gate when initiated by Brain;
6. record accepted/rejected recommendation outcomes for evaluation.

## Super Tool integration

`superToolRegistry.ts` already provides IDs, routes, source-of-truth descriptions, visibility, status, and `brainHook` instructions. Phase One should extend this rather than create a second tool catalog.

The universal handoff should carry:

- channel ID;
- project ID;
- source tool ID;
- destination tool ID;
- objective;
- structured artifact payload;
- evidence/provenance references;
- explicit creator decisions.

High-value chains:

- Audience Loop → Creator Canvas OS;
- Creator Canvas OS → Packaging Lab Pro;
- Packaging Lab Pro → Thumbnail Studio;
- Creator Canvas / Storyboard → VT_E1 Editor;
- Vault → Editor;
- Retention Autopsy → project revision brief;
- Brain Next Best Action → Project task/workflow;
- Project → Publisher dry-run.

## Vault integration

`vaultAdapter.ts` already persists local/generated assets, project/tool IDs, generation IDs, tags, metadata, and Drive-linked folders. Brain should use those fields as provenance instead of inventing another asset schema.

Phase-One addition: expose a read/search adapter that can filter by project, tool, asset kind, tags and generation ID and return evidence-safe metadata to Brain.

## Route architecture

The production routes already establish canonical destinations for `/analytics`, `/studio`, `/projects`, `/editor`, `/ai-brain`, and `/video-publisher`, while legacy analytics pages are explicitly namespaced/redirected.

The Brain Sidecar should therefore live in the application shell above `AppRoutes`, with route snapshots supplied by a small provider/hook. This preserves one Brain session while the creator moves between surfaces.

## Phase-One completion sequence

1. Analytics evidence adapter against canonical selectors/DataStore.
2. Route/surface context provider.
3. Global Brain Sidecar shell.
4. Evidence badge + drawer.
5. Projects adapter against current Brain/Project actions.
6. Comment Responder recommendation hardening.
7. Super Tool universal handoff helper integrated with registry.
8. Vault search/provenance adapter.
9. Publisher dry-run + explicit approval gate.
10. End-to-end flow: analytics insight → project action → Studio tool → asset → Publisher dry run.
11. Outcome evaluation → Reflection → Learning Ledger.
12. Mobile QA, failure states, and demo-mode safety.

## Phase-One trust controls

Add creator-visible controls for:

- Personalization on/off;
- tool access;
- analytics/dataset access;
- learn from accepted/rejected output;
- `Don't learn from this`;
- `Teach Brain` correction;
- promote a correction to an explicit channel rule;
- research sharing opt-in separately from personal learning;
- external-action approval policy;
- session deletion;
- Learning Ledger review/correction/removal.

## Definition of done

Phase One is complete when the production application has a persistent Brain surface, canonical context/evidence reads, real project/tool handoffs, User-Control enforcement, approval-gated external actions, inspectable evidence, one real outcome/reflection loop, and mobile-safe behavior without silent demo-data fallback.
