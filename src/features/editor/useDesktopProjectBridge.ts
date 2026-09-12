import { useEffect, useRef } from 'react';
import type { VtE1Project } from '../../shared/vtE1TimelineContract';
import {
  readEditorProjectBridgeSnapshot,
  subscribeEditorProjectBridge,
  type EditorProjectBridgeSnapshot,
} from './editorProjectBridge';
import {
  editorProjectFingerprint,
  publishDesktopProjectToBridge,
  restoreDesktopProjectFromSnapshot,
  shouldApplyBridgeProject,
} from './editorDesktopBridgeRuntime';
import type { DesktopProjectRecord } from './editorDesktopProjectAdapter';

export interface DesktopProjectBridgeHookOptions<TProject extends DesktopProjectRecord = DesktopProjectRecord> {
  project: TProject;
  setProject: (next: TProject | ((current: TProject) => TProject)) => void;
  normalizeProject?: (project: DesktopProjectRecord) => TProject;
  publishDelayMs?: number;
  onBeforeApply?: (snapshot: EditorProjectBridgeSnapshot, current: TProject) => void;
  onApplied?: (snapshot: EditorProjectBridgeSnapshot, next: TProject) => void;
}

/**
 * Small state-boundary hook for canonical VT_E1.
 *
 * Ownership rules:
 * - VT_E1 remains authoritative while the desktop host is active.
 * - Desktop changes are published to the shared versioned bridge.
 * - Only newer MOBILE snapshots are applied back into VT_E1.
 * - Applying a mobile snapshot preserves desktop-only fields by merging through
 *   the explicit desktop/mobile project adapter.
 * - The delayed publisher prevents the initial desktop render from overwriting
 *   a mobile snapshot before the restore effect has had a chance to apply it.
 *
 * This hook intentionally does not own timeline/history/UI state. VT_E1 keeps
 * those systems; the bridge only synchronizes the canonical project document.
 */
export function useDesktopProjectBridge<TProject extends DesktopProjectRecord = DesktopProjectRecord>({
  project,
  setProject,
  normalizeProject,
  publishDelayMs = 120,
  onBeforeApply,
  onApplied,
}: DesktopProjectBridgeHookOptions<TProject>): void {
  const projectRef = useRef(project);
  const lastAppliedUpdatedAtRef = useRef(0);
  const lastPublishedFingerprintRef = useRef('');

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const applySnapshotRef = useRef<(snapshot: EditorProjectBridgeSnapshot | null) => void>(() => undefined);
  applySnapshotRef.current = (snapshot) => {
    if (!snapshot || snapshot.source !== 'mobile') return;
    const current = projectRef.current;
    if (!shouldApplyBridgeProject(current as VtE1Project, snapshot, lastAppliedUpdatedAtRef.current)) return;

    const restored = restoreDesktopProjectFromSnapshot(snapshot, current);
    if (!restored.applied || restored.source !== 'mobile') return;

    const next = normalizeProject
      ? normalizeProject(restored.project)
      : restored.project as TProject;

    onBeforeApply?.(snapshot, current);
    lastAppliedUpdatedAtRef.current = snapshot.updatedAt;
    lastPublishedFingerprintRef.current = editorProjectFingerprint(next as VtE1Project);
    projectRef.current = next;
    setProject(next);
    onApplied?.(snapshot, next);
  };

  useEffect(() => {
    applySnapshotRef.current(readEditorProjectBridgeSnapshot());
    return subscribeEditorProjectBridge((snapshot) => applySnapshotRef.current(snapshot));
  }, []);

  useEffect(() => {
    const fingerprint = editorProjectFingerprint(project as VtE1Project);
    if (!fingerprint || fingerprint === lastPublishedFingerprintRef.current) return undefined;

    const timer = window.setTimeout(() => {
      // A restore may have replaced projectRef.current since this effect began.
      const latest = projectRef.current;
      const latestFingerprint = editorProjectFingerprint(latest as VtE1Project);
      if (!latestFingerprint || latestFingerprint === lastPublishedFingerprintRef.current) return;
      const snapshot = publishDesktopProjectToBridge(latest);
      if (snapshot) {
        lastPublishedFingerprintRef.current = latestFingerprint;
        lastAppliedUpdatedAtRef.current = Math.max(lastAppliedUpdatedAtRef.current, snapshot.updatedAt);
      }
    }, Math.max(0, publishDelayMs));

    return () => window.clearTimeout(timer);
  }, [project, publishDelayMs]);
}
