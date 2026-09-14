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

export function editorProjectFingerprint(project: VtE1Project | null | undefined): string {
  if (!project) return '';
  const clips = Array.isArray(project.clips)
    ? project.clips.map((clip) => [clip.id, clip.trackId, clip.start, clip.end, clip.sourceInSec, clip.sourceOutSec])
    : [];
  const transitions = Array.isArray(project.transitions)
    ? project.transitions.map((transition) => [
        transition.leftClipId,
        transition.rightClipId,
        transition.durationSec,
        transition.nominalSeamSec,
      ])
    : [];
  const record = project as DesktopProjectRecord;
  const tracks = Array.isArray(record.tracks)
    ? record.tracks.map((track) => [track.id, track.kind, track.muted, track.locked, track.visible])
    : [];
  const duration = Number(record.durationSec ?? record.meta?.durationSec ?? 0);
  return JSON.stringify({ clips, transitions, tracks, duration });
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
