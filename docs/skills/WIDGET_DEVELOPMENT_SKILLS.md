# ViewTube Dashboard & Widget Development Protocol (The Definitive Skill)

This document is the authoritative engineering protocol for developers and AI agents working on the ViewTube dashboard ecosystem. It combines architectural standards, design language specifications, and component implementation rules.

## 1. Architectural Overview

The ViewTube dashboard (`src/views/dashboard/`) is a modular, drag-and-drop React interface using `@dnd-kit/core`. It consists of an underlying grid (`DashboardCanvas`) populated by widgets dynamically rendered via `WidgetRenderer`.

### Core Files
- **`WidgetRegistry.ts`**: Central source of truth. Every widget MUST be registered here with its `defaultSize`, `defaultHeight`, `headerColor`, `category`, and dependencies.
- **`WidgetShell.tsx`**: Wrapper component applying Neo-Brutalist styles, header rails, and handling options UI (resize, collapse, remove).
- **`WidgetRenderer.tsx`**: Maps widget `id` from the registry to the actual React component.
- **`storage.ts` / `types.ts`**: Strict typing for dimensions. Buckets: `SizeBucket` ("quarter", "third", "half", "full"); `HeightBucket` ("short", "medium", "tall", "xtall", "massive"). 
- **`toolboxWidgetSystem.css`**: Core CSS. **All styles must be scoped under `.dashboard-barrier`**.

## 2. Design Language: "Hard-Sharp" Neo-Brutalism

Strictly follow the high-contrast Neo-Brutalist design language. Avoid modern UI patterns (soft shadows, thin borders, rounded pills).

### Visual Tokens
- **Borders**: Solid, thick black borders. Inner elements: `2px solid #000`; Outer shell: `3px solid #000`.
- **Corner Radii**: Standardize on `8px` (`borderRadius: "8px"`). Do NOT use "pill" shapes. Main shells use `12px`.
- **Shadows**: Hard, offset shadows with zero blur. Example: `boxShadow: "2px 2px 0 0 rgba(0,0,0,1)"`.
- **Typography**: Heavy, uppercase fonts for headers. Use `fontWeight: 900` or `1000`.
- **Color Palette**: High-contrast, vibrant backgrounds (e.g., `#FF83EA` pink, `#FFFF61` yellow, `#4FFF5B` green, `#00CCFF` cyan).

## 3. Standardized Component Library

### Inputs and Textareas
**NEVER** build custom, ad-hoc inputs using native HTML styles.
- Use `<input className="vt-input" />`
- Use `<textarea className="vt-textarea" />`
- **CRITICAL LAYOUT RULE**: Do not apply inline `padding` to elements using `.vt-input` or `.vt-textarea`. Global CSS handles focus states using an `inset` box-shadow. Inline padding breaks this box-model compensation, causing layout shifts on focus.

### Dropdowns (The `vt-dropdown` Standard)
**NEVER** use native HTML `<select>` elements.
- Use the `CustomDropdown` React component (exported from `DataEditWidget.tsx`) or the structure below.
- **Clipping Constraint**: Because the parent `vt-widget` shell enforces `overflow: hidden`, dropdown menus are restricted to a `max-height` of `110px` to ensure they fit inside short widgets.

#### Implementation Structure (CSS-based):
```tsx
<div className={`vt-dropdown ${isOpen ? "active" : ""}`} onMouseLeave={() => setIsOpen(false)}>
  <div className="vt-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
    <span>{currentValue}</span>
    <ChevronDown size={14} strokeWidth={3} />
  </div>
  <div className="vt-dropdown-menu">
    {options.map(option => (
      <div className="vt-dropdown-item" onClick={() => handleChange(option)}>
        {option.label}
      </div>
    ))}
  </div>
</div>
```

### Buttons
- Standard: `<button className="vt-button">`
- Primary: `<button className="vt-button primary">`

## 4. Widget Development Workflow

1. **Registry First**: Define in `WidgetRegistry.ts`.
2. **Component Creation**: Build in `src/views/dashboard/widgets/`.
3. **Renderer Mapping**: Add import/mapping in `WidgetRenderer.tsx`.
4. **Local State**: Sync state to `localStorage` using unique key (`vt_widgetname_state`) for persistence across dashboard re-renders.
5. **Form Elements**: Use `vt-button` and inline `<input>` tags with thick borders.

## 5. Layout Engine & Grid Rules

- **Widths**: Avoid fixed pixels. Use dashboard flex/grid properties.
- **Heights**: Update `WidgetRegistry.ts` for more space (e.g., `defaultHeight: "massive"` = 850px).
- **Caching Warning**: Dashboard caches grid layout in `localStorage`. Updating `defaultSize`/`defaultHeight` in the registry will NOT affect existing active widgets in a user's cached layout. User must reset layout or clear storage.
- **Flattened Modules**: Avoid deep nesting. Primary identifiers (e.g., "Video Title") should sit at the root level, not buried in collapsible sections.
- **Scrollable Containers**: Ensure inner containers have `overflow-y: auto` and `flex: 1` if content exceeds boundaries.
