# Shorts Retention Module Redesign Specification

**Goal:** Redesign the Shorts Retention module to improve visual hierarchy, compactness, and data presentation.

## 1. Top-Right Control Section
- **Number (100):** Centered.
- **Selection:** Selected option (e.g., "Top Performing") centered beneath "100" in max-fit bold text.
- **Label ("VIDEOS"):** Placed beneath the selection, enlarged and matching font weight.

## 2. Stats Cards (Subtitle Section)
- **Geometry:** Height and width reduced by 50%.
- **Typography:**
  - Stat titles: Increased font size.
  - Stat values: Decreased font size.
  - Alignment: Balanced to share vertical height.
- **Corner Styling:** 8px rounded corners.

## 3. Subtitle Section (First under green header)
- **Geometry:** Height reduced by 50%.
- **Content:** Video titles truncated to 2 lines; text resizes automatically to fit the smaller footprint.

## 4. Module Footer (Marquee Section)
- **Geometry:** Height maintained (current).
- **Layout:** Integrated Chart/Personal Insight content into a marquee scroll (style: black background, lime green text, bold).
- **Styling:** Thick border and rounded corners maintained.

## 5. Layout Adjustments
- **Overall:** Padding/margins reduced to maximize container fill.
- **Label Alignment:** Stats label centered horizontally within the container.
- **Bottom-Left Corner:** Cleaned up: removed lines, kept one zero, rounded corner.

---

**Spec review checklist:**
- [ ] No placeholders.
- [ ] Requirements consistent with constraints.
- [ ] Scope focused on Shorts Retention Module redesign.
