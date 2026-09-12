import type { VtE1Project } from '../../shared/vtE1TimelineContract';

export const EDITOR_PROJECT_BRIDGE_STORAGE_KEY = 'viewtube.editor.project-bridge.v1';
export const EDITOR_PROJECT_BRIDGE_EVENT = 'viewtube:editor-project-bridge';
export const EDITOR_PROJECT_BRIDGE_VERSION = 1 as const;

export type EditorProjectBridgeSource = 'mobile' | 'desktop';

export interface EditorProjectBridgeSnapshot {
  version: typeof EDITOR_PROJECT_BRIDGE_VERSION;
  source: EditorProjectBridgeSource;
  updatedAt: number;
  project: VtE1Project;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeEditorProjectBridgeSnapshot(value: unknown): EditorProjectBridgeSnapshot | null {
  if (!isRecord(value)) return null;
  if (value.version !== EDITOR_PROJECT_BRIDGE_VERSION) return null;
  if (value.source !== 'mobile' && value.source !== 'desktop') return null;
  if (typeof value.updatedAt !== 'number' || !Number.isFinite(value.updatedAt)) return null;
  if (!isRecord(value.project) || !Array.isArray(value.project.clips)) return null;

  return {
    version: EDITOR_PROJECT_BRIDGE_VERSION,
    source: value.source,
    updatedAt: value.updatedAt,
    project: value.project as VtE1Project,
  };
}

export function parseEditorProjectBridgeSnapshot(raw: string | null): EditorProjectBridgeSnapshot | null {
  if (!raw) return null;
  try {
    return normalizeEditorProjectBridgeSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function readEditorProjectBridgeSnapshot(): EditorProjectBridgeSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseEditorProjectBridgeSnapshot(window.localStorage.getItem(EDITOR_PROJECT_BRIDGE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeEditorProjectBridgeSnapshot(
  source: EditorProjectBridgeSource,
  project: VtE1Project,
  updatedAt = Date.now(),
): EditorProjectBridgeSnapshot {
  const snapshot: EditorProjectBridgeSnapshot = {
    version: EDITOR_PROJECT_BRIDGE_VERSION,
    source,
    updatedAt,
    project,
  };

  if (typeof window === 'undefined') return snapshot;

  try {
    window.localStorage.setItem(EDITOR_PROJECT_BRIDGE_STORAGE_KEY, JSON.stringify(snapshot));
    window.dispatchEvent(new CustomEvent<EditorProjectBridgeSnapshot>(EDITOR_PROJECT_BRIDGE_EVENT, { detail: snapshot }));
  } catch {
    // Storage/event delivery can be blocked by privacy settings. The caller's
    // in-memory editor state remains authoritative for the current session.
  }

  return snapshot;
}

export function clearEditorProjectBridgeSnapshot(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(EDITOR_PROJECT_BRIDGE_STORAGE_KEY);
  } catch {
    // Best-effort cleanup only.
  }
}

export function subscribeEditorProjectBridge(
  listener: (snapshot: EditorProjectBridgeSnapshot) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const onBridgeEvent = (event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail;
    const snapshot = normalizeEditorProjectBridgeSnapshot(detail);
    if (snapshot) listener(snapshot);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== EDITOR_PROJECT_BRIDGE_STORAGE_KEY) return;
    const snapshot = parseEditorProjectBridgeSnapshot(event.newValue);
    if (snapshot) listener(snapshot);
  };

  window.addEventListener(EDITOR_PROJECT_BRIDGE_EVENT, onBridgeEvent);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EDITOR_PROJECT_BRIDGE_EVENT, onBridgeEvent);
    window.removeEventListener('storage', onStorage);
  };
}
