# Design Doc: 10 Integrated Sub-Toolboxes (Refactored)

## Overview
Refactor the 10 standalone tools into a cohesive, integrated "Main Toolbox" architecture that mirrors the actual ViewTube `ToolboxUISystem.tsx`. Instead of separate sections, these will be "SubToolboxes" that are modular, interactive, and part of a unified workflow.

## The Architectural Pattern
1.  **Main Toolbox Shell:** A container with consistent branding, a sidebar for top-level navigation, and a scrollable main area.
2.  **SubToolbox Component:** The standard building block (Header with IconRail, Title, Toggle Button).
3.  **Active Controls:**
    *   `DropdownControl`: For selecting strategies/modes.
    *   `ActionControlButton`: For triggering generation/analysis.
    *   `StatModules`: For high-impact visual feedback.
    *   `RuleList`: For displaying tactical advice/checklists.

## The 10 Refactored Sub-Toolboxes

### 1. [Viral] The Architect
*   **Goal:** Optimize first 30 seconds.
*   **Controls:** Niche Dropdown, "Generate Hook" Action, CTR Stat Module.

### 2. [Retention] The Sentry
*   **Goal:** Minimize drop-offs.
*   **Controls:** Segment Selector, "Analyze Gaps" Action, AVD Stat Module.

### 3. [Money] The Multiplier
*   **Goal:** Maximize RPV.
*   **Controls:** Multiplier Slider (Mock), "Calculate Rate" Action, Sponsorship Stat Module.

### 4. [Global] The Bridge
*   **Goal:** International reach.
*   **Controls:** Language Multi-select, "Preview Dub" Action, Revenue Lift Stat Module.

### 5. [Shorts] The Studio
*   **Goal:** Vertical dominance.
*   **Controls:** Layout Preset Dropdown, "Scan Trends" Action, Retention Index Stat.

### 6. [Community] The Cultivator
*   **Goal:** Fan loyalty.
*   **Controls:** Engagement Goal Dropdown, "Identify Superfans" Action, Sentiment Score Stat.

### 7. [Oracle] The Planner
*   **Goal:** Channel roadmap.
*   **Controls:** Strategy Mode Dropdown, "Build 14-Day Plan" Action, Workload Stat.

### 8. [Interrogator] The Analyst
*   **Goal:** Forensic insights.
*   **Controls:** Data Source Dropdown, "Run Query" Action, Correlation Stat.

### 9. [Persona] The Guardian
*   **Goal:** Brand voice.
*   **Controls:** Tone Profile Dropdown, "Check Alignment" Action, Consistency Stat.

### 10. [Mastermind] The Storyteller
*   **Goal:** Narrative structure.
*   **Controls:** Story Arc Dropdown, "Map Beats" Action, Pacing Stat.

## Visual & Interaction Goals
*   **Active Components:** Every SubToolbox must have at least 2 interactive controls and 1 visual stat module.
*   **Intuitive Layout:** Controls on the left/top, visual output on the right/bottom.
*   **GSAP Polish:** Smooth toggling of SubToolboxes and animated stat counting.
*   **Neobrutalist Aesthetic:** Thick black borders (4px), sharp shadows, and high-contrast colors (Lime, Pink, Sky, Orange).

## Implementation Plan
1.  **Redesign Shell:** Update `AWESOME_TOOLBOXES.html` to use the `SubToolbox` component structure exactly.
2.  **Modularize Logic:** Create JS classes or functions for each control type (`Dropdown`, `Action`, `Stat`).
3.  **Refactor Content:** Replace the static grid layouts with the interactive SubToolbox model.
4.  **Final Verification:** Ensure the UI feels like a "cockpit" for a creator, where everything is an active tool.
