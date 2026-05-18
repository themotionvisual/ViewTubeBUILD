# ViewTube UI Design System & Rules

This document outlines the strict UI guidelines and component hierarchy for the ViewTube Neo-Brutalist design system. By adhering to these rules, the application maintains a cohesive, premium, and distinctively robust aesthetic.

---

## 1. Core Principles: The Neo-Brutalist Aesthetic

- **High Contrast:** All elements use stark, high-contrast borders (typically `border-black`).
- **Heavy Borders & Shadows:** Components feature thick borders (3px to 5px) and sharp, unblurred, offset block shadows (e.g., `shadow-[8px_8px_0px_0px_black]`).
- **Typography:** Extremely bold, impactful typography. Headers utilize `font-[1000]`, uppercase styling, and tight letter-spacing (`tracking-tighter`). Smaller labels utilize `tracking-widest` to offset the heavy weight.
- **Dynamic Interaction:** Elements should feel tactile. Hover states frequently use transform adjustments (e.g., `hover:-translate-y-1` or `hover:scale-105`) to simulate physical buttons being pressed or lifted, accompanied by shadow changes.
- **Standardized Palette:** Colors are pulled from the `TOOLBOX_PALETTE`, alternating between vivid neons (Hyper Magenta `[#CC00FF]`, Canary Yellow `[#FFFF61]`, Electric Green `[#4FFF5B]`, Sky Aqua `[#40C6E9]`).

---

## 2. Component Hierarchy

### A. The Toolbox (`ToolboxScaffold`)
The highest level of structural organization. A Toolbox encases an entire feature or workflow.

**Rules:**
- **Outer Shell:** Must use `w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black]`.
- **Header:** Height is fixed at `h-[80px]`, featuring a solid bottom `border-b-[5px] border-black`.
- **Title Text:** Must be `text-[50px] font-[1000] uppercase tracking-tighter leading-none mt-1` (on desktop sizes).
- **Icon Block:** The icon sits in a dedicated box on the left (`w-[80px] h-full`) with a `border-r-[5px] border-black`.
- **Coloring:** Adheres to the palette index mapping. The Header background gets `getPaletteColor(index)` and the Icon box receives `getPaletteColor(index + 4)` for high-contrast pairing.
- **Padding:** Inner content area uses heavy padding, usually `p-8 bg-white` (unless embedded).
- **Subtitle/Help Text:** If included, runs directly beneath the header with a functional dropdown toggle `[?]` and `[+/-]` utilizing bold, uppercase micro-typography (`text-[11px] tracking-widest`).

### B. The Sub-Toolbox (`SubToolbox`)
Used to segment complex tools into distinct, collapsible or grouped sections *within* a primary Toolbox.

**Rules:**
- **Outer Shell:** Uses a slightly lighter shadow hierarchy: `border-[5px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black]`.
- **Header:** Smaller height, typically utilizing `p-4` with a bottom `border-b-[5px] border-black`.
- **Title Text:** Scaled down to `text-2xl font-black uppercase tracking-tighter leading-none`.
- **Header Icon:** Uses a `w-8 h-8` container, separated from the title by a vertical divider (`w-[3px] h-8 bg-black`).
- **Collapsibility:** Often features an un-styled or lightly styled `[+] / [-]` toggle button (`w-8 h-8 border-[3px] border-black rounded-full`) on the right.
- **Padding:** Inner content uses `p-6 flex flex-col space-y-6`.

### C. Modules (Functional Groupings)
Structural layouts used within Toolboxes to display data, visuals, or lists.

**Rules:**
- **Grids & Layouts:** Prefer CSS `grid` (e.g., `grid-cols-1 md:grid-cols-2 gap-8`) to structure content blocks.
- **Cards/Containers:** Inner cards or visual modules should utilize `border-[4px] border-black shadow-[6px_6px_0_0_black]` or `shadow-[8px_8px_0_0_black]`.
- **Section Headers:** Internal section titles should utilize `font-black uppercase tracking-widest text-sm border-b-4 border-black pb-2 mb-6`.

### D. Primitive Components

#### 1. Buttons & Actions
- **Primary Action:** Bold background color, high contrast text (or black). Must include a thick border and sharp shadow.
  - Example: `bg-[#FF3399] text-white border-[4px] border-black px-10 py-5 rounded-2xl font-[1000] text-2xl uppercase tracking-tighter shadow-[8px_8px_0_0_black]`
- **Hover States:** Buttons must visibly react. Standard interaction is `hover:translate-y-1 hover:shadow-none transition-all` (makes the button feel like it is pushed down) or `hover:-translate-y-1` (makes it raise up).
- **Secondary Action:** Outlined style, usually `bg-white text-black border-[4px] border-black`, matching the hover logic of primary actions.

#### 2. Inputs & Forms
- **Text Inputs:** Large, spacious design.
  - Example: `bg-white border-[4px] border-black rounded-2xl p-5 font-black uppercase text-lg`.
  - **Focus State:** Must have an `outline-none` and a custom focus ring, e.g., `focus:ring-4 focus:ring-[#FF3399]/30 transition-all`.
- **Labels:** Positioned outside/above the input, styled as `text-[10px] font-black uppercase tracking-widest text-black/50 ml-2`.

#### 3. Badges, Tags & Status Indicators
- **Style:** Small, highly contrasting background. Usually `border-2 border-black px-3 py-1 rounded-lg`.
- **Text:** Micro-typography: `text-[10px] font-black uppercase`.
- **Usage:** Ideal for 'LIVE', 'ACTIVE', 'UPDATING', or category tags.

#### 4. Tables & Data Lists
- **Rows:** Thick borders separating items (e.g., `border-b-[4px] border-black bg-white`).
- **Headers:** High contrast table headers (e.g., `bg-black text-[#CCFF00] font-black uppercase text-xs tracking-widest`).
- **Interaction:** Hovering over rows should yield a background color shift (e.g., `hover:bg-gray-50`) and potentially expand for deeper nested data (`AccordionContainer` or simple state toggle).

#### 5. Dialogue Popouts & Modals
- **Backdrop:** A dark, semi-transparent backdrop with optional blur `bg-black/80 backdrop-blur-sm`.
- **Shell:** Standard Toolbox-style container but centered (`w-full max-w-sm rounded-[32px] overflow-hidden shadow-[16px_16px_0_0_#CCFF00]`).
- **Header:** Similar to SubToolboxes but optimized for overlays, including a robust `[X]` exit button `border-[3px] border-black hover:scale-110`.

---

## 3. Implementation Checklist

Before shipping a new UI component in ViewTube, ensure it passes these checks:
1. [ ] **Border Weight:** Are borders 3px-5px and `border-black`? 
2. [ ] **Block Shadows:** Are shadows solid, unblurred offsets (`shadow-[Xpx_Ypx_0_0_black]`)?
3. [ ] **Typography:** Is the text using extremely bold, uppercase styling for primary labels and headers?
4. [ ] **Collapsible States:** Do expand/collapse functions have smooth, transition-duration mapped animations (e.g. `duration-700 ease-in-out grid transition-[grid-template-rows,opacity]`)?
5. [ ] **Palette Consistency:** Does it use `getToolboxPaletteColors(index)` for mapping high-level tool headers and icons?
6. [ ] **Hover Interactions:** Does the element provide immediate, tactile physical feedback when interacted with?
