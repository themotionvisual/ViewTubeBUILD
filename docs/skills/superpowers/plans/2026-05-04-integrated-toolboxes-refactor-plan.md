# Integrated Toolboxes Refactor Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the standalone tools into a modular, interactive SubToolbox system that matches the ViewTube architectural pattern.

**Architecture:** A unified Main Toolbox containing 10 togglable SubToolboxes, each with active controls (Dropdowns, Buttons, Stats).

**Tech Stack:** HTML5, CSS3, Vanilla JS, GSAP, Lucide, Chart.js.

---

### Task 1: Component Core Refactor

**Files:**
- Modify: `../new-repo-temp/AWESOME_TOOLBOXES.html`

- [ ] **Step 1: Rewrite CSS for SubToolbox and Control components**
Implement the specific Neobrutalist styles for headers, icon rails, and togglable main areas.

- [ ] **Step 2: Implement JS component constructors**
Create `createSubToolbox`, `createDropdown`, `createActionButton`, and `createStatModule` functions to enable rapid, consistent UI generation.

### Task 2: Implement Refactored Viral & Retention SubToolboxes

- [ ] **Step 1: Rebuild Viral Architect**
Use the new `SubToolbox` pattern with a Niche Dropdown and Active Hook Generator.

- [ ] **Step 2: Rebuild Retention Sentry**
Include a Segment Selector and the Retention Waveform within a modular SubToolbox.

### Task 3: Implement Refactored Money & Global SubToolboxes

- [ ] **Step 1: Rebuild Monetization Multiplier**
Active calculator with sponsorship stat modules.

- [ ] **Step 2: Rebuild Global Bridge**
Market potential selector and AI Dubbing preview module.

### Task 4: Implement Refactored Shorts & Community SubToolboxes

- [ ] **Step 1: Rebuild Shorts Studio**
Vertical preset selector and active trend scanner.

- [ ] **Step 2: Rebuild Community Cultivator**
Sentiment score stat module and superfan identify action.

### Task 5: Implement Refactored Oracle & Interrogator SubToolboxes

- [ ] **Step 1: Rebuild Project Oracle**
14-day roadmap generator with workload stat module.

- [ ] **Step 2: Rebuild Algorithmic Interrogator**
Interactive query terminal with forensic correlation stats.

### Task 6: Implement Refactored Persona & Mastermind SubToolboxes

- [ ] **Step 1: Rebuild Persona Guardian**
Voice alignment radar and tone score stat modules.

- [ ] **Step 2: Rebuild Storytelling Mastermind**
Active beat board mapper and pacing stat module.

### Task 7: Final Polish & Interaction Wiring

- [ ] **Step 1: Wire up all GSAP toggle animations**
Ensure SubToolboxes open/close with the established smooth transition.

- [ ] **Step 2: Final visual audit**
Check alignment, shadows, and color consistency across all 10 tools.
