# ViewTube Brain Shared Conversation Controller — Phase 2

Date: 2026-09-12

## Purpose

Continue the BrainRuntime consolidation after PR #124 and PR #129 by removing repeated conversation-ordering and history-building logic from creator-facing Brain surfaces.

This slice introduces one controller contract for the durable Brain thread. It does **not** create a second conversation store. Persistence remains owned by the existing AI Brain conversation persistence layer.

## Canonical contract

`BrainConversationController` owns the surface-facing interpretation of the durable thread:

- load the canonical persisted thread;
- normalize persisted chronological turns into one newest-first UI/runtime contract;
- filter non-conversation persistence events from creator-facing conversation state;
- expose the latest creator-visible turn;
- collect question answers;
- build bounded oldest-to-newest model history from newest-first surface state;
- emit channel-scoped change notifications so simultaneously mounted Brain surfaces can refresh from the same durable authority.

The controller intentionally does **not** own:

- persistence;
- analytics;
- Channel Profile memory;
- learning promotion;
- project state;
- asset provenance;
- provider/model selection.

## First migrated surface

`SidebarChatbot` now consumes the controller for:

- restoration;
- visible latest turn selection;
- bounded history assembly;
- cross-surface conversation-change subscription;
- post-turn change notification.

The generation path remains:

`SidebarChatbot -> runBrainTask() -> BrainRuntime -> BrainOrchestrator -> durable conversation store`

## Next migration targets

1. `BrainHubWidget`
   - replace local turn ordering/history logic with `BrainConversationController`;
   - restore the latest durable turn on mount rather than beginning as an isolated empty session;
   - subscribe to conversation changes from Sidebar and the full Brain workspace.
2. `/ai-brain` (`AIBrainCommandInterface`)
   - route its remaining direct `runBrainTurn()` path through `runBrainTask()`;
   - replace local restore/filter/history duplication with the shared controller;
   - retain only presentation-specific optimistic message state.
3. Once all three surfaces consume the controller, add an architecture guard preventing new creator surfaces from calling `resumeAIBrainThread()` directly.
4. After parity is verified, evaluate whether the controller should become a React hook/provider for fewer repeated refresh effects without changing persistence authority.

## Verification

Added focused tests for:

- filtering persistence-only sources (`feedback`, `journal`, `quick_action`, `creator_intake`, `question_module`);
- chronological persistence -> newest-first surface normalization;
- bounded oldest-to-newest model-history construction.

## Architectural rule

The durable conversation thread remains singular. UI surfaces may keep temporary presentation state, but durable turn ordering, filtering, history construction, and cross-surface refresh behavior should converge on this controller rather than being reimplemented independently.
