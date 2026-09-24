import type { VtE1Project } from '../../shared/vtE1TimelineContract';

export type DesktopProjectRecord = VtE1Project & {
  schemaVersion?: string;
  contentBuildId?: string;
  legacyProjectId?: string;
  meta?: Record<string, unknown> & {
    durationSec?: number;
    aspectRatio?: string;
    contentBuildId?: string;
    legacyProjectId?: string;
  };
  tracks?: Array<Record<string, unknown> & {
    id: string;
    name?: string;
    kind?: string;
    muted?: boolean;
    locked?: boolean;
    visible?: boolean;
    order?: number;
    color?: string;
  }>;
  layers?: Array<Record<string, unknown>>;
  seamLinks?: Array<Record<string, unknown>>;
  durationSec?: number;
};

export type MobileBridgeTrack = {
  id: string;
  name: string;
  kind: 'video' | 'audio' | 'overlay' | 'caption';
  muted?: boolean;
  locked?: boolean;
  hidden?: boolean;
  order?: number;
  color?: string;
  desktopKind?: string;
  desktopVisible?: boolean;
};

export type MobileBridgeLayer = Record<string, unknown> & {
  id: string;
  trackId: string;
  type: string;
  visible?: boolean;
  payload: Record<string, unknown>;
};

export type MobileBridgeProject = VtE1Project & {
  tracks: MobileBridgeTrack[];
  layers?: MobileBridgeLayer[];
  durationSec: number;
  meta?: DesktopProjectRecord['meta'];
  seamLinks?: DesktopProjectRecord['seamLinks'];
  schemaVersion?: string;
  contentBuildId?: string;
  legacyProjectId?: string;
};

function finiteNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeMobileBridgeLayer(
  layer: Record<string, unknown>,
  index: number,
  fallbackTrackId: string,
): MobileBridgeLayer {
  return {
    ...layer,
    id: String(layer.id ?? `layer_${index}`),
    trackId: String(layer.trackId ?? fallbackTrackId),
    type: String(layer.type ?? 'media'),
    ...(typeof layer.visible === 'boolean' ? { visible: layer.visible } : {}),
    payload: isRecord(layer.payload) ? { ...layer.payload } : {},
  };
}

export function mobileTrackKindForDesktopTrack(kind: unknown, name?: unknown): MobileBridgeTrack['kind'] {
  const normalizedKind = String(kind ?? '').toLowerCase();
  const normalizedName = String(name ?? '').toLowerCase();

  if (normalizedKind === 'audio' || normalizedName.startsWith('a')) return 'audio';
  if (normalizedKind === 'caption' || normalizedName.includes('caption')) return 'caption';
  if (normalizedKind === 'overlay' || normalizedName.includes('overlay')) return 'overlay';
  return 'video';
}

export function desktopProjectToMobileBridgeProject(project: DesktopProjectRecord): MobileBridgeProject {
  const durationSec = finiteNumber(project.durationSec, finiteNumber(project.meta?.durationSec, 30));
  const tracks = Array.isArray(project.tracks)
    ? project.tracks.map((track, index): MobileBridgeTrack => ({
        id: String(track.id ?? `track_${index}`),
        name: String(track.name ?? `Track ${index + 1}`),
        kind: mobileTrackKindForDesktopTrack(track.kind, track.name),
        muted: Boolean(track.muted),
        locked: Boolean(track.locked),
        hidden: track.visible === false,
        order: Number.isFinite(Number(track.order)) ? Number(track.order) : undefined,
        color: typeof track.color === 'string' ? track.color : undefined,
        desktopKind: typeof track.kind === 'string' ? track.kind : undefined,
        desktopVisible: typeof track.visible === 'boolean' ? track.visible : undefined,
      }))
    : [];

  const fallbackLayerTrackId = tracks.find((track) => track.kind === 'overlay')?.id ?? tracks[0]?.id ?? 't_overlay';
  const layers = Array.isArray(project.layers)
    ? project.layers.map((layer, index) => normalizeMobileBridgeLayer(layer, index, fallbackLayerTrackId))
    : [];

  return {
    ...project,
    clips: Array.isArray(project.clips) ? project.clips : [],
    transitions: Array.isArray(project.transitions) ? project.transitions : [],
    tracks,
    layers,
    durationSec: Math.max(0.1, durationSec),
  } as MobileBridgeProject;
}

export function mobileBridgeProjectToDesktopProject(
  mobileProject: MobileBridgeProject,
  desktopFallback?: DesktopProjectRecord,
): DesktopProjectRecord {
  const fallback = desktopFallback ?? ({ clips: [] } as DesktopProjectRecord);
  const meta = {
    ...(fallback.meta ?? {}),
    ...(mobileProject.meta ?? {}),
    durationSec: finiteNumber(mobileProject.durationSec, finiteNumber(mobileProject.meta?.durationSec, finiteNumber(fallback.meta?.durationSec, 30))),
  };

  const fallbackTrackById = new Map((fallback.tracks ?? []).map((track) => [String(track.id), track]));
  const tracks = (mobileProject.tracks ?? []).map((track, index) => {
    const prior = fallbackTrackById.get(String(track.id));
    const visible = typeof track.hidden === 'boolean'
      ? !track.hidden
      : (track.desktopVisible ?? (typeof prior?.visible === 'boolean' ? prior.visible : true));

    return {
      ...(prior ?? {}),
      id: String(track.id ?? `track_${index}`),
      name: track.name ?? prior?.name ?? `Track ${index + 1}`,
      kind: track.desktopKind ?? prior?.kind ?? (track.kind === 'audio' ? 'audio' : 'visual'),
      muted: Boolean(track.muted),
      locked: Boolean(track.locked),
      visible,
      order: Number.isFinite(Number(track.order)) ? Number(track.order) : prior?.order,
      color: track.color ?? prior?.color,
    };
  });

  return {
    ...fallback,
    ...mobileProject,
    meta,
    tracks,
    layers: mobileProject.layers ?? fallback.layers ?? [],
    seamLinks: mobileProject.seamLinks ?? fallback.seamLinks ?? [],
    clips: Array.isArray(mobileProject.clips) ? mobileProject.clips : fallback.clips,
    transitions: Array.isArray(mobileProject.transitions) ? mobileProject.transitions : fallback.transitions,
  } as DesktopProjectRecord;
}

export function desktopProjectCanRoundTripThroughMobile(project: DesktopProjectRecord): boolean {
  if (!Array.isArray(project.clips)) return false;
  if (!Array.isArray(project.tracks)) return false;
  return project.clips.every((clip) =>
    typeof clip.id === 'string' &&
    typeof clip.trackId === 'string' &&
    Number.isFinite(Number(clip.start)) &&
    Number.isFinite(Number(clip.end)),
  );
}
