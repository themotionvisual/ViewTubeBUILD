# ViewTUBE V2.4.0 UI Changelog

This document tracks all UI and layout modifications made to the Thumbnail Studio and Reference Studio.

---

### **Prompt Pass: V2.3.1 - Stable Border Motion**
- **ReferenceStudio.tsx**: Restored persistent outer border and shadow for natural sliding physics.

---

### **Prompt Pass: V2.4.0 - Workspace Symmetries & Sidebar Nexus**
- **Sidebar Integration**:
    - **NexusCommander.tsx**: Refactored as a relative component and integrated into the sidebar bottom. Removed floating global button.
- **ReferenceStudio Layout**:
    - **Symmetrical Grid**: Switched to a perfect **1:1 (50/50)** column split for better balance.
    - **Generate Art Button**: Re-styled to perfectly match the **Closed Sub-Toolbox** aesthetic (White background, gray icon box, light gray text, rounded-2xl).
    - **Border Weights**: Normalized all control borders (selects, canvas) to **4px** to match accordions.
    - **Vertical Alignment**: Adjusted canvas min-height to ensure symmetrical alignment when only the "Concept" box is open.
    - **Rounded Aesthetics**: Increased canvas rounding to **rounded-[48px]** for a premium feel.

---
