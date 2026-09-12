export type EditorFrontendMode = 'current-main' | 'linked-classic';

export const EDITOR_FRONTEND_STORAGE_KEY = 'viewtube.editor.frontend-mode.v1';

export const EDITOR_FRONTEND_MODES = [
  {
    id: 'current-main' as const,
    label: 'Current Main',
    shortLabel: 'CURRENT',
    description: 'Current ViewTube editor host. Uses the responsive mobile/desktop shell from main.',
  },
  {
    id: 'linked-classic' as const,
    label: 'Linked Branch',
    shortLabel: 'LINKED',
    description: 'Classic VT_E1 host used by the linked Vercel editor deployment. Keeps the same current editor engine and project state.',
  },
] as const;

export function normalizeEditorFrontendMode(value: unknown): EditorFrontendMode {
  return value === 'linked-classic' ? 'linked-classic' : 'current-main';
}

export function readEditorFrontendMode(): EditorFrontendMode {
  if (typeof window === 'undefined') return 'current-main';
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('editorStyle');
    if (fromQuery === 'linked' || fromQuery === 'linked-classic') return 'linked-classic';
    if (fromQuery === 'current' || fromQuery === 'current-main') return 'current-main';
    return normalizeEditorFrontendMode(window.localStorage.getItem(EDITOR_FRONTEND_STORAGE_KEY));
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
