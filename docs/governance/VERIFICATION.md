# ViewTube Verification

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** CONSTITUTION  
**Status:** ACTIVE  
**Concern:** implementation completion, runtime inspection, visual QA, and verification receipts  
**Owner:** Verification  
**Registry ID:** DOC-GOV-VERIFICATION  
**Last Audited Main SHA:** ee02fdbd1af2be30e81de7955dad188999a03ac4  
**Supersedes:** duplicated completion rules scattered through plans and skills after migration  
**Related Authorities:** docs/governance/DOCUMENTATION.md; docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md

## Constitutional completion rule

Code written is not work finished. Work is finished only after the intended behavior has been demonstrated, inspected, corrected where necessary, reverified, and recorded with evidence appropriate to the change.

Required loop:

IMPLEMENT → VERIFY → INSPECT → CORRECT → REVERIFY → RECEIPT

## Verification profiles

Each task/work order declares applicable gates. Gates may be REQUIRED, OPTIONAL, or NOT_APPLICABLE:
- focused tests;
- integration/contract tests;
- typecheck/static analysis;
- production build;
- git diff/source inspection;
- runtime/browser exercise;
- desktop screenshot and visual analysis;
- mobile portrait screenshot and visual analysis;
- mobile landscape screenshot and visual analysis;
- narrow/resized state;
- interaction/state transition checks;
- loading/empty/error/disconnected/permission states;
- persistence/reload/import/export;
- authenticated external integration;
- API read/write behavior;
- performance/profiling;
- accessibility/keyboard/touch;
- deployment/preview verification;
- rollback/recovery/idempotency;
- adjacent regression checks.

## Screenshot rule

For visible UI work, taking a screenshot is not enough. The agent must analyze it against acceptance criteria and ViewTube design contracts. It must inspect clipping, overflow, alignment, borders, spacing, hierarchy, typography, state visibility, control behavior, mobile composition and unintended regressions. If defects are found, fix and recapture.

## Runtime rule

A passing build cannot prove runtime behavior. An authenticated flow cannot be marked complete without authenticated evidence when that evidence is reasonably obtainable. A render-job JSON does not prove a playable render. A merged PR proves code reached the branch, not that production behavior passed.

## Evidence semantics

Evidence proves only the claim it actually observes. Use types such as CURRENT_MAIN_CODE, TEST, BUILD, RUNTIME, AUTHENTICATED_RUNTIME, SCREENSHOT_ANALYSIS, PR, DEPLOYMENT, USER_DECISION, or ARTIFACT. Mark assessments PROVEN, SUPPORTED, CLAIMED, UNKNOWN, or CONTRADICTED.

## Verification receipt

A meaningful implementation receipt records:
- task/mission IDs;
- commit/SHA and environment;
- files changed;
- tests/build/static checks;
- runtime actions exercised;
- screenshot/device/viewport evidence;
- integration and persistence checks;
- failures discovered and corrections made;
- remaining gates;
- disposition: IN_PROGRESS, VERIFYING, BLOCKED, or READY_FOR_DONE.

Task Authority, not the implementation agent, owns canonical DONE mutation.
