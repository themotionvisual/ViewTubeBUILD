# ViewTube Master Plan (Single‑Page Operating Plan)
Last Updated: 2026-03-31

This document merges **all planning tracks** into one readable, regularly updated master plan. It is the single source of truth for launch, tooling, data, billing, onboarding, and long‑term R&D.

## Sources (Accessible & Active)
- `viewtube_master_blueprint.md.resolved`
- `viewtube-local/ROADMAP.md`
- `6482afd8-501f-4c3b-8b71-b07f65a98d92/implementation_plan.md`
- `viewtube-local/LAUNCH_GUIDE.md`
- `viewtube-local/DEFINITIVE_UI_OUTLINES_AND_GUIDELINES.md`
- `viewtube-local/VIEWTUBE_ULTIMATE_COMPILATION.md`
- `/Users/cwb/Downloads/viewtube/VIEWTUBE_ULTIMATE_COMPILATION.md`
- `viewtube-local/UI_CHANGELOG.md`
- `viewtube-local/ULTIMATE_PROJECT_INDEX.md`

## Executive Summary
ViewTube is a **5‑Hub Creator OS** (Overview, Strategy, Studio, Performance, System). Launch success depends on stable auth, consistent UI, reliable AI/API flows, and a reduced core toolset. Post‑launch focuses on advanced analytics, tool consolidation, and premium monetization.

## Launch Definition (What “Ready” Means)
- New user can connect YouTube, add Gemini key, and run 3 core tools end‑to‑end.
- No auto‑generation on load; all AI actions are user‑triggered.
- Consistent Toolbox + SubToolbox styling across all tools.
- Clear help tips, empty states, and error guidance.
- Stable build with no console errors.

## Core Architecture (Non‑Negotiable)
- **5‑Hub Lifecycle Architecture**  
  Overview → Strategy → Studio → Performance → System  
- **Cross‑Lifecycle Optimization Loop**  
  Performance Hub feeds into Studio tools for improving old uploads.
- **Reference Studio** remains accessible for QA and legacy comparison.

---

## Track 1 — Launch Readiness (NOW → 4 Weeks)
**Goal:** Stable, usable, consistent MVP release.

### Must‑Have Checklist
1. YouTube OAuth working with disconnect + error handling.
2. Gemini key management + Flash/Pro preference works.
3. Core tools complete:
   - Video Publisher
   - Video Manager
   - Thumbnail Studio
   - Content Analysis
   - Hook Generator
4. Dashboard widgets populate or show clean empty states.
5. Settings fully functional and clean.
6. Help system present in every tool.
7. API reliability (rate limiting, retries).
8. Build & deploy stable.

### De‑scoped for Launch (unless critical)
- Movable Toolbox Grid
- Firebase persistence
- Stripe integration

---

## Track 2 — Auth, API, and Security
**Goal:** Stable connections, safe key usage, and predictable API behavior.

### YouTube OAuth
- Use popup flow for better UX.
- Handle refresh tokens, expiry, and re‑auth.
- Clean disconnect and state reset.

### Gemini Key
- Store locally only.
- Validate format and show missing‑key guardrails.
- Never auto‑generate.

### API Reliability
- Debounce / queue requests.
- Basic caching for analytics.
- Clear user error guidance.

---

## Track 3 — Billing, Trials, Subscriptions
**Constraint:** Users bring their own Gemini key.  
Billing is for software value, not AI usage.

### Recommended Path
- 7‑day full trial.
- Hard gate on premium tools after trial.
- Stripe for subscriptions.

### Longer Term
Free / Pro / Team tiers (from Ultimate Compilation):
- Free: limited usage
- Pro: $9.99/mo
- Team: $29.99/mo

---

## Track 4 — Tool Readiness (Launch Set)
**Must Ship Tools**
- Dashboard
- Video Publisher
- Video Manager
- Thumbnail Studio
- Content Analysis
- Hook Generator
- Studio Hub
- Settings

**Readiness Criteria**
- Data in → data out works.
- No auto‑generate.
- Consistent SubToolbox styling.
- Help + empty states present.

**Post‑Launch Ports**
- Research Lab
- Projects (Kanban)
- Simple Analytics (Pulse)
- Keyword Research
- Algorithm Architect

---

## Track 5 — Tool Optimization & Consolidation
**Goal:** Reduce overload and improve power workflows.

### Optimization Targets
- Video Manager: analytics heatmaps + playlist automation.
- Thumbnail Studio: ranking + A/B testing.
- Content Analysis: retention curve + pacing fixes.

### Consolidation Rules
- If tools share >60% inputs → merge.
- Small output‑only tools → fold into parent.
- Low‑use tools → Advanced toggle.

### Planned Architecture
- Toolbox Registry (single inventory of tools).
- Tool Overlay + Integration Bar for in‑context tool mashups.

---

## Track 6 — Data Infrastructure & Analytics
**Goal:** Stable analytics and scale‑safe data ingestion.

### Requirements
- Cache analytics results.
- Batch API calls.
- Normalize CSV imports (dedupe + safe parsing).

### From Ultimate Compilation
- `performSync` exists → harden it.
- Drive/Sheets sync exists → connect it.

---

## Track 7 — Onboarding & Help
**Goal:** Usable without external documentation.

### Must‑Haves
- Inline help in every tool.
- Clean empty states.
- 3‑step onboarding checklist.

### Optional
- Video walkthroughs.
- Help center page.
- Link to Reference Studio as “Legacy Baseline.”

---

## Track 8 — QA, Performance, Observability
**Goal:** Prevent regressions and keep UI fast.

### Checklist
- Smoke tests on core tools.
- Performance budget for dashboard.
- Error logging for API failures.
- Verify 5‑Hub navigation and accordion integrity.

---

## Track 9 — Go‑To‑Market & Ops
**Goal:** Simple entry to paid adoption.

### Tasks
- Landing page.
- Trial onboarding emails.
- Support form + FAQ.

---

## Track 10 — Governance, Privacy, Compliance
**Goal:** Protect user data and define boundaries.

### Required
- Privacy policy.
- Terms of service.
- Consent + retention rules for YouTube data.

---

## Timeline (Suggested)
### Weeks 1–4 (Launch Candidate)
- Finish core tools.
- Auth + key management.
- UI system consistency.

### Weeks 5–8 (Post‑Launch)
- Movable Toolbox Grid.
- Firebase persistence.
- Early billing flow.

### Weeks 9–12 (Expansion)
- Research Lab + Projects.
- Advanced analytics.
- Tool consolidation phase 1.

---

## Current Priorities (Now)
1. Auth + API reliability.
2. Core tools complete + consistent.
3. Clean onboarding + help.
4. Lock launch scope.

---

## Update Protocol
- Update this master plan weekly.
- If new artifacts appear in Brain, add to Sources.
- Track changes in a short “What Changed” note at top.
