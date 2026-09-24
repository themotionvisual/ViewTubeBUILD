import type { VtE1Project } from '../../shared/vtE1TimelineContract';
import {
  readEditorProjectBridgeSnapshot,
  writeEditorProjectBridgeSnapshot,
  type EditorProjectBridgeSnapshot,
} from './editorProjectBridge';
import {
  desktopProjectCanRoundTripThroughMobile,
  desktopProjectToMobileBridgeProject,
  mobileBridgeProjectToDesktopProject,
  type DesktopProjectRecord,
  type MobileBridgeProject,
} from './editorDesktopProjectAdapter';

export interface DesktopBridgeRestoreResult {
  project: DesktopProjectRecord;
  source: 'desktop' | 'mobile' | 'fallback';
  updatedAt: number | null;
  applied: boolean;
}

function stableProjectValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableProjectValue);
  if (!value || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) return null;
    return value;
  }
  return Object.keys(value as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      const next = (value as Record<string, unknown>)[key];
      if (typeof next !== 'undefined') result[key] = stableProjectValue(next);
      return result;
    }, {});
}

export function editorProjectFingerprint(project: VtE1Project | null | undefined): string {
  if (!project) return '';
  return JSON.stringify(stableProjectValue(project));
}

export function publishDesktopProjectToBridge(
  project: DesktopProjectRecord,
  updatedAt = Date.now(),
): EditorProjectBridgeSnapshot | null {
  if (!desktopProjectCanRoundTripThroughMobile(project)) return null;
  return writeEditorProjectBridgeSnapshot('desktop', project, updatedAt);
}

export function restoreDesktopProjectFromSnapshot(
  snapshot: EditorProjectBridgeSnapshot | null,
  fallback: DesktopProjectRecord,
): DesktopBridgeRestoreResult {
  if (!snapshot) {
    return { project: fallback, source: 'fallback', updatedAt: null, applied: false };
  }

  if (snapshot.source === 'desktop') {
    const project = snapshot.project as DesktopProjectRecord;
    if (!desktopProjectCanRoundTripThroughMobile(project)) {
      return { project: fallback, source: 'fallback', updatedAt: snapshot.updatedAt, applied: false };
    }
    return { project, source: 'desktop', updatedAt: snapshot.updatedAt, applied: true };
  }

  const mobileProject = snapshot.project as MobileBridgeProject;
  const project = mobileBridgeProjectToDesktopProject(mobileProject, fallback);
  if (!desktopProjectCanRoundTripThroughMobile(project)) {
    return { project: fallback, source: 'fallback', updatedAt: snapshot.updatedAt, applied: false };
  }

  return { project, source: 'mobile', updatedAt: snapshot.updatedAt, applied: true };
}

export function readDesktopProjectFromBridge(fallback: DesktopProjectRecord): DesktopBridgeRestoreResult {
  return restoreDesktopProjectFromSnapshot(readEditorProjectBridgeSnapshot(), fallback);
}

export function mobileSeedFromBridgeSnapshot(
  snapshot: EditorProjectBridgeSnapshot | null,
): MobileBridgeProject | undefined {
  if (!snapshot) return undefined;
  if (snapshot.source === 'desktop') {
    const desktopProject = snapshot.project as DesktopProjectRecord;
    if (!desktopProjectCanRoundTripThroughMobile(desktopProject)) return undefined;
    return desktopProjectToMobileBridgeProject(desktopProject);
  }
  return snapshot.project as MobileBridgeProject;
}

export function shouldApplyBridgeProject(
  currentProject: VtE1Project,
  incomingSnapshot: EditorProjectBridgeSnapshot | null,
  lastAppliedUpdatedAt = 0,
): boolean {
  if (!incomingSnapshot) return false;
  if (incomingSnapshot.updatedAt <= lastAppliedUpdatedAt) return false;
  return editorProjectFingerprint(currentProject) !== editorProjectFingerprint(incomingSnapshot.project);
}
