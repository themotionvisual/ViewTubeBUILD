export type EditorFrontendMode = 'current-main' | 'linked-classic';
export type EditorHostMode = 'auto' | 'mobile' | 'desktop';

export const EDITOR_FRONTEND_STORAGE_KEY = 'viewtube.editor.frontend-mode.v1';

export const EDITOR_FRONTEND_MODES = [
  {
    id: 'current-main' as const,
    label: 'Current Main',
    shortLabel: 'CURRENT',
    description: 'Responsive ViewTube host: touch-first mobile editor on narrow viewports and canonical VT_E1 on desktop.',
  },
  {
    id: 'linked-classic' as const,
    label: 'Linked Branch',
    shortLabel: 'LINKED',
    description: 'Classic direct VT_E1 host used by the linked deployment, backed by the same canonical VT_E1 engine as current main.',
  },
] as const;

export function normalizeEditorFrontendMode(value: unknown): EditorFrontendMode {
  return value === 'linked-classic' ? 'linked-classic' : 'current-main';
}

export function resolveEditorFrontendMode({
  queryValue,
  storedValue,
}: {
  queryValue?: unknown;
  storedValue?: unknown;
}): EditorFrontendMode {
  if (queryValue === 'linked' || queryValue === 'linked-classic') return 'linked-classic';
  if (queryValue === 'current' || queryValue === 'current-main') return 'current-main';
  return normalizeEditorFrontendMode(storedValue);
}

export function editorHostModeFor(
  frontendMode: EditorFrontendMode,
  requestedMode: EditorHostMode,
): EditorHostMode {
  return frontendMode === 'linked-classic' ? 'desktop' : requestedMode;
}

export function readEditorFrontendMode(): EditorFrontendMode {
  if (typeof window === 'undefined') return 'current-main';
  try {
    return resolveEditorFrontendMode({
      queryValue: new URLSearchParams(window.location.search).get('editorStyle'),
      storedValue: window.localStorage.getItem(EDITOR_FRONTEND_STORAGE_KEY),
    });
  } catch {
    return 'current-main';
  }
}

export function writeEditorFrontendMode(mode: EditorFrontendMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EDITOR_FRONTEND_STORAGE_KEY, normalizeEditorFrontendMode(mode));
  } catch {
    // Storage can be unavailable in privacy modes. The live React state still switches immediately.
  }
}
