# ViewTubeX 'Brain' System Optimization & Integration Audit

## 1. System Overview
The current 'Brain' system is fragmented across `src/services/brainEngine.ts` (core persistence/schema), `src/context/useBrain.ts` (React integration), and `src/services/oracle/` (prompt orchestration, jobs, tools).

## 2. File-Level Breakdown

| File | Responsibility | Reality | Action |
| :--- | :--- | :--- | :--- |
| `src/services/brainEngine.ts` | State management/Persistence | Functional | Consolidate |
| `src/services/brainPersistence.ts` | DB operations | Functional | Merge into Engine |
| `src/services/brainUtils.ts` | Helpers | Functional | Merge into Engine |
| `src/services/oracle/prompts.ts` | Prompt definitions | Functional | Standardize |
| `src/services/oracle/oracleJobEngine.ts`| Job automation | Functional | Integrate with Engine |
| `src/services/oracle/tools.ts` | Tool registry | Functional | Standardize |

## 3. Identified Contamination & Redundancy
- **Redundant State:** `brainEngine.ts` maintains its own `brainCache`, but `GlobalDataContext` also tracks "Brain-related" state.
- **Scattered Orchestration:** `oracleJobEngine` works independently of the main `brainEngine`, leading to "split intelligence" where two separate systems attempt to handle tool calls.
- **Hardcoded Prompts:** `oracle/prompts.ts` contains hardcoded system messages that should be dynamically loaded via a unified `PromptRegistry`.

## 4. Optimization Strategy: The "Unified Oracle" Pattern

### A. Centralize Brain Logic
- Merge `brainEngine.ts`, `brainPersistence.ts`, and `oracle/runtime.ts` into a single `src/services/brain/`.
- Replace `brainCache` with a reactive `Observable` store synced to `GlobalDataContext`.

### B. Standardize Prompts
- Create `src/services/oracle/PromptEngine.ts` to fetch prompts by context key.
- Retire hardcoded strings in `oracle/prompts.ts` in favor of template-based loading.

### C. Unified Tool Dispatcher
- Standardize all tool interactions through a single `OracleToolDispatcher`. This ensures all Brain tool calls pass through one validation layer (`oracle/quality.ts`).

## 5. Next Steps
1. **Consolidate:** Create `src/services/brain/Core.ts` as the single entry point.
2. **Abstract:** Introduce a `PromptRegistry` class for dynamic template loading.
3. **Connect:** Update `src/context/useBrain.ts` to subscribe directly to the new unified core.

*Proceed with Phase A: Consolidation of Brain core services.*
