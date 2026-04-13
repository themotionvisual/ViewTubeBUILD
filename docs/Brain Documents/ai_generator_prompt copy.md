# The 'Mega-Composer' Component Generator Prompt

**How to use:** Send this entire block to your AI generator. 
**Mandatory Attachments:** 
1. `ToolboxUISystem.tsx` (Logic Reference)
2. `Main Toolbox.txt` (Aesthetic Reference)
3. **The Video Player Image** provided in our chat (as the "Vibe Reference")

---

### PROMPT START: THE NEO-BRUTALIST COMPONENT COMPOSER

**ACT AS:** An elite UI Architect and Creative Developer who designs interactive "Video Game Console" interfaces and "Tactile Portal" dashboards.
**OBJECTIVE:** Create 30+ "Wild" components for the ViewTube Neo-Brutalist design system. I am looking for **Interesting Compositions** (how components cluster together) as well as **Individual Components** (atomic units).

**STRICT "GRID" LAWS (Reference `ToolboxUISystem.tsx`):**
1. **Vertical Rhythm**: Every module must start/end on the **60px Grid Unit**. 
2. **Spacing**: Exactly **24px Gaps** between items.
3. **Internal Padding**: Exactly **24px** inside `SubToolbox` containers.
4. **Borders**: 4px to 6px solid black. Hard shadows: `shadow-[6px_6px_0px_0px_black]`.

**TASK 1: ATOMIC COMPONENTS (Variants)**
Create multiple versions of each primitive to show design range:
- **Sliders**: 3 versions (Thin pill, Thick chunky track, Multi-handle indicator).
- **Toggle Switches**: 3 versions (Mechanical lever, Glowing circle button, Text-based sliding pill).
- **Checkboxes**: 3 versions (Chunky square with X, Circle with Dot, "Indented" depth-box).
- **Knobs/Dials**: 3 versions (Nested ring, Dial-pointer, Numeric "Scroll-wheel").

**TASK 2: GROUPED COMPOSITIONS (Real-World Modules)**
Create several `SubToolbox` containers that cluster these components into "Functional Portals":
1. **The "Analytics Matrix" (Composed 4 units tall)**: 
   - A cluster of a Histogram + 4 Mini-KPI indicators (with border boxes).
   - A "Vibe Heatmap" next to a "Sentiment Slider".
2. **The "Content Controller" (Composed 3 units tall)**: 
   - A mechanical joystick XY-pad.
   - Two large Dial-Knobs with unit-sublabel boxes below them.
   - A "Status LED" bank of 3 glowing circles.
3. **The "Media Strip" (Composed 2 units tall)**: 
   - A video-scrubber with "Keyframe Markers" (mini rounded squares on the line).
   - "Trim" and "Add Marker" buttons with Hard Shadows that click-deep.

**DESIGN THEME: "VIDEO PORTAL PORTAL"**
- Use **Thick Strokes** (4px-6px).
- Use **Vibrant Neons** (24D3FF Cyan, FCAF57 Orange, FF7497 Pink, C9F830 Lime).
- Use **Grid Mesh Backgrounds** on interactive panels.
- **Inverted Mode**: For every component, show one version in "Inverted" colors (Black background, Neon borders).

**CODE STYLE:**
- Tailwind CSS + Lucide Icons.
- Standardize on `SubToolbox` as the parent.
- Ensure the containers use the `openUnits={N}` math correctly.

---
### PROMPT END
