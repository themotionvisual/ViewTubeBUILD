# ViewTube One-Goal Status Ledger

**Authority:** `docs/architecture/VIEWTUBE_ONE_GOAL_COMPLETION_OPERATING_SYSTEM.md`  
**Rule:** update this ledger after every meaningful implementation/verification slice. Do not mark DONE without evidence.

| ID | Workstream | Task | Priority | Status | Depends on | Evidence / next action |
|---|---|---|---|---|---|---|
| VT-001 | Analytics | Define typed MetricComparabilityPolicy | P0 | READY | — | unit/scope/window/format/coverage contract + tests |
| VT-002 | Publishing | Define ApprovedPublishSnapshot schema/hash | P0 | READY | — | architecture masters explicitly mark gap open |
| VT-003 | Brain | Resolve active Project/ContentBuild context uniformly | P0 | READY | — | runtime supports projectId; supply consistently |
| VT-004 | Brain | Build canonical Opportunity evidence feed | P0 | READY | VT-003 | module exists; production evidence supply uneven |
| VT-005 | Reliability | Define cross-system correlation/idempotency envelope | P0 | READY | — | use existing event contracts; avoid second event store |
| VT-006 | Outcomes | Map producer families to existing ledgers/events | P0 | READY | VT-005 | Publisher/Project/Comment/Editor/Experiment |
| VT-007 | Outcomes | Publisher outcome writers | P1 | NOT_STARTED | VT-006 | preserve publish transaction/contentBuild identity |
| VT-008 | Outcomes | Project workflow outcome writers | P1 | NOT_STARTED | VT-006 | complete/abandon/decision lineage |
| VT-009 | Outcomes | Comment/community outcome writers | P1 | NOT_STARTED | VT-006 | no single-comment durable learning |
| VT-010 | Outcomes | Editor/render/export outcome writers | P1 | NOT_STARTED | VT-006 | join final render to ContentBuild |
| VT-011 | Outcomes | Experiment/package-selection outcome writers | P1 | NOT_STARTED | VT-006 | exact variant IDs |
| VT-012 | Evaluation | Audit evaluation target coverage | P1 | NOT_STARTED | VT-001,VT-006 | measurable or explicit non-measurable |
| VT-013 | Learning | Extend governed candidate coverage | P1 | NOT_STARTED | VT-012 | preserve creator approval |
| VT-014 | Publishing | Persist immutable ApprovedPublishSnapshot | P0 | NOT_STARTED | VT-002 | exact inputs + approver + hash |
| VT-015 | Publishing | Bind PublishTransaction to snapshot | P0 | NOT_STARTED | VT-014 | retries cannot observe later edits |
| VT-016 | Publishing | Retry/recovery/idempotency certification | P0 | NOT_STARTED | VT-005,VT-015 | interrupted publish fixtures |
| VT-017 | Post-publish | Write YouTube binding/lifecycle checkpoints to ContentBuild | P1 | NOT_STARTED | VT-015 | same identity survives publish |
| VT-018 | Post-publish | Analytics checkpoint → evaluation bridge | P1 | NOT_STARTED | VT-001,VT-017 | exact used variants |
| VT-019 | Brain | Classify/fix implicit readBrainUserControls() scope | P1 | READY | — | explicit channel when known |
| VT-020 | Brain | Migrate Hook Generator through canonical generation/runtime | P1 | NOT_STARTED | — | parity first, then shrink allowlist |
| VT-021 | Brain | Migrate Script Architect through canonical generation/runtime | P1 | NOT_STARTED | VT-020 | parity first |
| VT-022 | Brain | Build versioned AI regression/evaluation corpus | P1 | NOT_STARTED | VT-003,VT-004 | evidence/missingness/tool-selection cases |
| VT-023 | Analytics | Integrate MetricComparabilityPolicy into evaluation | P0 | NOT_STARTED | VT-001 | invalid comparisons rejected |
| VT-024 | Analytics | Integrate comparability into visual/experiment consumers | P1 | NOT_STARTED | VT-001 | structured UI incompatibility reasons |
| VT-025 | Analytics | Retire legacy selectors/cache consumers | P1 | IN_PROGRESS | — | Analytics master records remaining debt |
| VT-026 | Data Visuals | Retire controllerSpec/legacy preview compatibility | P2 | IN_PROGRESS | VT-025 | reachability zero before deletion |
| VT-027 | Data Visuals | Complete controller vocabulary/orientation/mark-scale migration | P2 | IN_PROGRESS | — | certify modules |
| VT-028 | Analytics UI | Portal Master Data transfer menus | P2 | READY | — | current toolbox table lacks createPortal |
| VT-029 | Editor | Certify canonical final-render Asset Engine identity | P1 | VERIFYING | — | ExportRenderPanel already creates/selects versioned assets |
| VT-030 | Editor | Preview/final-render golden parity fixtures | P1 | NOT_STARTED | VT-029 | transforms/crop/timing/templates/transitions/audio |
| VT-031 | Editor | Four-layout runtime certification | P1 | NOT_STARTED | VT-030 | device orientation × project aspect |
| VT-032 | UI | Audit remaining bespoke controls vs canonical primitives | P2 | IN_PROGRESS | — | fix primitive first |
| VT-033 | UI | Remove nested duplicate shells/intrinsic sizing defects | P2 | IN_PROGRESS | VT-032 | Studio/Projects production surfaces |
| VT-034 | Reliability | Persistence schema/channel/project namespace audit | P1 | NOT_STARTED | — | distinguish cache vs truth |
| VT-035 | Reliability | Add correlation IDs across creator loop | P1 | NOT_STARTED | VT-005 | Brain→build→publish→evaluation |
| VT-036 | Reliability | Structured error/failure-state taxonomy | P1 | NOT_STARTED | VT-035 | auth/API/sync/AI/render/publish |
| VT-037 | Quality | Establish changed-file no-new-debt gate | P1 | NOT_STARTED | — | global lint debt remains separate |
| VT-038 | Quality | Create lint-debt burn-down program | P2 | NOT_STARTED | VT-037 | progressively restore blocking gates |
| VT-039 | Agent OS | Point repository agent guidance to One-Goal artifact | P0 | READY | — | CLAUDE.md + new AGENTS.md/agent entry |
| VT-040 | Agent OS | Standardize Herald work receipt from task ledger | P0 | READY | VT-039 | task ID/status/evidence/handoff |
| VT-041 | Agent OS | Mirror material status/decisions to Create State | P1 | IN_PROGRESS | VT-039 | ViewTube world model exists |
| VT-042 | Agent OS | Add stale-status/current-main audit routine | P1 | NOT_STARTED | VT-039 | never trust old PR/task status |
| VT-043 | Cleanup | Audit direct provider reachability | P2 | NOT_STARTED | VT-020,VT-021 | shrink allowlist |
| VT-044 | Cleanup | Audit duplicate state/mutation owners | P2 | NOT_STARTED | major migrations | Projects/editor/analytics/package |
| VT-045 | Certification | Golden-path creator-loop E2E | P1 | NOT_STARTED | VT-018,VT-030 | data→learn full loop |
| VT-046 | Certification | Failure-path E2E matrix | P1 | NOT_STARTED | VT-016,VT-036 | auth/stale data/AI/render/publish |
| VT-047 | Certification | Responsive/state matrix | P2 | NOT_STARTED | UI/editor waves | desktop/narrow/portrait/landscape |
| VT-048 | Cleanup | Dead-path deletion/quarantine after parity | P2 | NOT_STARTED | VT-043,VT-044,VT-045 | ask before uncertain deletion |
| VT-049 | Docs | Update domain masters/status after each completed wave | P1 | IN_PROGRESS | continuous | code/tests outrank prose |
| VT-050 | Release | Final one-goal certification and release-gate tightening | P0 | NOT_STARTED | all P0/P1 | no unresolved critical gaps |

## Agent Receipt Template

Append/update the relevant task row and preserve a detailed receipt in Herald/exchange when work occurs:

```yaml
task_id:
status:
main_sha_checked:
branch:
pr:
canonical_owner:
files_changed: []
tests:
  commands: []
  result:
runtime_verification:
evidence_refs: []
decisions: []
blockers: []
remaining:
next_action:
updated_at:
```
