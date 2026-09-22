# ViewTube Projects / Asset Engine / ContentBuild / Video Package — Living Workflow & System Reference

**Status:** Living architecture + implementation authority  
**Created:** 2026-09-22  
**Last audited main:** `606db369b873992e426cefe642c1b1a4a4c02f86`  
**Primary reassembly baseline:** PR #302 / merge commit `3f9cb2dab3e2bb3247ce9bd904051ae8b0b93d2d`  
**Scope:** Projects page, Project Builder, Project Board, calendar/scheduling, channel planning, project planning, Asset Engine, ContentBuild, Video Package, Publishing Package, Vault handoffs, Studio tools, editor handoffs, YouTube binding, analytics and learning.

---

## 1. Purpose

This document is the living cross-system authority for how ViewTube turns a creator idea into a planned project, durable ContentBuild, video package, working assets, published YouTube video, measured outcome and reusable learning.

It exists to prevent the same work from being split into disconnected tools or duplicated stores.

The governing product rule is:

> **A creator Project, its ContentBuild, Video Package, Asset Engine manifestation, Vault assets, editor work, Publishing Package and eventual YouTube video are different views of one durable content identity.**

This file must be updated when any of these systems change materially.

---

## 2. Intended creator experience

The Projects page should again feel like one creator-planning system rather than six unrelated toolboxes.

### Primary tool: Project Builder

The Project Builder is the main planning and content-creation workspace.

Its main Toolbox header owns:

- **CHANNEL / PROJECT** mode toggle,
- **NEW PROJECT** action,
- active project identity/color,
- normal open/close Toolbox behavior.

### Channel side

Channel mode contains channel-level planning that must not belong to one project:

- Channel To-Do List
- Channel Goals
- AI Brain generated channel actions/goals
- compact schedule/context when useful

### Project side

Project mode operates on one selected project / ContentBuild and contains:

- Project Build Command / readiness
- Project Identity
- Project Brief
- Video Package working fields
- Thumbnail / Packaging
- Project To-Do List
- Project Goals
- schedule context
- simplified Asset Engine
- compact Publishing Package summary
- contextual handoffs to specialist tools

### Supporting top-level project tools

The intended Projects page hierarchy is:

1. **Project Builder**
2. **Project Board** with **BOARD / CALENDAR**
3. **Storyboard Studio** while it remains useful as an embedded specialist tool

Separate top-level Channel Planning, Content Asset Engine, Publishing Schedule and legacy Project Studio should not compete for ownership once their useful functions are reassembled under Builder / Board.

---

## 3. Historical product behavior to preserve

The preserved original Project Planning / Project Studio source proves the earlier integrated model included:

- header-level CHANNEL / PROJECTS switching,
- START NEW PROJECT,
- project name,
- publish date,
- project color,
- approximately 15-week content calendar,
- channel-wide tasks,
- channel-wide goals,
- project-specific tasks,
- project title,
- tags,
- description,
- script,
- thumbnail area,
- project status,
- AI strategy/generation,
- storyboard generation.

The older Projects implementation also created projects with a project type, thumbnail/media fields and project task data.

The repo user guide historically described the Projects workflow as:

- switch between Channel and Projects,
- create a project with a name, target date and color,
- see projects on their assigned calendar date,
- maintain channel to-dos/goals independently from project data.

These behaviors are parity references, not an instruction to restore obsolete CSS or duplicate legacy stores.

---

## 4. Current main state

PR #302 is now merged into current `main`. The Projects page has already been reassembled around three top-level tools:

1. **Project Builder**
2. **Project Board** with **BOARD / CALENDAR**
3. **Storyboard Studio**

Channel Planning, full Content Asset Engine, Publishing Schedule and the restored Project Studio now survive as capabilities embedded behind Builder / Board rather than competing top-level owners.

The remaining work is continuity and identity hardening: move the CHANNEL / PROJECT switch into the Builder header, add compact schedule context, make the Simple Asset Engine expose durable asset slots, and ensure Project creation initializes/reuses a Video Package against the same ContentBuild.

### Current useful production pieces

- `Project` already supports `contentBuildId`.
- `BrainContext` / project state remains the current creator-facing Project record source.
- Project-specific tasks and project goals exist.
- Channel planning tasks/goals exist.
- Publishing Schedule can write dates back to Project records.
- Project Board has lanes and workspace metadata.
- Full Projects Content Asset Engine exists.
- Project -> ContentBuild bridge exists.
- ContentBuild repository, events, assets, selections, versions, variant groups and YouTube binding exist.
- Video Package contracts exist with project and ContentBuild scope.
- Video Package -> ContentBuild synchronization exists.
- Publisher / Studio systems already have ContentBuild-aware paths in several places.

---

## 5. Reassembly baseline: PR #302

PR #302, **Reassemble Projects page around Project Builder + Board**, merged to `main` on 2026-09-22.

It is now the production baseline for the Projects-page composition described below.

### PR #302 implements

#### Project Builder
- CHANNEL / PROJECT scope
- shared Projects workspace context
- shared project selection
- shared New Project dialog
- immediate ContentBuild initialization
- automatic legacy Project -> ContentBuild synchronization
- persistent project color identity
- Project Build Command
- Project Identity
- Project Brief
- Video Package project fields
- Packaging / thumbnail subtoolbox
- Project tasks
- Project goals
- AI Brain project planning suggestions
- Simple / Full Asset Engine mode

#### Project Board
- Board / Calendar switch
- shared New Project dialog
- Board cards open the project in Builder
- Calendar cards open the project in Builder
- lane movement writes semantic Project status
- lane movement syncs ContentBuild stage
- project priority hydration
- removal of competing Board project editor/drawer

#### Calendar
- Publishing Schedule becomes the Board calendar instead of another top-level tool
- scheduled cards inherit project identity color
- schedule writes to canonical Project publishDate

---

## 6. System ownership model

### Project

**Purpose:** creator-facing planning container.

Owns creator/project workflow values such as:

- project name
- active project selection
- target publish date
- tasks
- project goals
- project notes
- lightweight project metadata
- project color / visual identity
- user-visible status where compatible

A Project is not the canonical asset graph.

### ContentBuild

**Purpose:** durable identity and lifecycle spine for the piece of content.

Owns / coordinates:

- stable `contentBuildId`
- profile
- lifecycle stage
- attached asset IDs
- selected/final assets by slot
- asset relationships
- versions
- variant groups
- workflow state
- revision
- YouTube binding
- append-only event history

### Asset Engine

**Purpose:** creator-facing orchestration/facade over ContentBuild assets and lifecycle.

The Asset Engine should:

- resolve durable work,
- attach/generated assets,
- preserve lineage,
- manage variants and versions,
- select/finalize assets,
- expose readiness,
- route work into specialist tools,
- carry ContentBuild scope across handoffs,
- preserve post-publish history.

It must not become a second Project store, Vault store, analytics store or Brain store.

### Video Package

**Purpose:** structured video-specific creative, packaging, production and publishing contract.

It already carries:

- `projectId`
- `contentBuildId`
- channel scope
- working title
- format/status
- strategy artifacts/evidence
- hooks/script/storyboard/scenes
- title and thumbnail variants/selections
- description/tags/end screen/outro/pinned comment/community assets
- Vault asset IDs
- timeline/render IDs
- Publishing checks/approval/schedule
- handoffs/blockers/provenance

### Publishing Package

**Purpose:** the YouTube-facing publication configuration belonging to the same content build.

Must cover, as applicable:

- title
- thumbnail
- description
- tags
- category
- chapters/timestamps
- education questions
- captions/language
- end screens
- related video
- playlists
- cards
- visibility
- audience
- schedule/timezone
- Premiere
- pinned comment
- community/launch assets

### Vault

**Purpose:** durable artifact/media identity and storage.

Project/ContentBuild references Vault assets. The Project Builder should not replace Vault with URL-only fields.

### Specialist tools

Script Architect, Storyboard Studio, Thumbnail Studio, Video Director, Editor, Packaging tools, Publisher, Priming and Analytics are producers/consumers of scoped ContentBuild work.

They must receive and return the same:

`contentBuildId + projectId + channelId`

when those scopes exist.

---

## 7. Canonical identity chain

The target creation path is:

```text
Creator creates Project
        ↓
Project ID
        ↓
ContentBuild created / resolved
        ↓
Project.contentBuildId saved
        ↓
Video Package initialized against SAME contentBuildId
        ↓
Project workspace metadata initialized
        ↓
Builder / Board / Calendar / Studio tools resolve same scope
```

### Required invariant

Do not create a second unrelated ContentBuild for the Video Package.

When the working project owns `contentBuildId = CB-123`, its default Video Package must be initialized with that same ContentBuild identity.

---

## 8. Lifecycle

Canonical ContentBuild stages currently support:

```text
IDEA
RESEARCH
CONCEPT
OUTLINE
SCRIPT
STORYBOARD
MEDIA
PACKAGE
EDIT
REVIEW
SCHEDULED
PUBLISHED
LAUNCH
MONITOR
EVALUATION
LEARNING
ARCHIVED
```

Project status values should map deliberately into this lifecycle.

PR #302 improves the mapping beyond current main. That mapping should be ported and tested.

### Simplified creator-facing lifecycle

For the compact Asset Engine, show:

```text
IDEA + STRATEGY
→ RESEARCH
→ SCRIPT + STORY
→ PRODUCTION
→ PACKAGING
→ PUBLISH
→ PERFORMANCE
```

The compact view is a manifestation of the full ContentBuild lifecycle, not a second state machine.

---

## 9. Simplified Asset Engine target

The donor `ProjectAssetEngineSimple.tsx` is a strong starting point.

Its seven lifecycle cards should be retained, then expanded into a compact asset-state instrument.

### Required asset slots

At minimum:

- Idea / Brief
- Research
- Script
- Storyboard
- Media
- Title
- Thumbnail
- Publishing Package
- Final Render / Video
- YouTube binding / Performance when published

### Recommended visible state per slot

```text
EMPTY
WORKING
VARIANTS
SELECTED
FINAL
PUBLISHED
```

Where available, show:

- selected asset
- number of variants
- current version
- producing tool
- latest modification
- blocker/readiness state

### Simple / Full

Project Builder should retain:

- **Simple** — compact lifecycle + essential asset slots + handoffs
- **Full** — complete Projects Content Asset Engine

Both must operate on the same ContentBuild.

---

## 10. Project Builder target anatomy

### Header
- Toolbox title: Project Builder / Project Planning
- project identity color when a project is active
- CHANNEL / PROJECT toggle in header
- NEW PROJECT action in header
- normal collapse control

### Project command
- working title
- project name
- Project status
- ContentBuild stage
- ContentBuild linked/pending state
- readiness
- asset count
- revision
- publish target
- lifecycle step indicator

### Project identity
- name
- publish date
- format
- status
- priority
- project color

### Project brief
- central concept
- audience promise
- target audience
- creator goal
- hook / angle
- visual style
- narrative style
- relevant constraints/references as the system grows

### Video package working fields
- title
- description
- tags
- script
- notes

### Packaging
- thumbnail preview
- current selected thumbnail identity
- variants/status when available
- Open Thumbnail Studio
- Open Vault
- clear / replace through canonical asset selection rules

### Planning
- Project To-Do
- Project Goals
- add manually
- complete
- dates for tasks
- AI Brain generation
- evidence/rationale on generated suggestions

### Schedule context
Do not duplicate a second full calendar inside Builder.

Builder should show compact scheduling context:

- project target date
- nearest deadlines/tasks
- nearby scheduled projects
- unscheduled warning
- Open Full Calendar

Project Board -> Calendar remains the full scheduling surface.

---

## 11. Project Board target

Project Board owns pipeline organization, not detailed content editing.

It should own:

- production lanes
- drag/drop movement
- priority
- owner/team metadata
- Board search/filter
- archive visibility
- Board / Calendar mode
- project selection/opening

When a card is opened:

1. select canonical Project,
2. select its ContentBuild,
3. switch Project Builder to Project mode,
4. return/focus Project Builder.

Board lane moves must update Project status and synchronize ContentBuild stage.

---

## 12. New Project transaction

New Project is one shared creation flow used by Builder and Board.

Initial form should support:

- project name
- working video title
- initial concept / one-line idea
- format
- target publish date
- priority
- project color

Later optional additions:

- initial thumbnail / reference image
- source idea / audience request
- series/theme
- target audience
- selected workflow template

### Transaction requirements

On successful create:

1. Create Project.
2. Create/resolve ContentBuild.
3. Store `Project.contentBuildId`.
4. Initialize project workspace metadata.
5. Initialize default Video Package using the same `contentBuildId`.
6. Select the new project.
7. Open Builder in Project mode.
8. Append provenance/event records where supported.

Do not create the Project and leave its ContentBuild/Video Package identity for a later screen to guess.

---

## 13. Video Package integration gap

The Video Package contract is already capable of correct identity:

```ts
CreateVideoPackageInput {
  channelId
  projectId
  workingTitle
  format
  contentBuildId?
}
```

The project creation path must use this.

### Current gap

Project -> ContentBuild bridging is implemented, and Video Package -> ContentBuild bridging is implemented, but the Project Builder creation flow does not yet guarantee one initialized project-scoped Video Package against the same ContentBuild.

### Intended fix

Add one Project/VideoPackage bridge or creation service that:

- resolves the Project's ContentBuild,
- finds an existing Video Package for `projectId + contentBuildId`,
- otherwise creates one with the existing ContentBuild ID,
- persists it through the current canonical package owner,
- never forks identity silently.

---

## 14. Publishing integration

The Project Builder should not duplicate the full Publisher UI.

It should provide a compact Publishing Package summary showing:

- title readiness
- thumbnail readiness
- description/tags
- audience
- visibility
- category
- schedule
- captions
- routing/end-screen state
- approval/readiness
- blockers

Then expose contextual actions:

- Edit Package
- Open Video Publisher
- Open Full Asset Engine
- Resolve Blocker

The full publishing implementation remains owned by the existing Asset Engine / Publisher systems.

---

## 15. Specialist-tool handoff contract

When Builder launches a specialist tool, the handoff should preserve:

- `contentBuildId`
- `projectId`
- `channelId`
- relevant selected assets
- relevant evidence IDs
- source tool
- requested action
- trace/provenance metadata when available

Destination tools should attach their outputs to the same ContentBuild and return receipts/handoffs rather than only mutating unrelated local state.

Priority integrations:

1. Script Architect
2. Storyboard Studio
3. Thumbnail Studio
4. Video Director
5. Editor
6. Packaging / SEO
7. Video Publisher
8. Vault
9. Pre-Launch / community
10. Analytics / evaluation

---

## 16. YouTube and post-publish lifecycle

The content object does not end at upload.

The ContentBuild already supports YouTube binding with:

- videoId
- canonical URL
- upload/schedule/publish timestamps
- visibility/state
- initial title asset
- initial thumbnail asset
- final render asset
- last verification

After publication, continue recording:

- title changes
- thumbnail changes
- experiment variants
- analytics checkpoints
- comments/replies when connected to workflow
- evaluation
- learning candidates

The purpose is to know not only what was published, but **which exact assets and decisions produced the measured result**.

---

## 17. Current bugs / architectural gaps

### Projects page fragmentation
**Status:** OPEN  
Six independent top-level tools currently divide one workflow.

### Header toggle placement
**Status:** IMPLEMENTED ON CURRENT FEATURE BRANCH / NOT YET MAIN  
PR #302 restored CHANNEL / PROJECT inside Builder body. The current follow-up branch moves that control into the main Project Builder Toolbox header and makes the header the single scope owner.

### Project creation identity transaction
**Status:** IMPLEMENTED ON CURRENT FEATURE BRANCH / VERIFY  
Project + ContentBuild initialization is already on main. The current follow-up branch adds a canonical Video Package repository/bridge that initializes or reuses one package against the same project `contentBuildId` and refuses silent ContentBuild forks.

### Thumbnail ownership
**Status:** PARTIAL  
Project thumbnail is still partly represented as a URL/reference field. Target is selected Asset/Vault identity with compatibility rendering.

### Simplified Asset Engine
**Status:** EXPANDED ON CURRENT FEATURE BRANCH / VERIFY  
The lifecycle launcher is on main. The current follow-up branch adds durable asset-slot projection for script, storyboard, title, thumbnail, description, tags/SEO and final video, including EMPTY / LEGACY / WORKING / VARIANTS / SELECTED / FINAL states.

### Calendar duplication / ownership
**Status:** IMPLEMENTED ON CURRENT FEATURE BRANCH / VERIFY  
One full calendar remains under Project Board. The current follow-up branch adds compact schedule context in Builder and routes OPEN FULL CALENDAR into the Board calendar instead of creating another calendar owner.

### Publishing Package summary
**Status:** IMPLEMENTED ON CURRENT FEATURE BRANCH / VERIFY  
Builder now has a compact readiness summary for title, thumbnail, description, tags/SEO, category, audience, visibility and schedule, plus Video Package blockers and a direct Publisher handoff. The full editing surface remains owned by the existing Asset Engine / Publisher implementation.

### Project workspace metadata
**Status:** PARTIAL  
Lane/priority/owner/tags use local workspace metadata. Core content identity must remain in Project/ContentBuild and must not depend on workspace local storage.

### Status vocabulary
**Status:** OPEN  
Legacy Project statuses, Board lanes, Video Package status and ContentBuild lifecycle overlap but are not identical. Mapping must stay explicit and tested.

### Legacy generation paths
**Status:** MIGRATE  
Some Project Studio strategy/storyboard generation still uses legacy direct generation services. Move durable outputs through current Brain/Asset Engine/handoff patterns without removing creator functionality.

### Project UI primitive consistency
**Status:** MIGRATE / CERTIFY  
Project Builder and Board must use current canonical Toolbox/Subtoolbox primitives and current UI authority. Do not copy obsolete legacy styling from preserved sources.

---

## 18. Completed work ledger

| Work | Status | Evidence |
| --- | --- | --- |
| Original integrated Project Planning source preserved | COMPLETE / REFERENCE | `src/components/ProjectStudio.tsx`, `public/Projects.tsx` |
| Original Project Studio restoration | MERGED | PR #234 |
| Channel planning subtoolboxes | MERGED | current main |
| Project task / goal planning | MERGED | current main |
| Projects Content Asset Engine | MERGED | PR #167 / #174 / #221 |
| ContentBuild lifecycle spine | MERGED | PR #293 |
| Project -> ContentBuild identity bridge | MERGED | current main |
| Video Package -> ContentBuild bridge | MERGED | current main |
| ContentBuild YouTube binding | MERGED | current main |
| Project Board new-project visibility | MERGED | PR #235 |
| Project Builder reassembly | MERGED | PR #302 / `3f9cb2d` |
| Simple Asset Engine lifecycle launcher | MERGED | PR #302 |
| Builder / Board shared workspace context | MERGED | PR #302 |
| Board / Calendar unified surface | MERGED | PR #302 |
| Expanded Project-status -> ContentBuild-stage mapping | MERGED | PR #302 |
| Header-level CHANNEL / PROJECT toggle | FEATURE BRANCH / VERIFY | current workflow-authority branch |
| Compact Builder schedule context | FEATURE BRANCH / VERIFY | current workflow-authority branch |
| Project -> same-ContentBuild Video Package bridge | FEATURE BRANCH / VERIFY | current workflow-authority branch |
| Simple Asset Engine durable asset slots | FEATURE BRANCH / VERIFY | current workflow-authority branch |
| Compact Publishing Package readiness summary | FEATURE BRANCH / VERIFY | current workflow-authority branch |

---

## 19. Implementation plan

### Wave 1 — Authority + safe foundation
- living reference created
- Project Builder / Board hierarchy already merged via PR #302
- preserve current canonical UI primitives
- move CHANNEL / PROJECT control into Builder header
- keep one shared New Project flow
- add compact schedule context without duplicating the full calendar

### Wave 2 — Creation identity
- Project + ContentBuild creation already exists
- initialize/reuse one same-scope Video Package
- reject silent package ContentBuild forks
- keep workspace priority/color initialization
- test deterministic Project/ContentBuild/Video Package identity

### Wave 3 — Simplified Asset Engine
- lifecycle stage cards already exist
- add durable asset-slot projection
- show selected/final/variant/version states
- keep ContentBuild event/revision summary
- add contextual tool actions

### Wave 4 — Packaging / publishing
- canonical thumbnail identity
- compact Publishing Package summary
- package blockers/readiness
- package-to-Publisher handoff

### Wave 5 — Tool continuity
- ContentBuild-aware Script Architect
- Storyboard
- Thumbnail
- Video Director
- Editor
- Vault
- Publisher
- launch tools

### Wave 6 — Publication / analytics loop
- YouTube bind verification
- analytics checkpoints
- exact used-variant attribution
- outcome/evaluation records
- governed learning candidates

### Wave 7 — cleanup
Only after parity and verification:

- remove redundant top-level Projects mounts
- retire obsolete adapters
- quarantine/delete dead duplicate project UI
- update user guide
- update tool registry / chains
- mobile and accessibility certification

---

## 20. Acceptance criteria

The rebuild is not complete until:

- one New Project produces one durable project/content identity,
- CHANNEL / PROJECT is accessible from the main Builder header,
- Project/Board/Calendar selection stays synchronized,
- channel tasks/goals remain channel-scoped,
- project tasks/goals remain project-scoped,
- project publish date appears consistently in Board/Calendar/Publisher context,
- all working package fields remain editable,
- thumbnail is backed by canonical asset identity where available,
- simplified and full Asset Engine show the same ContentBuild,
- specialist tools receive the same ContentBuild scope,
- Video Package does not fork a second ContentBuild,
- published YouTube ID binds back to the same ContentBuild,
- analytics/outcomes can be attributed to the actual assets used,
- desktop and mobile visual QA pass,
- no duplicate T0 shells appear,
- no new parallel storage authority is introduced.

---

## 21. Document update protocol

Whenever this system changes:

1. inspect current `main`;
2. distinguish **MAIN**, **DONOR/BRANCH**, **PROTOTYPE**, **PLANNED** and **SUPERSEDED**;
3. update the Current State section;
4. update the Bugs / Gaps section;
5. add implemented work to the Completed Work ledger;
6. update the planned wave;
7. record relevant PR/commit evidence;
8. do not mark browser/mobile behavior VERIFIED without actual render verification;
9. preserve superseded decisions when useful for explaining why the system changed;
10. update user-facing guide text when creator behavior changes.

---

## 22. Implementation log

| Date | Change | State |
| --- | --- | --- |
| 2026-09-22 | Audited current main vs preserved legacy Project Planning and PR #302 | COMPLETE |
| 2026-09-22 | Established Project = planning, ContentBuild = durable identity, Video Package = structured video contract, Asset Engine = orchestration/facade | CURRENT |
| 2026-09-22 | Chose Project Builder + Project Board as intended Projects hierarchy | CURRENT |
| 2026-09-22 | Chose one full calendar under Board + compact schedule context in Builder | CURRENT |
| 2026-09-22 | Required Project -> ContentBuild -> Video Package shared identity at creation | CURRENT |
| 2026-09-22 | PR #302 merged and became the Projects-page production baseline | MERGED |
| 2026-09-22 | Added living Projects / ContentBuild workflow authority and repo-session pointer | FEATURE BRANCH |
| 2026-09-22 | Moved CHANNEL / PROJECT scope control and NEW PROJECT into the Project Builder header | FEATURE BRANCH |
| 2026-09-22 | Added compact Builder schedule context linked to the Board calendar | FEATURE BRANCH |
| 2026-09-22 | Added deterministic Project -> same-ContentBuild Video Package repository bridge + tests | FEATURE BRANCH |
| 2026-09-22 | Expanded Simple Asset Engine with durable asset-slot states | FEATURE BRANCH |
| 2026-09-22 | Added compact Publishing Package readiness and blocker summary | FEATURE BRANCH |

---

## 23. Related references

- `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`
- `docs/architecture/ASSET_ENGINE_CONTENTBUILD_IMPLEMENTATION_PLAN_2026-09-20.md`
- `docs/brain/ASSET_ENGINE_CANONICAL_BACKBONE.md`
- `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
- PR #302 — Project Builder / Board reassembly
- PR #293 — ContentBuild lifecycle spine
- PR #234 — restored original Project Studio
- PR #221 — editable Projects Publishing Package
- PR #174 / #167 — Projects Content Asset Engine

**Conflict rule:** when this document, an older plan and current code disagree, inspect current production code and the latest accepted product decision. Reconcile deliberately and record the result here rather than silently creating another authority.
