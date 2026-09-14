export type EditorFrontendMode = 'current-main' | 'linked-classic';
export type EditorHostMode = 'auto' | 'mobile' | 'desktop';

export const EDITOR_FRONTEND_STORAGE_KEY = 'viewtube.editor.frontend-mode.v1';

export const EDITOR_FRONTEND_MODES = [
  {
    id: 'current-main' as const,
    label: 'Component Style',
    shortLabel: 'COMPONENT',
    description: 'Canonical ViewTube component-style editor with the light neo-brutalist shell, responsive mobile workspace, and mini timeline map.',
  },
  {
    id: 'linked-classic' as const,
    label: 'Classic Editor',
    shortLabel: 'CLASSIC',
    description: 'Classic direct VT_E1 host, backed by the same canonical VT_E1 editing engine.',
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
  if (queryValue === 'linked' || queryValue === 'linked-classic' || queryValue === 'classic') return 'linked-classic';
  if (queryValue === 'current' || queryValue === 'current-main' || queryValue === 'component' || queryValue === 'component-style') return 'current-main';
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
