export type TrackKind = "video" | "image" | "text" | "audio" | "effects";

export type TrackViewportState = "normal" | "tapered" | "collapsed-thread";

export type EasingType = "linear" | "easeIn" | "easeOut" | "easeInOut" | "spring" | "bezier";

export interface EditorTrack {
  id: string;
  name: string;
  kind: TrackKind;
  index: number;
  collapsed?: boolean;
  viewportState?: TrackViewportState;
}

export type EffectType =
  | "brightness"
  | "contrast"
  | "saturate"
  | "hueRotate"
  | "blur"
  | "grayscale"
  | "sepia"
  | "invert";

export interface EditorEffect {
  id: string;
  type: EffectType;
  value: number;
  enabled: boolean;
}

export interface KeyframeValue {
  x?: number;
  y?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  opacity?: number;
  blur?: number;
  hue?: number;
  sat?: number;
  bri?: number;
}

export interface EditorKeyframe {
  id: string;
  clipId: string;
  frame: number;
  easing: EasingType;
  value: KeyframeValue;
}

export type TransitionType = "none" | "crossfade" | "wipe" | "slide" | "flip";

export interface EditorTransition {
  id: string;
  fromClipId: string;
  toClipId: string;
  type: TransitionType;
  durationInFrames: number;
}

export interface EditorClip {
  id: string;
  trackId: string;
  kind: TrackKind;
  sourceId: string;
  title: string;
  color: string;
  startFrame: number;
  endFrame: number;
  speed: number;
  volume?: number;
  muted?: boolean;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  text?: string;
  clipType?: "media" | "text" | "shape";
  mediaUrl?: string;
  groupedWithNext: boolean;
  keyframeIds: string[];
  effectIds: string[];
}

export interface PointerActionState {
  kind: "move" | "trim-start" | "trim-end" | "keyframe";
  clipId: string;
  startFrame: number;
  initialTrackId?: string;
}

export interface TimelineState {
  fps: number;
  tracks: EditorTrack[];
  clips: EditorClip[];
  keyframes: EditorKeyframe[];
  transitions: EditorTransition[];
  effects: EditorEffect[];
  selectedClipId: string | null;
  playheadFrame: number;
  zoom: number;
  snapping: boolean;
  snapStepFrames: number;
  history: TimelineCommand[];
  past: Omit<TimelineState, "history" | "past" | "future">[];
  future: Omit<TimelineState, "history" | "past" | "future">[];
  pointerAction: PointerActionState | null;
}

export interface CompositionBinding {
  compositionId: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export type RenderFormat =
  | "mp4"
  | "mov"
  | "wav"
  | "svg"
  | "gif"
  | "png-sequence"
  | "json"
  | "html";

export interface RenderPreset {
  id: string;
  label: string;
  format: RenderFormat;
  width: number;
  height: number;
  fps: number;
}

export interface RenderRequest {
  format: RenderFormat;
  presetId: string;
  includeAudio?: boolean;
}

export interface LaunchEditorProjectV1 {
  version: "LaunchEditorProjectV1";
  exportedAt: string;
  timeline: {
    fps: number;
    playheadFrame: number;
    zoom: number;
    snapping: boolean;
    tracks: TimelineState["tracks"];
    clips: TimelineState["clips"];
    keyframes: TimelineState["keyframes"];
    transitions: TimelineState["transitions"];
  };
  exportMeta?: {
    aspect: "16:9" | "9:16";
    resolutionProfile: "720" | "1080" | "1k" | "2k" | "4k";
  };
}

export interface RenderJobRequest {
  projectId: string;
  format: "mp4" | "mov";
  resolutionProfile: "720" | "1080" | "1k" | "2k" | "4k";
  aspect: "16:9" | "9:16";
  compositionSpec: {
    fps: number;
    width: number;
    height: number;
    durationInFrames: number;
  };
}

export interface RenderJobStatus {
  jobId: string;
  status: "queued" | "rendering" | "done" | "failed";
  progress?: number;
  outputUrl?: string;
  error?: string;
}

export interface TemplatePresetV1 {
  id: string;
  name: string;
  clips: Array<{
    kind: "text" | "shape";
    title: string;
    text?: string;
    color: string;
    startOffsetFrames: number;
    durationFrames: number;
    x?: number;
    y?: number;
    scale?: number;
    opacity?: number;
  }>;
}

export interface ExportArtifact {
  id: string;
  format: RenderFormat;
  filename: string;
  mimeType: string;
  status: "queued" | "ready" | "failed";
  downloadUrl?: string;
}

export interface ExportJob {
  id: string;
  request: RenderRequest;
  status: "queued" | "processing" | "completed" | "failed";
  createdAt: string;
  artifacts: ExportArtifact[];
}

export type TimelinePatchOp =
  | { op: "insertClip"; clip: EditorClip }
  | { op: "moveClip"; clipId: string; trackId: string; startFrame: number; endFrame: number }
  | { op: "trimClip"; clipId: string; side: "left" | "right"; frame: number }
  | { op: "splitClip"; clipId: string; frame: number; newClipId: string }
  | { op: "deleteClip"; clipId: string }
  | { op: "setTransition"; transition: EditorTransition }
  | { op: "setKeyframe"; keyframe: EditorKeyframe }
  | { op: "setClipColor"; clipId: string; color: string };

export interface AIPatchPlan {
  reason: string;
  operations: TimelinePatchOp[];
}

export interface AIPatchValidationResult {
  valid: boolean;
  issues: string[];
}

export type TimelineCommand =
  | { type: "insertClip"; clip: EditorClip }
  | { type: "moveClip"; clipId: string; trackId: string; startFrame: number; endFrame: number }
  | { type: "trimClipStart"; clipId: string; startFrame: number }
  | { type: "trimClipEnd"; clipId: string; endFrame: number }
  | { type: "splitClip"; clipId: string; frame: number; newClipId: string }
  | { type: "deleteClip"; clipId: string }
  | { type: "arrowCut"; clipId: string; frame: number; deleteSide: "none" | "left" | "right" }
  | { type: "groupSeam"; clipId: string; enabled: boolean }
  | { type: "setTransition"; transition: EditorTransition }
  | { type: "setKeyframe"; keyframe: EditorKeyframe }
  | { type: "removeKeyframe"; keyframeId: string }
  | { type: "setPlayhead"; frame: number }
  | { type: "setZoom"; zoom: number }
  | { type: "setSnapping"; enabled: boolean }
  | { type: "setSnapStep"; frames: number }
  | { type: "selectClip"; clipId: string | null }
  | { type: "setClipColor"; clipId: string; color: string }
  | { type: "setClipSpeed"; clipId: string; speed: number }
  | {
      type: "setClipProps";
      clipId: string;
      props: Partial<
        Pick<
          EditorClip,
          | "title"
          | "text"
          | "x"
          | "y"
          | "scale"
          | "rotation"
          | "opacity"
          | "volume"
          | "muted"
          | "color"
        >
      >;
    }
  | { type: "setTrackViewportState"; trackId: string; viewportState: TrackViewportState }
  | { type: "beginPointerAction"; action: PointerActionState }
  | { type: "cancelPointerAction" }
  | { type: "commitPointerAction" }
  | { type: "undo" }
  | { type: "redo" };

export interface EditorProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineState;
  binding: CompositionBinding;
  renderPresets: RenderPreset[];
}

export interface MediaMetadata {
  durationInFrames?: number;
  width?: number;
  height?: number;
  sizeBytes: number;
  mimeType: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  kind: TrackKind;
  sourceUrl: string;
  metadata: MediaMetadata;
}

export interface ImportRequest {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ImportResult {
  accepted: boolean;
  reason?: string;
  kind?: TrackKind;
}

export interface MediaProviderAdapter {
  upload: (file: File) => Promise<MediaAsset>;
  importFromUrl: (url: string) => Promise<MediaAsset>;
  search?: (query: string) => Promise<MediaAsset[]>;
  resolveMetadata?: (asset: MediaAsset) => Promise<MediaMetadata>;
  sanitizeSvg?: (svgText: string) => string;
}

export interface AIProviderAdapter {
  promptToPatch: (input: { prompt: string; state: TimelineState }) => Promise<AIPatchPlan>;
}

export interface TTSProviderAdapter {
  textToAudio: (input: { text: string; voice?: string }) => Promise<MediaAsset>;
}

export interface FeatureRegistryEntry {
  featureName: string;
  canonicalSource: string;
  status: "implemented" | "deferred";
  ownerModule: string;
}
