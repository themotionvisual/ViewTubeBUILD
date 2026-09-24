# Settings Frontend Redesign — Task List

Source:
- `tasks/SPEC-settings-frontend-redesign.md`
- `tasks/plan.md`

## Phase 1 — Contract + shell
- [ ] Task 1 — Freeze Settings route/backend/destructive-action contracts.
- [ ] Task 2 — Introduce grouped Settings UI model/controller adapter.
- [ ] Task 3 — Build compact Settings workspace shell and responsive panel navigation.

### Checkpoint A
- [ ] Overview route runs through the new shell.
- [ ] Production build has no new failures.
- [ ] Desktop + mobile shell screenshots reviewed.

## Phase 2 — Low-risk tracer panels
- [ ] Task 4 — Migrate Overview to compact metric/action primitives.
- [ ] Task 5 — Migrate Experience to dense primitive setting rows.

### Checkpoint B
- [ ] Overview + Experience targeted tests pass.
- [ ] Vertical chrome target verified.
- [ ] No custom toggle/control geometry remains in migrated panels.

## Phase 3 — Identity + AI
- [ ] Task 6 — Migrate Account.
- [ ] Task 7 — Migrate AI Runtime.

### Checkpoint C
- [ ] Account connection states certified.
- [ ] API-key/model states certified.
- [ ] No backend service changes introduced.

## Phase 4 — Dashboard
- [ ] Task 8 — Replace Dashboard Widget cards with compact management rows.

## Phase 5 — Billing + data
- [ ] Task 9 — Migrate Plan + Credits.
- [ ] Task 10 — Migrate Data + Privacy.
- [ ] Task 11 — Convert destructive confirmation UI to canonical primitive composition.

### Checkpoint D
- [ ] Billing portal/checkout/top-up/referral parity tested.
- [ ] Export/reset/delete parity tested.
- [ ] Confirmation keyboard/focus contract verified.

## Phase 6 — Help + cleanup
- [ ] Task 12 — Migrate Help + Legal.
- [ ] Task 13 — Delete legacy Settings frontend authority.
- [ ] Task 14 — Add primitive-governance tests.

## Phase 7 — Certification
- [ ] Task 15 — Desktop/tablet/mobile portrait/mobile landscape visual certification.
- [ ] Task 16 — Keyboard/accessibility/error/loading/destructive-state certification.

### Final checkpoint
- [ ] All 8 panels migrated.
- [ ] All current backend actions preserved.
- [ ] All panel query aliases preserved.
- [ ] No new build/test failures versus current main baseline.
- [ ] Local smoke passes.
- [ ] Screenshot matrix approved.
- [ ] Ready for implementation review / merge waves.
