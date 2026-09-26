# ViewTube Resource Library Handoff

**Production date:** 2026-09-26  
**Last edited:** 2026-09-26  
**Status:** Active living handoff  
**Owner:** ViewTube Resource Library / Docs / Creator Education  
**Current series progress:** 2 of 15 creator reference documents authored and registered  
**Primary route:** /resources

---

## Purpose

This document is the handoff for the next agent working on the ViewTube Resource Library.

The Resource Library is the creator-facing knowledge and reusable reference system for ViewTube. It is designed to hold source-grounded guides, references, playbooks, checklists, worksheets, templates, and eventually production resources that can be browsed inside ViewTube and rendered through the Toolbox/SubToolbox UI system.

The current implementation establishes the first complete vertical slice:

~~~text
Deep research
    ↓
Canonical Markdown
    ↓
Resource registry
    ↓
Resource Library page
    ↓
Toolbox/SubToolbox document renderer
    ↓
Responsive creator-facing resource
~~~

The Markdown file is the content authority. The Resource Library renderer is the presentation authority. PDFs, screenshots, exports, and future alternate layouts should be generated derivatives, not competing source documents.

---

## Current State

The Resource Library is now a real production feature on current main.

### Completed creator resources

| # | Resource | ID | Category | Status |
|---|---|---|---|---|
| 1 | How YouTube Recommendations and Discovery Work | youtube-recommendations-discovery | YouTube Strategy | Published |
| 2 | YouTube Metrics and Dimensions Master Glossary | youtube-metrics-dimensions-glossary | Analytics | Published |

The second document is already substantially authored and registered. Its major sections include analytics surface architecture, API capability matrices, authentication, privacy/timing, dimensions, geography, traffic sources, devices, demographics, views/reach, watch time, Shorts metrics, audience cohorts, revenue, playlists, live metrics, cross-API naming, format applicability, analytical compatibility, developer pipeline guidance, Studio-vs-API discrepancies, myths, diagnostics, glossary, sources, and maintenance metadata.

### Remaining first-series resources

3. Shorts vs Long-Form: Different Systems, Different Signals  
4. Publishing Best Practices and Preflight Checklist  
5. Thumbnail and Title Packaging Handbook  
6. Audience Retention and Watch Behavior Guide  
7. Traffic Sources and Discovery Pathways  
8. Audience, Subscribers and Returning Viewers  
9. YouTube Revenue and Monetization Fundamentals  
10. Live Streaming Operations Handbook  
11. Playlist, Series and Channel Architecture Guide  
12. Comments, Community and Audience Feedback Playbook  
13. Content Planning, Experiments and Learning Loops  
14. Copyright, Rights, Reuse and AI-Generated Media Reference  
15. Reading Analytics Correctly: Scope, Windows, Missingness and Statistical Traps

The next logical content task is **Resource #3: Shorts vs Long-Form: Different Systems, Different Signals**.

---

## Authority and Source-of-Truth Rules

Use this authority order:

1. **Canonical Markdown resource file** — authoritative resource content.
2. **Resource Library registry** — authoritative app metadata and discoverability.
3. **Resource Document renderer** — authoritative presentation behavior.
4. **Resource Library page** — authoritative creator-facing browsing and reader shell.
5. **PDF/export outputs** — derivatives only.
6. **Research notes, Gemini outputs, screenshots, draft documents** — donor/reference material only after useful content is incorporated into the canonical Markdown.

Never maintain the same finished resource independently in Markdown and PDF.

When a PDF is needed, generate it from the canonical resource source or from the rendered resource rather than manually editing a separate PDF version.

---

## Important Product Boundaries

Do not collapse these systems into one another.

### Resource Library

Creator-facing reusable knowledge, guides, references, playbooks, educational resources, and later reusable production resources.

### Vault

The creator's actual uploaded, generated, saved, and project-linked assets.

### Research / Evidence systems

Research gathered for a particular project, topic, claim, or evidence workflow.

### User Guide

Documentation about how to operate ViewTube itself.

### UI / Component Reference Library

Internal developer/design-system certification and reference material.

### Engineering docs

Architecture, plans, audits, decisions, skills, migrations, and implementation truth.

The Resource Library may link to these systems, but should not become another Vault, another User Guide, or an internal engineering-doc browser.

---

## Current File Map

### Resource content

~~~text
docs/resources/
├── README.md
├── RESOURCE_LIBRARY_HANDOFF.md
├── library/
│   ├── how-youtube-recommendations-and-discovery-work.md
│   └── youtube-metrics-and-dimensions-master-glossary.md
└── templates/
    └── VIEWTUBE_RESOURCE_DOCUMENT_TEMPLATE.md
~~~

### Application implementation

~~~text
src/features/resource-library/
├── ResourceLibrary.tsx
├── ResourceDocumentRenderer.tsx
├── resource-library.css
├── resourceLibraryRegistry.ts
├── resourceLibraryRegistry.test.ts
└── ResourceLibrary.contract.test.tsx
~~~

### Integration points

~~~text
src/app/AppRoutes.tsx
src/app/pageRegistry.ts
src/components/navigation/navigationContract.ts
src/components/navigation/applicationMenuContract.ts
src/components/navigation/navIcons.tsx
src/components/navigation/routePrefetch.ts
src/content/guide-v2/featureRegistry.ts
~~~

---

## Canonical Markdown Contract

Start every resource from:

docs/resources/templates/VIEWTUBE_RESOURCE_DOCUMENT_TEMPLATE.md

The template is intentionally semantic rather than visually branded. Research quality and information architecture come first. ViewTube handles visual presentation later.

### Required frontmatter

Each resource should include at least:

~~~yaml
---
title:
short_title:
resource_id:
resource_type:
category:
secondary_categories:
audience:
difficulty:
estimated_read_time:
production_date:
last_researched:
recommended_review_date:
research_status:
version:
official_sources_prioritized:
viewtube_resource: true
tags:
related_viewtube_tools:
related_resources:
---
~~~

Keep resource_id stable after publication.

### Heading contract

- # = document title
- ## = major Resource section / SubToolbox
- ### = module inside a section
- #### = use sparingly

A major reason this contract matters is that parseResourceDocument() turns every ## section into a separate rendered SubToolbox.

Do not create one enormous ## section containing the entire document.

---

## What the Renderer Supports Today

The current renderer understands ordinary Markdown plus several structured content forms.

### Major sections

Every ## heading becomes a canonical ViewTube SubToolbox.

### Tables

Markdown tables become styled resource tables.

Use tables for:

- comparison matrices;
- metric registries;
- definition grids;
- compatibility matrices;
- diagnostic references;
- source/evidence comparisons.

Avoid excessively wide tables when the information can be split into two focused tables.

### Checklists

Markdown task lists become visual checklist modules.

Example:

~~~md
- [ ] Verify the comparison window.
- [ ] Confirm the traffic source.
- [ ] Record the hypothesis.
~~~

Use them only for real actions.

### Blockquotes / callouts

Quoted blocks are automatically given semantic treatment.

Current tone detection recognizes language such as:

- Unknown
- Important limitation
- Do not conclude
- Officially documented
- Strong evidence
- Creator observation

Write important caveats clearly so the renderer can distinguish them.

### Mermaid-style flows

Mermaid flowchart code is converted into a simplified ViewTube process-flow module.

Use Mermaid for:

- workflows;
- discovery pathways;
- decision logic;
- lifecycle diagrams;
- analytics validation sequences;
- experimentation loops.

The current renderer is intentionally simple. Do not depend on advanced Mermaid syntax until the renderer is upgraded.

### Standard Markdown

The renderer also styles:

- headings;
- paragraphs;
- lists;
- links;
- inline code;
- horizontal rules;
- strong text.

---

## Research and Editorial Standard

Each Resource Library document must be more rigorous than a normal creator blog post.

### Source priority

Prefer:

1. Official YouTube documentation
2. Official Google documentation
3. YouTube Help
4. Creator Insider
5. Google/YouTube engineering and research publications
6. Official product announcements
7. YouTube Analytics / Reporting / Data API documentation
8. Peer-reviewed or academically credible research
9. Strong specialist secondary analysis
10. Creator observations only when clearly labeled

Low-quality SEO content should never override primary sources.

### Evidence labels

Maintain visible distinctions among:

- **Officially documented**
- **Strong evidence**
- **Reasonable inference**
- **Creator observation**
- **Unknown / not publicly disclosed**

Do not convert creator folklore into platform fact.

### Important editorial rule

Historical YouTube engineering papers are valuable architecture evidence, but must not automatically be described as the exact current production system.

Separate:

- documented historical implementation;
- current official product behavior;
- inference;
- unknown proprietary implementation.

---

## Research-to-Resource Workflow

For every new resource:

### 1. Collect the research

Gemini Deep Research or another research process should focus on:

- source quality;
- completeness;
- currentness;
- definitions;
- contradictions;
- uncertainty;
- examples;
- tables;
- checklists;
- workflows;
- diagrams;
- creator implications.

Do not ask the research system to spend time reproducing ViewTube's final visual design.

### 2. Audit the research before publication

Before adding it to the app:

- remove duplicated prose;
- verify high-risk factual claims;
- remove invented algorithm thresholds;
- label illustrative numbers;
- distinguish historical architecture from current behavior;
- identify weak secondary sources;
- preserve important caveats;
- reorganize long prose into semantic sections.

### 3. Normalize into the canonical Markdown template

Use structured elements naturally:

- summary;
- at-a-glance table;
- major sections;
- comparison grids;
- decision frameworks;
- checklists;
- worked examples;
- myths/misinterpretations;
- practical actions;
- quick reference;
- glossary;
- related resources;
- sources;
- maintenance metadata.

### 4. Save the canonical Markdown

Add it under:

docs/resources/library/

Use a stable descriptive lowercase filename.

### 5. Register the resource

Edit:

src/features/resource-library/resourceLibraryRegistry.ts

Add:

- raw Markdown import;
- stable ID;
- title;
- short title;
- description;
- category;
- secondary categories;
- tags;
- difficulty;
- read time;
- updated date;
- source path;
- accent palette index;
- Markdown reference.

### 6. Update the Resource Library README

Update:

- Current Collection table;
- series progress count.

### 7. Update related-resource links

As new resources are added, earlier resources can be updated to point to the newly published related resource.

Do this conservatively; do not rewrite completed documents unnecessarily.

---

## Resource Registry Rules

The current registry is:

src/features/resource-library/resourceLibraryRegistry.ts

Each entry follows the ResourceLibraryEntry contract.

### Stable identity

Resource IDs must:

- be lowercase;
- use hyphens;
- describe the subject rather than a date;
- remain stable after release.

Example:

youtube-metrics-dimensions-glossary

### Categories

Use broad creator-facing categories rather than creating a unique category for every document.

Current examples:

- YouTube Strategy
- Analytics

Planned category families from earlier Resource Library work include:

- Analytics
- Strategy
- Content Planning
- Writing
- Thumbnails
- Video Production
- Publishing
- Audience / Community
- AI
- ViewTube Help

### Tags

Tags are for discovery, not prose.

Use concrete search terms creators might actually type.

---

## UI and Design Direction

The Resource Library should stay inside the canonical ViewTube Toolbox UI system.

Do not create an independent visual language for documents.

### Current page structure

The production page contains:

1. Main Toolbox shell — RESOURCE LIBRARY
2. Overview/status modules
3. Resource Index SubToolbox
4. Search
5. Category filter
6. Resource cards
7. Document reader
8. Document hero
9. One SubToolbox per major document section

### Design principle

The Markdown is semantic source material.

The UI renderer owns:

- color;
- typography;
- Toolbox/SubToolbox framing;
- spacing;
- modules;
- table styling;
- checklist styling;
- process visuals;
- responsive behavior;
- print/PDF styling.

Do not embed ViewTube CSS, component code, color values, or complex layout markup inside the Markdown.

---

## Testing Contract

Two Resource Library tests currently exist.

### Registry/parser tests

src/features/resource-library/resourceLibraryRegistry.test.ts

These verify:

- resources are registered;
- canonical metadata is correct;
- Markdown frontmatter parses;
- major sections are discovered correctly.

### Render contract

src/features/resource-library/ResourceLibrary.contract.test.tsx

This verifies that the creator-facing Resource Library actually renders the canonical Markdown through the Toolbox document system and includes key structured content such as tables, checklists, and process flows.

### Minimum validation for every resource addition

Run or confirm:

- Resource registry/parser tests;
- Resource Library render contract;
- route governance;
- source governance;
- production build;
- browser/local smoke;
- mobile and desktop visual check.

---

## Important Repository Baseline Note

Do **not** assume every red repository-wide CI result was caused by the Resource Library.

At the time of this handoff, current main already has unrelated failures in areas including Vault, dashboard/widget tests, and TypeScript contracts.

The Resource Library itself has been observed passing:

- its registry/parser tests;
- its render contract;
- production build;
- focused contracts;
- source governance;
- local browser smoke.

When validating future Resource Library changes:

1. compare failures against the current main baseline;
2. fix every new Resource-specific regression;
3. do not expand the Resource Library PR into unrelated Vault/dashboard repair unless explicitly requested;
4. clearly document pre-existing failures if the full suite remains red.

---

## Navigation and Product Registration

The Resource Library is a first-class production page.

It must remain registered in all relevant surfaces:

- AppRoutes.tsx
- pageRegistry.ts
- primary navigation
- application menu
- nav icon registry
- route prefetch
- User Guide feature registry

The route is:

/resources

Direct resource selection uses:

/resources?resource=<resource-id>

Example:

/resources?resource=youtube-metrics-dimensions-glossary

Do not add a new production route without updating the page and guide governance registries.

---

## Known Limitations of the Current Renderer

The current implementation is intentionally a first production version.

### Mermaid

Complex Mermaid syntax is not fully rendered. Simple arrow-based process flows work best.

### YAML

Frontmatter parsing is deliberately simple: one-line key: value fields.

Do not introduce nested YAML structures or arrays until the parser is upgraded.

### Tables

Tables are horizontally scrollable when necessary, but very wide schemas are still harder to read on mobile.

Prefer semantic table splitting where possible.

### Images

There is not yet a fully developed Resource-image/figure pipeline.

For now, the source document can describe figures or link to authoritative sources, but a canonical image asset contract should be built before relying heavily on images.

### Charts

There is not yet a general Markdown-to-ViewTube chart specification.

Avoid embedding fake chart data. Future work should support structured chart definitions backed by real data.

### PDF

The Markdown and CSS are intentionally print-aware, but a formal automated PDF generation/export workflow remains future work.

---

## Near-Term Product Roadmap

After several more resources are ingested, the next agent should consider the following upgrades.

### 1. Related-resource navigation

Turn related_resources metadata into clickable Resource Library relationships.

### 2. Resource deep links

Support stable resource/section URLs beyond the current query-string resource selector.

Potential direction:

/resources/:resourceId#section-id

Do not change routing casually; preserve existing URLs.

### 3. Favorites and recent resources

The page already has the conceptual space for saved/recent resource workflows.

Add only after the core collection is sufficiently populated.

### 4. Contextual help integration

Toolbox and widget ? help controls should be able to open deeper Resource Library documents.

Prefer resource IDs over hard-coded URLs.

### 5. ViewTube Brain integration

Approved Resource Library documents should become trusted educational context available to the AI Brain.

Important distinction:

- Resource Library = general creator/platform knowledge
- channel/project evidence = creator-specific factual context

Do not allow general guidance to masquerade as channel-specific evidence.

### 6. PDF/export pipeline

Build a renderer that can generate polished PDFs from the same canonical Markdown.

The PDF should remain a derivative.

### 7. Image/figure contract

Create a stable syntax/metadata system for:

- figures;
- official screenshots;
- diagrams;
- original ViewTube illustrations;
- alt text;
- captions;
- source/provenance.

### 8. Structured charts

Create a chart block contract that allows real data or clearly labeled illustrative examples without embedding arbitrary HTML.

### 9. Resource version history

Track meaningful resource changes, source updates, and review dates.

### 10. Resource quality audit

Once 5–8 resources exist, audit:

- duplication;
- terminology consistency;
- source quality;
- category consistency;
- cross-links;
- outdated claims;
- visual density;
- mobile readability.

---

## First-Series Completion Strategy

Do not redesign the Resource Library separately for every new document.

The correct sequence is:

~~~text
Research resource
    ↓
Normalize Markdown
    ↓
Register
    ↓
Render with existing system
    ↓
Notice recurring layout need
    ↓
Improve shared renderer/template
    ↓
All resources improve together
~~~

If a new document needs a better comparison module, evidence module, figure block, or chart treatment, add that capability to the shared document system whenever practical rather than hardcoding one-off styling into that resource.

This is the central architectural principle for scaling from 2 documents to 15 and beyond.

---

## Acceptance Criteria for Each New Resource

A resource is ready to publish when:

- [ ] It has a stable resource ID.
- [ ] Its Markdown source is complete.
- [ ] Important claims are source-grounded.
- [ ] Fact, inference, anecdote, and unknowns are distinguishable.
- [ ] Historical information is clearly dated/contextualized.
- [ ] The document has meaningful ## section boundaries.
- [ ] Dense comparison material uses tables where appropriate.
- [ ] Actual workflows use checklists.
- [ ] Diagrams are used only when they improve understanding.
- [ ] Illustrative data is labeled.
- [ ] The document includes creator-facing actions.
- [ ] The document includes a glossary.
- [ ] Sources are organized and attributable.
- [ ] Maintenance/review metadata exists.
- [ ] The resource is registered in RESOURCE_LIBRARY_ENTRIES.
- [ ] README progress is updated.
- [ ] Direct resource selection works.
- [ ] Resource-specific tests pass.
- [ ] Production build still passes.
- [ ] Desktop and mobile rendering have been reviewed.
- [ ] No unrelated system was duplicated or overwritten.

---

## Agent Workflow and Repository Discipline

Follow the established ViewTube process:

1. Work from current main.
2. Create a focused branch.
3. Never commit directly to main.
4. Preserve existing Resource Library files unless there is a clear migration reason.
5. Use current production code as executable authority.
6. Use canonical docs/templates as authoring authority.
7. Add tests when behavior changes.
8. Verify the final result rather than stopping after code edits.
9. Use screenshots/browser verification when changing presentation.
10. Open a focused PR and document known baseline failures separately from new regressions.

---

## Next Agent: Recommended Immediate Task

The next content ingestion should be:

**#3 — Shorts vs Long-Form: Different Systems, Different Signals**

Recommended execution:

1. Receive or retrieve the completed research.
2. Audit factual claims and citations.
3. Normalize it using the canonical Resource template.
4. Preserve explicit distinctions between Shorts and long-form metrics/discovery.
5. Add comparison matrices heavily where appropriate.
6. Register it under a stable ID such as shorts-vs-long-form-signals.
7. Update the README from **2 of 15** to **3 of 15**.
8. Add or update registry test expectations.
9. Run Resource Library tests.
10. Inspect the resulting document in /resources on desktop and mobile.
11. Improve the shared renderer only if the document reveals a reusable gap.

---

## Do Not Lose These Principles

- Research quality comes before visual novelty.
- Markdown is the content authority.
- ViewTube's renderer owns design.
- Major ## sections are SubToolboxes.
- Do not invent platform thresholds or algorithm weights.
- Do not treat historical engineering papers as current proprietary truth.
- Do not duplicate the Vault, Research systems, User Guide, or developer docs.
- Improve shared rendering primitives instead of creating one-off document styling.
- Keep every resource searchable, versioned, source-grounded, and maintainable.
- The first 15 documents are the seed collection, not the limit of the system.
