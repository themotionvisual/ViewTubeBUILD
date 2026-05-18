# Design Doc: 10 Unique Creator Cockpits (Full Redesign)

## Overview
Redesign the 10 toolboxes from generic templates into **unique, high-performance creator cockpits**. Each toolbox will have a bespoke layout, custom interactive components, and a clear, functional "soul" based on the `subtoolbox-components-manifest.html`.

## Architectural Shift
1.  **Unique Layouts:** No more identical grids. Each tool uses a custom assembly of `Joined`, `Composite`, and `Expandable` components.
2.  **Functional Controls:** Dropdowns that actually open, sliders that update values, and buttons that trigger real logic (simulated for standalone HTML).
3.  **Visual DNA:** Pure Neobrutalist execution. Thick 4px strokes, high-saturation accents, and canonical sub-toolbox rail widths (56px).

---

## 10 Bespoke Toolboxes

### 1. 🏗️ The Viral Architect (Packaging Hub)
*   **Focus:** Title/Thumbnail/Hook synergy.
*   **Unique UI:** A "joined" strip for Title input + real-time "Power Word" highlighter.
*   **Active Piece:** A "Thumbnail Canvas" preview that toggles "Algorithm Heatmap" overlays.

### 2. 🛡️ The Retention Sentry (Forensic Lab)
*   **Focus:** Finding the "Boring Zones".
*   **Unique UI:** A large "Forensic Waveform" chart.
*   **Active Piece:** A "Segment Jumper" control that synchronizes the chart with a list of "Actionable Fixes" (e.g., "Insert B-Roll at 02:45").

### 3. 💸 The Monetization Multiplier (Revenue Cockpit)
*   **Focus:** Maximizing RPV (Revenue Per View).
*   **Unique UI:** A "Joined" Sponsorship calculator with a vertical "Niche Multiplier" plunger (slider).
*   **Active Piece:** A "CPM Arbitrage" map that updates a "Top Target Markets" rule-list.

### 4. 🌐 The Global Bridge (Expansion Engine)
*   **Focus:** International growth ROI.
*   **Unique UI:** A "Composite" dashboard showing top 5 market potential.
*   **Active Piece:** An "AI Dubbing Lab" with a waveform preview and a "Vocal Persona" dropdown that actually changes the preview profile.

### 5. 📱 The Shorts Studio (Vertical Lab)
*   **Focus:** Vertical hook and retention logic.
*   **Unique UI:** A 9:16 mobile frame preview.
*   **Active Piece:** A "Swipe-vs-Stay" matrix that allows toggling different vertical layout presets (Split-screen, Overlay, Reaction).

### 6. 🤝 The Community Cultivator (Loyalty Wall)
*   **Focus:** Building a superfan base.
*   **Unique UI:** A "Identity Wall" of fan avatars with engagement deltas.
*   **Active Piece:** A "Sentiment Heatmap" that allows drilling down into specific comment vibes (Positive/Toxic/Constructive).

### 7. 🔮 The Project Oracle (Burnout Guard)
*   **Focus:** 14-day production roadmap.
*   **Unique UI:** A horizontal "Priming Roadmap" with draggable beats.
*   **Active Piece:** A "Creative Energy Meter" (radial gauge) that updates based on the intensity of the planned tasks.

### 8. 🔍 The Algorithmic Interrogator (Data Terminal)
*   **Focus:** Natural language data exploration.
*   **Unique UI:** A high-contrast "Terminal" interface (Green on Black).
*   **Active Piece:** A functional "Command Input" where typing specific keywords (e.g., `FLOP`, `BOOM`, `FIX`) triggers different forensic reports.

### 9. 🛡️ The Persona Guardian (Voice Shield)
*   **Focus:** Brand consistency and tone alignment.
*   **Unique UI:** A "Voice Alignment Radar" chart.
*   **Active Piece:** A "Tone Scorer" that takes a script snippet and provides a grade-level and energy-level alignment report.

### 10. 🎬 The Storytelling Mastermind (Arc Builder)
*   **Focus:** Narrative pacing and emotional arcs.
*   **Unique UI:** A "Beat Board" with modular scene cards.
*   **Active Piece:** An "Emotional Arc" visualizer that shows the "Golden Ratio" vs. the "Current Arc," suggesting where to add cliffhangers.

---

## Technical Specs
*   **Navigation:** A sidebar with "Active Session" status and tool quick-links.
*   **Components:** 
    *   `SubToolbox`: Standard shell with rail.
    *   `JoinedRow`: Multi-input rows.
    *   `Dropdown`: Functional `details/summary` or JS-powered overlay.
    *   `StatMod`: Bold, inverted-color KPI modules.
*   **Animations:** GSAP `stagger` for tool entry, `scale` for interactions.

## Implementation Plan
1.  **Phase 1: Component Library:** Build the core CSS/JS for the `SubToolbox` DNA (Rails, Borders, Dropdowns).
2.  **Phase 2: Individual Tool Assemblies:** Implement each of the 10 toolboxes with their **bespoke internal layouts**.
3.  **Phase 3: Interactive Logic:** Wire up the dropdowns, sliders, and terminal to provide functional feedback.
4.  **Phase 4: Visual Polish:** Finalize Neobrutalist spacing and shadow-layering.
