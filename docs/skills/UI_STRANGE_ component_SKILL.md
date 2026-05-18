---
name: scope-viewtube-component-css
description: Fix UI leaks and CSS conflicts in large components by wrapping them in unique scope classes and using descendant selectors.
---

## When to Use
- Styles from one view (e.g., `ResearchLab`) are affecting elements in other views (e.g., `Dashboard`).
- Component uses global-sounding classes like `.pop-button`, `.pop-box`, or `.card`.
- Using `<style>` tags inside a component with Tailwind `@apply` directives.
- Styling 3rd-party library elements (e.g., Google Charts, Recharts) that don't support direct class injection.

## Procedure

1.  **Define a Scope Class**:
    Wrap the root element of your component in a div with a unique, descriptive class name:
    ```tsx
    return (
      <div className="research-lab-scope ...">
        {/* ... component content ... */}
      </div>
    );
    ```

2.  **Scope Internal Selectors**:
    In the component's `<style>` block, ensure every custom class is a descendant of the scope class:
    ```css
    <style>{`
      .research-lab-scope .pop-button {
        @apply px-6 py-3 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_black] transition-all;
      }
      .research-lab-scope .pop-box {
        @apply bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_black];
      }
    `}</style>
    ```

3.  **Scope 3rd-Party Overrides**:
    To override styles for external libraries (like Google Charts) without affecting the rest of the app, use the scope class as a prefix:
    ```css
    .research-lab-scope .google-visualization-chart svg circle {
      animation: none !important;
      stroke-width: 2px !important;
    }
    .research-lab-scope .google-visualization-tooltip {
      pointer-events: none !important;
    }
    ```

## Pitfalls and Fixes
- **Global Selector Leak**: Accidentally using `circle { ... }` or `div { ... }` without the scope prefix.
  - **Symptom**: Buttons on the Sidebar or icons in the Header suddenly change size or color.
  - **Fix**: Prepend the scope class to the selector.
- **Tailwind Conflict**: Tailwind's preflight or base styles being overridden globally.
  - **Fix**: Ensure the scope class is specific enough.

## Verification
- Navigate between the component being fixed and a neutral view (e.g., Dashboard).
- Inspect elements in the neutral view to ensure no styles from the scoped component are applied.
- Verify that 3rd-party elements (like tooltips) within the component still look and behave as expected.
