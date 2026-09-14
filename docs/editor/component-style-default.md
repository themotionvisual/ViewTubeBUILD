# Editor component-style default

The canonical component-style editor is the default ViewTube editor frontend.

- Internal frontend id remains `current-main` for backward compatibility with stored preferences and existing links.
- User-facing name is **Component Style** (`COMPONENT`).
- The alternate direct VT_E1 frontend is presented as **Classic Editor** (`CLASSIC`).
- `?editorStyle=component` and `?editorStyle=component-style` explicitly select the component-style frontend.
- Existing `?editorStyle=current` and `?editorStyle=current-main` links continue to work.
- `?editorStyle=classic`, `?editorStyle=linked`, and `?editorStyle=linked-classic` select the classic frontend.

The component-style frontend is the canonical light neo-brutalist responsive editor with the mini timeline map. The existing internal id is intentionally retained so this change does not invalidate persisted settings or downstream contracts.
