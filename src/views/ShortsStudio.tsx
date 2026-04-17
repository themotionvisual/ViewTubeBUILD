import React, { useEffect, useMemo, useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { removeBackground } from "@imgly/background-removal";
import {
  Captions,
  Eye,
  EyeOff,
  Film,
  Loader2,
  Music,
  Pause,
  Play,
  Type,
  UploadCloud,
  Wand2,
  Workflow,
  Boxes,
  ShieldCheck,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { useBrain } from "../context/GlobalDataContext";
import {
  createEditorEngineState,
  findAdjacentClipOnTrack,
  type EditorEngineState,
  type EditorTimelineClip,
  type EditorTimelineCommand,
  type EditorTrackId,
  reduceEditorCommand,
  replayTimelineCommands,
} from "../services/editorEngine";
import {
  buildPreviewRender,
  type FinalRenderRequest,
  type PreviewRenderRequest,
  type RemotionBindingConfig,
  timelineToRemotionCompiler,
} from "../services/timelineToRemotionCompiler";
import { buildRemotionParityReport } from "../services/remotionParity";

export type EditorLayoutMode = "vertical" | "landscape";
export type EditorTabId =
  | "media"
  | "ai"
  | "text"
  | "transitions"
  | "motion"
  | "audio"
  | "captions"
  | "extensions";

type TimelineApplyMode = "insert" | "replace" | "append";
type TimelineApplyTarget =
  | "selectedClip"
  | "selectedTrack"
  | "newTrack"
  | "range";

export interface AIGenerateDraftRequest {
  prompt: string;
  activeTab: EditorTabId;
  selectedClipId: string | null;
  layoutMode: EditorLayoutMode;
}

interface DraftArtifact {
  id: string;
  type: "text" | "image" | "transition" | "audio" | "caption" | "motion";
  title: string;
  preview: string;
}

interface TimelinePatchPreview {
  op: TimelineApplyMode;
  description: string;
  proposedClip: Partial<Layer>;
}

export interface AIGenerateDraftResponse {
  draftArtifacts: DraftArtifact[];
  timelinePatchPreview: TimelinePatchPreview[];
  confidence: number;
  warnings: string[];
}

export interface TimelineApplyRequest {
  mode: TimelineApplyMode;
  target: TimelineApplyTarget;
}

type ExtensionProviderStatus =
  | "locked"
  | "key-connected"
  | "plan-connected"
  | "error"
  | "ready";

export interface ExtensionProviderConfig {
  providerId: string;
  authMode: "apiKey" | "plan";
  status: ExtensionProviderStatus;
  capabilities: EditorTabId[];
  apiKeyInput?: string;
  error?: string;
}

export interface StyleBoundaryPolicy {
  uiThemeId: "neo-brutalist" | "classic";
  renderPresetId: "clean" | "cinematic" | "neo";
  allowCrossMapping: boolean;
}

interface UIStyleLayer {
  themeId: StyleBoundaryPolicy["uiThemeId"];
}

interface RenderStyleLayer {
  presetId: StyleBoundaryPolicy["renderPresetId"];
}

interface Keyframe {
  time: number;
  props: Partial<AnimatableLayerProps>;
}

interface Layer {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  trackId: "media" | "text" | "audio" | "effects";
  color: string;
  speed: number;
  start: number;
  end: number;
  isVisible: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  hsb: { hue: number; sat: number; bri: number };
  blur: number;
  hasBgRemoved: boolean;
  bgRemovedUrl?: string;
  keyframes: Keyframe[];
}
type AnimatableLayerProps = Omit<Layer, "id" | "name" | "url" | "isVisible" | "keyframes" | "type">;

interface TabSpec {
  id: EditorTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const TAB_REGISTRY: TabSpec[] = [
  { id: "media", label: "Media", icon: Film },
  { id: "ai", label: "AI", icon: Wand2 },
  { id: "text", label: "Text", icon: Type },
  { id: "transitions", label: "Transitions", icon: Workflow },
  { id: "motion", label: "Motion", icon: Boxes },
  { id: "audio", label: "Audio", icon: Music },
  { id: "captions", label: "Captions", icon: Captions },
  { id: "extensions", label: "Extensions", icon: ExternalLink },
];

const INITIAL_PROVIDERS: ExtensionProviderConfig[] = [
  {
    providerId: "elevenlabs",
    authMode: "apiKey",
    status: "locked",
    capabilities: ["audio", "captions"],
    apiKeyInput: "",
  },
  {
    providerId: "auphonic",
    authMode: "apiKey",
    status: "locked",
    capabilities: ["audio"],
    apiKeyInput: "",
  },
  {
    providerId: "pexels",
    authMode: "apiKey",
    status: "locked",
    capabilities: ["media"],
    apiKeyInput: "",
  },
  {
    providerId: "gemini-flow",
    authMode: "plan",
    status: "locked",
    capabilities: ["ai", "motion", "transitions"],
  },
];

const inferLayoutMode = (
  aspectRatio: "9:16" | "16:9",
  override: "auto" | EditorLayoutMode,
): EditorLayoutMode => {
  if (override !== "auto") return override;
  return aspectRatio === "9:16" ? "vertical" : "landscape";
};

const EditorLayoutEngine = {
  resolveMode: inferLayoutMode,
  templates: {
    vertical: "right-side-player",
    landscape: "wide-canvas-full-timeline",
  },
} as const;

const buildAIDraft = (request: AIGenerateDraftRequest): AIGenerateDraftResponse => {
  const artifact: DraftArtifact = {
    id: `draft-${Date.now()}`,
    type:
      request.activeTab === "audio"
        ? "audio"
        : request.activeTab === "captions"
          ? "caption"
          : request.activeTab === "transitions"
            ? "transition"
            : request.activeTab === "motion"
              ? "motion"
              : request.activeTab === "text"
                ? "text"
                : "image",
    title: `AI Draft for ${request.activeTab.toUpperCase()}`,
    preview: request.prompt,
  };

  return {
    draftArtifacts: [artifact],
    timelinePatchPreview: [
      {
        op: "insert",
        description: `Insert generated ${artifact.type} clip in ${request.activeTab}`,
        proposedClip: {
          name: `AI ${request.activeTab.toUpperCase()}`,
          type: "image",
          url:
            "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
          trackId: request.activeTab === "audio" ? "audio" : "media",
          zIndex: 100,
          opacity: 1,
          hsb: { hue: 0, sat: 100, bri: 100 },
          blur: 0,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          width: request.layoutMode === "vertical" ? 400 : 1000,
          height: request.layoutMode === "vertical" ? 711 : 562,
        },
      },
    ],
    confidence: 0.84,
    warnings: request.selectedClipId
      ? []
      : ["No selected clip. Apply target fallback will be used."],
  };
};

export const ShortsStudio = () => {
  const { addProject } = useBrain();
  const projectId = new URLSearchParams(window.location.search).get("projectId") || "default";
  const layoutStorageKey = `vt_editor_layout_override:${projectId}`;
  const layerRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

  const [isMainToolOpen, setIsMainToolOpen] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [layoutOverride, setLayoutOverride] = useState<"auto" | EditorLayoutMode>(() => {
    const saved = window.localStorage.getItem(layoutStorageKey);
    return saved === "auto" || saved === "vertical" || saved === "landscape" ? saved : "auto";
  });
  const layoutMode = EditorLayoutEngine.resolveMode(aspectRatio, layoutOverride);

  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<EditorTabId>("media");

  const [styleBoundaryPolicy, setStyleBoundaryPolicy] = useState<StyleBoundaryPolicy>({
    uiThemeId: "neo-brutalist",
    renderPresetId: "clean",
    allowCrossMapping: false,
  });
  const uiStyleLayer: UIStyleLayer = { themeId: styleBoundaryPolicy.uiThemeId };
  const renderStyleLayer: RenderStyleLayer = { presetId: styleBoundaryPolicy.renderPresetId };

  const setAndPersistLayoutOverride = (next: "auto" | EditorLayoutMode) => {
    setLayoutOverride(next);
    window.localStorage.setItem(layoutStorageKey, next);
  };

  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "1",
      name: "Base Atmosphere",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      type: "image",
      trackId: "media",
      color: "#24D3FF",
      speed: 1,
      start: 0,
      end: 8,
      isVisible: true,
      x: 0,
      y: 0,
      scale: 1.1,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      hsb: { hue: 0, sat: 100, bri: 100 },
      blur: 0,
      width: 400,
      height: 711,
      hasBgRemoved: false,
      keyframes: [],
    },
    {
      id: "2",
      name: "Foreground Subject",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
      type: "image",
      trackId: "media",
      color: "#FF7497",
      speed: 1,
      start: 2,
      end: 16,
      isVisible: true,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      hsb: { hue: 0, sat: 100, bri: 100 },
      blur: 0,
      width: 400,
      height: 711,
      hasBgRemoved: false,
      keyframes: [],
    },
  ]);
  const [engineState, setEngineState] = useState<EditorEngineState>(() => {
    const seedClips: EditorTimelineClip[] = [
      {
        id: "clip-1",
        layerId: "1",
        trackId: "media",
        start: 0,
        end: 8,
        color: "#24D3FF",
        speed: 1,
        keyframes: [],
        groupWithNext: true,
        transitionToNext: { type: "crossfade", duration: 0.35 },
      },
      {
        id: "clip-2",
        layerId: "2",
        trackId: "media",
        start: 2,
        end: 16,
        color: "#FF7497",
        speed: 1,
        keyframes: [],
        groupWithNext: false,
      },
    ];
    return createEditorEngineState(seedClips);
  });
  const timelineDurationSec = 180;
  const timelinePixelsPerSecond = 80;
  const [timelineGuideSec, setTimelineGuideSec] = useState(0);
  const [timelineCursorMode, setTimelineCursorMode] = useState<"default" | "trim" | "drag">(
    "default",
  );
  const [timelineContext, setTimelineContext] = useState<{
    open: boolean;
    x: number;
    y: number;
    clipId: string | null;
    trackId: EditorTrackId | null;
    at: number;
  }>({
    open: false,
    x: 0,
    y: 0,
    clipId: null,
    trackId: null,
    at: 0,
  });
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStateRef = useRef<{
    clipId: string;
    mode: "move" | "trimStart" | "trimEnd";
    startX: number;
    originStart: number;
    originEnd: number;
    originTrackId: EditorTrackId;
  } | null>(null);
  const arrowStateRef = useRef({
    down: false,
    left: false,
    right: false,
  });

  const [providers, setProviders] = useState<ExtensionProviderConfig[]>(INITIAL_PROVIDERS);
  const [activeLayerId, setActiveLayerId] = useState<string | null>("2");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDraftResponse, setAiDraftResponse] = useState<AIGenerateDraftResponse | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [timelineApplyRequest, setTimelineApplyRequest] = useState<TimelineApplyRequest>({
    mode: "insert",
    target: "selectedClip",
  });

  const remotionBindingConfig: RemotionBindingConfig = useMemo(
    () => ({
      compositionId: "viewtube-shorts-main",
      fps: 30,
      width: aspectRatio === "9:16" ? 1080 : 1920,
      height: aspectRatio === "9:16" ? 1920 : 1080,
      durationStrategy: "fitToContent",
      qualityProfile: "preview",
    }),
    [aspectRatio],
  );

  const remotionComposition = useMemo(
    () => timelineToRemotionCompiler.compile(engineState, remotionBindingConfig),
    [engineState, remotionBindingConfig],
  );

  const remotionParityReport = useMemo(
    () => buildRemotionParityReport(engineState, remotionComposition),
    [engineState, remotionComposition],
  );

  const previewRenderRequest: PreviewRenderRequest = useMemo(
    () => ({
      snapshotId: engineState.snapshotId,
      compileVersion: engineState.compileVersion,
      bindingConfig: remotionBindingConfig,
    }),
    [engineState.compileVersion, engineState.snapshotId, remotionBindingConfig],
  );

  const finalRenderRequest: FinalRenderRequest = useMemo(
    () => ({
      ...previewRenderRequest,
      exportFormat: "mp4",
      qualityPreset: "high",
    }),
    [previewRenderRequest],
  );

  const previewRender = useMemo(
    () => buildPreviewRender(engineState, previewRenderRequest),
    [engineState, previewRenderRequest],
  );

  const dispatchTimelineCommand = (command: EditorTimelineCommand) => {
    setEngineState((prev) => reduceEditorCommand(prev, command));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") arrowStateRef.current.down = true;
      if (event.key === "ArrowLeft") arrowStateRef.current.left = true;
      if (event.key === "ArrowRight") arrowStateRef.current.right = true;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        dispatchTimelineCommand({ type: event.shiftKey ? "redo" : "undo" });
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") arrowStateRef.current.down = false;
      if (event.key === "ArrowLeft") arrowStateRef.current.left = false;
      if (event.key === "ArrowRight") arrowStateRef.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    let frameRef = 0;
    let lastTime = performance.now();
    const animate = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTime) / 1000;
        setCurrentTime((prev) => {
          const maxSeconds = remotionComposition.durationInFrames / remotionBindingConfig.fps;
          if (prev + delta >= maxSeconds) {
            setIsPlaying(false);
            return maxSeconds;
          }
          return prev + delta;
        });
      }
      lastTime = now;
      frameRef = window.requestAnimationFrame(animate);
    };
    frameRef = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameRef);
  }, [isPlaying, remotionBindingConfig.fps, remotionComposition.durationInFrames]);

  useEffect(() => {
    setLayers((prev) =>
      prev.map((layer) => {
        const clip = engineState.clips.find((item) => item.layerId === layer.id);
        if (!clip) return { ...layer, isVisible: false };
        return {
          ...layer,
          trackId: clip.trackId,
          color: clip.color,
          speed: clip.speed,
          start: clip.start,
          end: clip.end,
          isVisible: true,
          keyframes: clip.keyframes.map((keyframe) => ({
            time: keyframe.time,
            props: keyframe.props,
          })),
        };
      }),
    );
  }, [engineState.clips]);

  const addLayer = (name: string, url: string, trackId: Layer["trackId"] = "media") => {
    const topZ = Math.max(...layers.map((l) => l.zIndex), 0);
    const newLayer: Layer = {
      id: Math.random().toString(36).slice(2, 9),
      name,
      url,
      type: "image",
      trackId,
      color: "#CCFF00",
      speed: 1,
      start: currentTime,
      end: currentTime + 6,
      isVisible: true,
      width: aspectRatio === "9:16" ? 400 : 1000,
      height: aspectRatio === "9:16" ? 711 : 562,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      zIndex: topZ + 1,
      hsb: { hue: 0, sat: 100, bri: 100 },
      blur: 0,
      hasBgRemoved: false,
      keyframes: [],
    };
    setLayers((prev) => [newLayer, ...prev]);
    dispatchTimelineCommand({
      type: "insertClip",
      clip: {
        id: `clip-${newLayer.id}`,
        layerId: newLayer.id,
        trackId,
        start: newLayer.start,
        end: newLayer.end,
        color: newLayer.color,
        speed: newLayer.speed,
        keyframes: [],
        groupWithNext: false,
      },
    });
    setActiveLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const moveLayer = (id: string, direction: "up" | "down") => {
    const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);
    const idx = sorted.findIndex((l) => l.id === id);
    if (idx < 0) return;

    if (direction === "up" && idx > 0) {
      const temp = sorted[idx].zIndex;
      sorted[idx].zIndex = sorted[idx - 1].zIndex;
      sorted[idx - 1].zIndex = temp;
    } else if (direction === "down" && idx < sorted.length - 1) {
      const temp = sorted[idx].zIndex;
      sorted[idx].zIndex = sorted[idx + 1].zIndex;
      sorted[idx + 1].zIndex = temp;
    }

    setLayers([...sorted]);
  };

  const handleBgRemove = async (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    setIsRemovingBg(layerId);
    try {
      const blob = await fetch(layer.url).then((r) => r.blob());
      const removedBgBlob = await removeBackground(blob);
      const removedBgUrl = URL.createObjectURL(removedBgBlob);
      updateLayer(layerId, { hasBgRemoved: true, bgRemovedUrl: removedBgUrl });
    } catch (e) {
      console.error("Background removal failed", e);
      alert("Background removal failed. Please check the console.");
    } finally {
      setIsRemovingBg(null);
    }
  };

  const getInterpolatedProps = (layer: Layer) => {
    if (layer.keyframes.length === 0) return layer;

    const sortedKeyframes = [...layer.keyframes].sort((a, b) => a.time - b.time);
    let startFrame = sortedKeyframes.find((k) => k.time <= currentTime) || sortedKeyframes[0];
    let endFrame =
      sortedKeyframes.find((k) => k.time >= currentTime) ||
      sortedKeyframes[sortedKeyframes.length - 1];

    if (!startFrame) startFrame = endFrame;
    if (!endFrame) endFrame = startFrame;

    const timeDiff = endFrame.time - startFrame.time;
    const progress = timeDiff === 0 ? 1 : (currentTime - startFrame.time) / timeDiff;

    const interpolated: Partial<AnimatableLayerProps> = {};
    const keys = Object.keys(startFrame.props) as Array<keyof AnimatableLayerProps>;
    for (const typedKey of keys) {
      const startVal = startFrame.props[typedKey];
      const endVal = endFrame.props[typedKey];
      if (typeof startVal === "number" && typeof endVal === "number") {
        (interpolated as Record<string, number>)[typedKey as string] =
          startVal + (endVal - startVal) * progress;
      }
    }
    return { ...layer, ...interpolated };
  };

  const handleGenerateDraft = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingDraft(true);

    try {
      const draft = buildAIDraft({
        prompt: aiPrompt,
        activeTab,
        selectedClipId: activeLayerId,
        layoutMode,
      });
      setAiDraftResponse(draft);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleApplyDraft = () => {
    if (!aiDraftResponse?.timelinePatchPreview?.[0]) return;
    const patch = aiDraftResponse.timelinePatchPreview[0];

    const makeLayerFromPatch = (): Layer => ({
      id: Math.random().toString(36).slice(2, 9),
      name: patch.proposedClip.name || "AI Draft Clip",
      url:
        patch.proposedClip.url ||
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
      type: "image",
      trackId: (patch.proposedClip.trackId as Layer["trackId"]) || "media",
      color: "#24D3FF",
      speed: 1,
      start: currentTime,
      end: currentTime + 4,
      isVisible: true,
      width: (patch.proposedClip.width as number) || (aspectRatio === "9:16" ? 400 : 1000),
      height: (patch.proposedClip.height as number) || (aspectRatio === "9:16" ? 711 : 562),
      x: (patch.proposedClip.x as number) || 0,
      y: (patch.proposedClip.y as number) || 0,
      scale: (patch.proposedClip.scale as number) || 1,
      rotation: (patch.proposedClip.rotation as number) || 0,
      opacity: (patch.proposedClip.opacity as number) || 1,
      zIndex: Math.max(...layers.map((l) => l.zIndex), 0) + 1,
      hsb: (patch.proposedClip.hsb as Layer["hsb"]) || { hue: 0, sat: 100, bri: 100 },
      blur: (patch.proposedClip.blur as number) || 0,
      hasBgRemoved: false,
      keyframes: [],
    });

    const nextLayer = makeLayerFromPatch();
    const selectedLayer = layers.find((l) => l.id === activeLayerId) || null;

    if (timelineApplyRequest.mode === "replace" && timelineApplyRequest.target === "selectedClip" && selectedLayer) {
      updateLayer(selectedLayer.id, {
        name: nextLayer.name,
        url: nextLayer.url,
        trackId: nextLayer.trackId,
      });
    } else if (
      timelineApplyRequest.mode === "append" &&
      timelineApplyRequest.target === "range" &&
      selectedLayer
    ) {
      const patchProps: Partial<AnimatableLayerProps> = {
        x: (patch.proposedClip.x as number) ?? selectedLayer.x,
        y: (patch.proposedClip.y as number) ?? selectedLayer.y,
        scale: (patch.proposedClip.scale as number) ?? selectedLayer.scale,
        rotation: (patch.proposedClip.rotation as number) ?? selectedLayer.rotation,
        opacity: (patch.proposedClip.opacity as number) ?? selectedLayer.opacity,
      };
      updateLayer(selectedLayer.id, {
        keyframes: [...selectedLayer.keyframes, { time: currentTime, props: patchProps }],
      });
    } else if (
      timelineApplyRequest.mode === "append" &&
      timelineApplyRequest.target === "selectedTrack" &&
      selectedLayer
    ) {
      addLayer(nextLayer.name, nextLayer.url, selectedLayer.trackId);
    } else if (timelineApplyRequest.target === "newTrack") {
      addLayer(nextLayer.name, nextLayer.url, "effects");
    } else {
      addLayer(nextLayer.name, nextLayer.url, nextLayer.trackId);
    }

    setAiDraftResponse(null);
    setAiPrompt("");
  };

  const connectProviderWithKey = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.providerId !== providerId) return p;
        const key = (p.apiKeyInput || "").trim();
        if (!key || key.length < 8) {
          return { ...p, status: "error", error: "API key appears invalid." };
        }
        return { ...p, status: "key-connected", authMode: "apiKey", error: undefined };
      }),
    );
  };

  const connectProviderWithPlan = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.providerId === providerId
          ? { ...p, status: "plan-connected", authMode: "plan", error: undefined }
          : p,
      ),
    );
  };

  const enableProvider = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.providerId === providerId ? { ...p, status: "ready", error: undefined } : p)),
    );
  };

  const handlePublish = () => {
    const projectName = `Shorts: ${layers.find((l) => l.zIndex === 10)?.name || "New Project"}`;
    addProject({
      id: Math.random().toString(36).slice(2, 9),
      name: projectName,
      videoTitle: projectName,
      status: "ideation",
      color: "#FF3399",
      publishDate: new Date().toISOString(),
      tasks: [],
      script: "",
      description: "Nexus-Generated Logic",
      notes: "",
      tags: "",
      thumbnailUrl: layers[0]?.url || "",
      plan: { topic: "", description: "", length: "", audience: "", vision: "", hook: "" },
      storyboard: [],
    });
    alert(`🚀 PROJECT SAVED TO BRAIN: "${projectName}" is now in your Vault.`);
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId) || null;

  const enabledProviderByCapability = useMemo(() => {
    const map = new Map<EditorTabId, string[]>();
    for (const tab of TAB_REGISTRY.map((t) => t.id)) map.set(tab, []);

    providers
      .filter((p) => p.status === "ready")
      .forEach((p) => {
        p.capabilities.forEach((cap) => {
          const list = map.get(cap) || [];
          list.push(p.providerId);
          map.set(cap, list);
        });
      });

    return map;
  }, [providers]);

  const renderActiveTabPanel = () => {
    const tabIntegrations = enabledProviderByCapability.get(activeTab) || [];

    if (activeTab === "media") {
      return (
        <div className="space-y-6">
          <button className="w-full h-16 bg-[#CCFF00] border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3 font-[1000] uppercase text-lg text-black">
            <UploadCloud size={24} strokeWidth={3} /> Upload Asset
          </button>
          <div className="text-[10px] font-black uppercase tracking-widest text-black/50">
            Connected media providers: {tabIntegrations.length ? tabIntegrations.join(", ") : "none"}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                name: "Neon City",
                url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2544&auto=format&fit=crop",
              },
              {
                name: "Vaporwave Sun",
                url: "https://images.unsplash.com/photo-1614850523296-e8c041df43a6?q=80&w=2670&auto=format&fit=crop",
              },
              {
                name: "Studio Portrait",
                url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
              },
              {
                name: "Digital Grit",
                url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
              },
            ].map((asset) => (
              <button
                key={asset.name}
                onClick={() => addLayer(asset.name, asset.url, "media")}
                className="aspect-square bg-gray-100 border-[4px] border-black rounded-[20px] overflow-hidden group cursor-pointer shadow-[4px_4px_0px_0px_black] hover:shadow-[6px_6px_0px_0px_#FF3399] transition-all relative"
              >
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "ai") {
      return (
        <div className="space-y-5">
          <div className="bg-[#00CCFF]/10 border-[4px] border-[#00CCFF] p-4 rounded-2xl text-black">
            <h4 className="font-black uppercase tracking-tight text-sm mb-1">Draft Then Insert</h4>
            <p className="text-xs font-bold opacity-70">AI prepares draft artifacts and timeline patch previews. You confirm before apply.</p>
          </div>
          <textarea
            className="w-full h-36 p-4 border-[4px] border-black rounded-2xl font-bold text-sm resize-none focus:bg-[#00CCFF]/5 outline-none transition-colors"
            placeholder={`Generate for ${activeTab.toUpperCase()}...`}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={handleGenerateDraft}
              disabled={isGeneratingDraft || !aiPrompt.trim()}
              className="flex-1 py-3 bg-black text-[#00CCFF] border-[4px] border-black rounded-2xl font-[1000] uppercase text-sm shadow-[4px_4px_0px_0px_#00CCFF] disabled:opacity-50"
            >
              {isGeneratingDraft ? "Generating..." : "Generate Draft"}
            </button>
            <button
              onClick={() => {
                setAiPrompt("");
                setAiDraftResponse(null);
              }}
              className="px-4 py-3 bg-white border-[4px] border-black rounded-2xl font-[1000] uppercase text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "text") {
      return (
        <div className="space-y-5">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/50">Generate titles, CTAs, overlays, and icon labels.</div>
          <button
            onClick={() => addLayer("Like & Subscribe Overlay", "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop", "text")}
            className="w-full py-4 bg-[#FF3399] text-white border-[4px] border-black rounded-2xl font-[1000] uppercase text-sm shadow-[6px_6px_0px_0px_black]"
          >
            Add Text Overlay Stub
          </button>
        </div>
      );
    }

    if (activeTab === "transitions") {
      return (
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/50">Transition library (template-ready): fade, wipe, slide, punch-in.</div>
          <div className="grid grid-cols-2 gap-3">
            {["fade", "wipe", "slide", "spring"].map((item) => (
              <button key={item} className="py-3 bg-[#FFDD00] border-[3px] border-black rounded-xl font-black uppercase text-xs">
                {item}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "motion") {
      return (
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/50">Keyframe and motion presets for selected clip.</div>
          <button
            onClick={() => activeLayer && updateLayer(activeLayer.id, { scale: (activeLayer.scale || 1) + 0.1 })}
            className="w-full py-3 bg-[#00CCFF] border-[3px] border-black rounded-xl font-black uppercase text-xs"
          >
            Nudge Scale +
          </button>
        </div>
      );
    }

    if (activeTab === "audio") {
      return (
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/50">TTS/music/sfx integration appears when providers are enabled.</div>
          <div className="text-xs font-bold">Enabled providers: {tabIntegrations.length ? tabIntegrations.join(", ") : "none"}</div>
        </div>
      );
    }

    if (activeTab === "captions") {
      return (
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/50">Caption templates + timing tools. AI can draft from selected clip context.</div>
          <div className="text-xs font-bold">Enabled providers: {tabIntegrations.length ? tabIntegrations.join(", ") : "none"}</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.providerId} className="border-[4px] border-black rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_black] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-black uppercase text-sm tracking-widest">{provider.providerId}</h4>
                <p className="text-[10px] font-bold uppercase text-black/50">{provider.capabilities.join(", ")}</p>
              </div>
              <span className={`px-2 py-1 border-[2px] border-black rounded-full text-[9px] font-black uppercase ${provider.status === "ready" ? "bg-[#CCFF00]" : provider.status === "error" ? "bg-[#FF7497]" : "bg-[#FFE357]"}`}>
                {provider.status}
              </span>
            </div>

            {provider.authMode === "apiKey" ? (
              <>
                <div className="flex items-center gap-2 text-xs font-black uppercase"><KeyRound size={14} /> API Key</div>
                <input
                  value={provider.apiKeyInput || ""}
                  onChange={(e) =>
                    setProviders((prev) =>
                      prev.map((p) =>
                        p.providerId === provider.providerId
                          ? { ...p, apiKeyInput: e.target.value, status: p.status === "error" ? "locked" : p.status, error: undefined }
                          : p,
                      ),
                    )
                  }
                  placeholder="Enter API key"
                  className="w-full h-10 border-[3px] border-black rounded-xl px-3 font-bold text-sm"
                />
                <button
                  onClick={() => connectProviderWithKey(provider.providerId)}
                  className="w-full h-10 bg-black text-white border-[3px] border-black rounded-xl font-black uppercase text-xs"
                >
                  Connect Key
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs font-black uppercase"><ShieldCheck size={14} /> Plan Gate</div>
                <button
                  onClick={() => connectProviderWithPlan(provider.providerId)}
                  className="w-full h-10 bg-[#CCFF00] border-[3px] border-black rounded-xl font-black uppercase text-xs"
                >
                  Unlock via Plan
                </button>
              </>
            )}

            {(provider.status === "key-connected" || provider.status === "plan-connected") ? (
              <button
                onClick={() => enableProvider(provider.providerId)}
                className="w-full h-9 bg-[#00CCFF] border-[3px] border-black rounded-xl font-black uppercase text-xs"
              >
                Enable Provider
              </button>
            ) : null}

            {provider.error ? <div className="text-[10px] font-black uppercase text-[#FF3399]">{provider.error}</div> : null}
          </div>
        ))}
      </div>
    );
  };

  const DraftPanel = () => (
    <div className="border-[4px] border-black rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_black] space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-black uppercase text-xs tracking-widest">AI Draft Preview</h4>
        <span className="text-[10px] font-black uppercase bg-[#00CCFF] px-2 py-1 border-2 border-black rounded-full">
          {Math.round((aiDraftResponse?.confidence || 0) * 100)}%
        </span>
      </div>

      {(aiDraftResponse?.draftArtifacts || []).map((artifact) => (
        <div key={artifact.id} className="border-[3px] border-black rounded-xl p-3 bg-[#f8fafc]">
          <div className="text-[10px] font-black uppercase text-black/50">{artifact.type}</div>
          <div className="font-black text-sm uppercase">{artifact.title}</div>
          <div className="text-xs font-bold opacity-70 line-clamp-3">{artifact.preview}</div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-2">
        <label className="text-[10px] font-black uppercase">Mode</label>
        <select
          className="h-8 border-[2px] border-black rounded px-2 text-xs font-black uppercase"
          value={timelineApplyRequest.mode}
          onChange={(e) =>
            setTimelineApplyRequest((prev) => ({
              ...prev,
              mode: e.target.value as TimelineApplyMode,
            }))
          }
        >
          <option value="insert">insert</option>
          <option value="replace">replace</option>
          <option value="append">append</option>
        </select>

        <label className="text-[10px] font-black uppercase">Target</label>
        <select
          className="h-8 border-[2px] border-black rounded px-2 text-xs font-black uppercase"
          value={timelineApplyRequest.target}
          onChange={(e) =>
            setTimelineApplyRequest((prev) => ({
              ...prev,
              target: e.target.value as TimelineApplyTarget,
            }))
          }
        >
          <option value="selectedClip">selectedClip</option>
          <option value="selectedTrack">selectedTrack</option>
          <option value="newTrack">newTrack</option>
          <option value="range">range</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleApplyDraft}
          className="flex-1 h-10 bg-[#CCFF00] border-[3px] border-black rounded-xl font-black uppercase text-xs"
        >
          Confirm & Apply
        </button>
        <button
          onClick={() => setAiDraftResponse(null)}
          className="h-10 px-4 bg-white border-[3px] border-black rounded-xl font-black uppercase text-xs"
        >
          Dismiss
        </button>
      </div>
    </div>
  );

  const RightCanvas = () => (
    <div className="flex-1 bg-gray-200 flex flex-col relative overflow-hidden z-10" style={{ backgroundImage: "radial-gradient(#d1d5db 2px, transparent 0)", backgroundSize: "30px 30px" }}>
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-40 pointer-events-none">
        <div className="flex bg-white border-[4px] border-black rounded-[20px] overflow-hidden shadow-[6px_6px_0px_0px_black] pointer-events-auto">
          {(["9:16", "16:9"] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-6 py-3 font-[1000] uppercase text-sm transition-colors ${
                aspectRatio === ratio ? "bg-[#FF3399] text-white" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className="h-14 bg-white border-[4px] border-black rounded-[20px] px-6 shadow-[6px_6px_0px_0px_black] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3 font-[1000] uppercase text-lg pointer-events-auto"
        >
          {isPlaying ? <Pause size={24} className="text-[#FF3399]" /> : <Play size={24} className="text-[#00CCFF]" />}
          {isPlaying ? "Halt" : "Preview"}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-10 mt-10 pb-24">
        <div
          className={`relative transition-all duration-700 ease-in-out bg-black border-[12px] border-black rounded-[40px] shadow-[24px_24px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden ${
            aspectRatio === "9:16"
              ? "aspect-[9/16] h-full max-h-[760px]"
              : "aspect-[16/9] w-full max-w-[1100px]"
          }`}
        >
          <div className="absolute inset-0">
            {[...layers]
              .sort((a, b) => a.zIndex - b.zIndex)
              .filter((l) => l.isVisible && currentTime >= l.start && currentTime <= l.end)
              .map((layer) => {
                const animated = getInterpolatedProps(layer);
                if (!layerRefs.current[layer.id]) {
                  layerRefs.current[layer.id] = React.createRef<HTMLDivElement>();
                }
                const nodeRef = layerRefs.current[layer.id];

                return (
                  <Draggable
                    key={layer.id}
                    nodeRef={nodeRef as React.RefObject<HTMLElement>}
                    position={{ x: animated.x, y: animated.y }}
                    onStop={(_e, data) => updateLayer(layer.id, { x: data.x, y: data.y })}
                    onStart={() => setActiveLayerId(layer.id)}
                  >
                    <div ref={nodeRef as React.RefObject<HTMLDivElement>}>
                      <ResizableBox
                        width={animated.width || (aspectRatio === "9:16" ? 400 : 1000)}
                        height={animated.height || (aspectRatio === "9:16" ? 711 : 562)}
                        onResizeStop={(_e, { size }) =>
                          updateLayer(layer.id, { width: size.width, height: size.height })
                        }
                        className={`absolute transition-all ${
                          activeLayerId === layer.id ? "ring-[6px] ring-[#00CCFF] ring-inset z-[100]" : ""
                        }`}
                        style={{
                          transform: `scale(${animated.scale}) rotate(${animated.rotation}deg)`,
                          opacity: animated.opacity,
                          filter: `hue-rotate(${animated.hsb.hue}deg) saturate(${animated.hsb.sat}%) brightness(${animated.hsb.bri}%) blur(${animated.blur}px)`,
                        }}
                      >
                        <img
                          src={layer.hasBgRemoved && layer.bgRemovedUrl ? layer.bgRemovedUrl : layer.url}
                          alt={layer.name}
                          className="w-full h-full object-contain"
                          draggable="false"
                        />
                      </ResizableBox>
                    </div>
                  </Draggable>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );

  const LeftInspector = () => (
    <div className="w-[420px] bg-[#f8fafc] border-r-[6px] border-black flex flex-col z-20 shrink-0">
      <div className="h-20 bg-white border-b-[4px] border-black flex items-center px-6 shrink-0 justify-between">
        <h2 className="font-[1000] text-xl uppercase tracking-tighter text-black">{TAB_REGISTRY.find((t) => t.id === activeTab)?.label}</h2>
        <span className="text-[10px] font-black uppercase px-2 py-1 border-2 border-black rounded-full bg-[#FFE357]">{layoutMode}</span>
      </div>

      <div className="p-4 border-b-[4px] border-black bg-[#fff] space-y-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-black/60">Shared AI Quick Prompt</div>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder={`Generate for ${activeTab.toUpperCase()}...`}
          className="w-full h-20 border-[3px] border-black rounded-xl p-2 font-bold text-xs resize-none"
        />
        <button
          onClick={handleGenerateDraft}
          disabled={isGeneratingDraft || !aiPrompt.trim()}
          className="w-full h-10 bg-black text-[#00CCFF] border-[3px] border-black rounded-xl font-black uppercase text-xs disabled:opacity-50"
        >
          {isGeneratingDraft ? "Generating" : "Draft from Active Tab"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
        {renderActiveTabPanel()}
        {aiDraftResponse ? <DraftPanel /> : null}

        {activeLayer ? (
          <div className="space-y-4 border-[4px] border-black rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_black]">
            <h4 className="font-black uppercase text-xs tracking-widest">Selected Clip Controls</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => moveLayer(activeLayer.id, "up")}
                className="h-9 border-[3px] border-black rounded-xl font-black uppercase text-[10px] bg-[#CCFF00]"
              >
                Up
              </button>
              <button
                onClick={() => moveLayer(activeLayer.id, "down")}
                className="h-9 border-[3px] border-black rounded-xl font-black uppercase text-[10px] bg-[#FFE357]"
              >
                Down
              </button>
            </div>

            <button
              onClick={() => handleBgRemove(activeLayer.id)}
              disabled={isRemovingBg === activeLayer.id || activeLayer.hasBgRemoved}
              className="w-full h-10 border-[3px] border-black rounded-xl font-black uppercase text-xs bg-[#FFDD00] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRemovingBg === activeLayer.id ? <Loader2 size={12} className="animate-spin" /> : null}
              {activeLayer.hasBgRemoved ? "Background Removed" : "Remove Background"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  const LayerStack = () => (
    <div className="w-80 bg-[#f8fafc] border-l-[6px] border-black flex flex-col z-20 shrink-0">
      <div className="h-20 bg-[#FFDD00] border-b-[4px] border-black flex items-center px-5 shrink-0">
        <h2 className="font-[1000] text-lg uppercase tracking-tighter text-black">Layer Stack</h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {[...layers]
          .sort((a, b) => b.zIndex - a.zIndex)
          .map((layer) => (
            <div
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              className={`p-3 border-[4px] border-black rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-[4px_4px_0px_0px_black] ${
                activeLayerId === layer.id ? "bg-[#00CCFF] text-black translate-x-1" : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="w-10 h-10 rounded-lg border-[3px] border-black overflow-hidden shrink-0 bg-black">
                <img src={layer.url} className="w-full h-full object-cover opacity-80" alt="thumb" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black uppercase tracking-tight text-xs truncate">{layer.name}</h4>
                <span className="text-[9px] font-black uppercase opacity-50 tracking-widest">Z {layer.zIndex}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, { isVisible: !layer.isVisible });
                }}
                className={`p-1.5 rounded-lg border-2 border-black transition-colors ${
                  layer.isVisible ? "bg-white" : "bg-black text-white"
                }`}
              >
                {layer.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          ))}
      </div>
    </div>
  );

  const getTimelineSecondsFromMouse = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const container = timelineScrollRef.current;
    if (!container) return 0;
    const rect = container.getBoundingClientRect();
    const x = container.scrollLeft + (event.clientX - rect.left);
    return Math.max(0, Math.min(timelineDurationSec, x / timelinePixelsPerSecond));
  };

  const getTrackIdFromClientY = (clientY: number): EditorTrackId => {
    const container = timelineScrollRef.current;
    if (!container) return "media";
    const rows = Array.from(container.querySelectorAll("[data-track-row]"));
    const hitRow = rows.find((row) => {
      const rect = row.getBoundingClientRect();
      return clientY >= rect.top && clientY <= rect.bottom;
    });
    const id = hitRow?.getAttribute("data-track-row");
    if (id === "text" || id === "audio" || id === "effects" || id === "media") return id;
    return "media";
  };

  const handleTimelineMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const at = getTimelineSecondsFromMouse(event);
    setTimelineGuideSec(at);

    const dragState = dragStateRef.current;
    if (!dragState) return;

    const delta = (event.clientX - dragState.startX) / timelinePixelsPerSecond;
    if (dragState.mode === "move") {
      const duration = dragState.originEnd - dragState.originStart;
      const nextStart = Math.max(0, dragState.originStart + delta);
      const nextTrack = getTrackIdFromClientY(event.clientY);
      dispatchTimelineCommand({
        type: "moveClip",
        clipId: dragState.clipId,
        trackId: nextTrack,
        start: nextStart,
        end: nextStart + duration,
      });
      setTimelineCursorMode("drag");
      return;
    }

    if (dragState.mode === "trimStart") {
      dispatchTimelineCommand({
        type: "trimClipStart",
        clipId: dragState.clipId,
        start: Math.max(0, dragState.originStart + delta),
      });
      setTimelineCursorMode("trim");
      return;
    }

    dispatchTimelineCommand({
      type: "trimClipEnd",
      clipId: dragState.clipId,
      end: Math.max(0.1, dragState.originEnd + delta),
    });
    setTimelineCursorMode("trim");
  };

  const stopTimelineInteractions = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    dragStateRef.current = null;
    setTimelineCursorMode("default");
  };

  const handleClipMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    clip: EditorTimelineClip,
  ) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const nearStart = event.clientX - rect.left <= 10;
    const nearEnd = rect.right - event.clientX <= 10;

    if (nearStart || nearEnd) {
      dragStateRef.current = {
        clipId: clip.id,
        mode: nearStart ? "trimStart" : "trimEnd",
        startX: event.clientX,
        originStart: clip.start,
        originEnd: clip.end,
        originTrackId: clip.trackId,
      };
      setTimelineCursorMode("trim");
      return;
    }

    holdTimerRef.current = setTimeout(() => {
      dragStateRef.current = {
        clipId: clip.id,
        mode: "move",
        startX: event.clientX,
        originStart: clip.start,
        originEnd: clip.end,
        originTrackId: clip.trackId,
      };
      setTimelineCursorMode("drag");
    }, 500);
  };

  const handleClipClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    clip: EditorTimelineClip,
  ) => {
    event.stopPropagation();
    const at = getTimelineSecondsFromMouse(event);
    setCurrentTime(at);
    setActiveLayerId(clip.layerId);

    if (arrowStateRef.current.down) {
      dispatchTimelineCommand({ type: "splitClip", clipId: clip.id, at, newClipId: `clip-${Date.now()}` });
      return;
    }

    if (arrowStateRef.current.left) {
      dispatchTimelineCommand({ type: "deleteSegment", clipId: clip.id, side: "left", at });
      return;
    }

    if (arrowStateRef.current.right) {
      dispatchTimelineCommand({ type: "deleteSegment", clipId: clip.id, side: "right", at });
    }
  };

  const handleClipDoubleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    clip: EditorTimelineClip,
  ) => {
    event.preventDefault();
    setTimelineContext({
      open: true,
      x: event.clientX,
      y: event.clientY,
      clipId: clip.id,
      trackId: clip.trackId,
      at: getTimelineSecondsFromMouse(event),
    });
  };

  const timelineCursorClass =
    timelineCursorMode === "trim"
      ? "ew-resize"
      : timelineCursorMode === "drag"
        ? "grabbing"
        : "crosshair";

  const visibleRange = useMemo(() => {
    const scrollNode = timelineScrollRef.current;
    if (!scrollNode) return { start: 0, end: 15 };
    const start = scrollNode.scrollLeft / timelinePixelsPerSecond;
    const end = (scrollNode.scrollLeft + scrollNode.clientWidth) / timelinePixelsPerSecond;
    return { start, end };
  }, [timelineGuideSec, engineState.compileVersion]);

  const trackDisplay = useMemo(() => {
    return engineState.tracks.map((track) => {
      const clips = engineState.clips.filter((clip) => clip.trackId === track.id);
      const hasVisibleMedia = clips.some(
        (clip) => clip.start <= visibleRange.end && clip.end >= visibleRange.start,
      );
      return {
        track,
        clips,
        tapered: !hasVisibleMedia,
      };
    });
  }, [engineState.clips, engineState.tracks, visibleRange.end, visibleRange.start]);

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex flex-col p-4 overflow-y-auto custom-scrollbar animate-fade-in relative">
      <div className="w-full max-w-[1900px] mx-auto mb-24 bg-white border-[6px] border-black rounded-[40px] shadow-[24px_24px_0px_0px_black] flex flex-col overflow-hidden">
        <div onClick={() => setIsMainToolOpen((prev) => !prev)} className="cursor-pointer">
          <ToolHeader
            title="ADAPTIVE EDITOR SHELL"
            icon="zap"
            titleBgColor="bg-[#FF3399]"
            iconBgColor="bg-[#ccff00]"
          />
        </div>

        <div className="h-16 border-t-[4px] border-black border-b-[4px] bg-black text-white flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {TAB_REGISTRY.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-10 px-3 border-[3px] rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? "bg-[#CCFF00] text-black border-black"
                      : "bg-white/10 text-white border-white/40 hover:bg-white/20"
                  }`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-white/30 rounded-lg">
              Layout
            </span>
            <button
              onClick={() => setAndPersistLayoutOverride("auto")}
              className={`h-9 px-3 border-[2px] rounded-lg font-black uppercase text-[10px] ${
                layoutOverride === "auto" ? "bg-[#CCFF00] text-black border-black" : "bg-white/10 border-white/30"
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setAndPersistLayoutOverride("vertical")}
              className={`h-9 px-3 border-[2px] rounded-lg font-black uppercase text-[10px] ${
                layoutOverride === "vertical"
                  ? "bg-[#CCFF00] text-black border-black"
                  : "bg-white/10 border-white/30"
              }`}
            >
              Vertical
            </button>
            <button
              onClick={() => setAndPersistLayoutOverride("landscape")}
              className={`h-9 px-3 border-[2px] rounded-lg font-black uppercase text-[10px] ${
                layoutOverride === "landscape"
                  ? "bg-[#CCFF00] text-black border-black"
                  : "bg-white/10 border-white/30"
              }`}
            >
              Landscape
            </button>
          </div>
        </div>

        <div className={`grid transition-all duration-700 ${isMainToolOpen ? "grid-rows-[1fr_auto]" : "grid-rows-[0fr_0fr]"}`}>
          <main className="overflow-hidden bg-white min-h-[760px] border-t-[4px] border-black relative">
            {layoutMode === "vertical" ? (
              <div className="h-full flex">
                <LeftInspector />
                <LayerStack />
                <RightCanvas />
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 flex">
                  <LeftInspector />
                  <RightCanvas />
                </div>
                <div className="h-[170px] border-t-[6px] border-black bg-[#f8fafc]">
                  <div className="h-full flex items-center justify-center font-black uppercase tracking-widest text-black/40">
                    Landscape workspace keeps wide canvas focus. Timeline remains global below.
                  </div>
                </div>
              </div>
            )}
          </main>

          <section className="h-32 border-t-[6px] border-black bg-white px-8 flex flex-col justify-center gap-2">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/50">
                Timeline (Canonical Surface) • {(currentTime * 15).toFixed(1)}s
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3399]">
                  UI Theme: {uiStyleLayer.themeId}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00CCFF]">
                  Render Preset: {renderStyleLayer.presetId}
                </span>
                <button
                  onClick={handlePublish}
                  className="h-10 px-4 bg-[#CCFF00] border-[3px] border-black rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_black]"
                >
                  Publish
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="w-full accent-[#00CCFF] h-4 bg-gray-200 rounded-full border-[3px] border-black cursor-pointer shadow-[2px_2px_0px_0px_black]"
            />
          </section>
        </div>
      </div>

      <div className="w-full max-w-[1900px] mx-auto border-[4px] border-black rounded-2xl p-4 bg-white shadow-[8px_8px_0px_0px_black]">
        <div className="text-xs font-black uppercase tracking-widest mb-2">Style Boundary Policy (UI-only Neo-brutalism)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={styleBoundaryPolicy.uiThemeId}
            onChange={(e) =>
              setStyleBoundaryPolicy((prev) => ({ ...prev, uiThemeId: e.target.value as StyleBoundaryPolicy["uiThemeId"] }))
            }
            className="h-10 border-[3px] border-black rounded-xl px-3 font-black uppercase text-xs"
          >
            <option value="neo-brutalist">neo-brutalist</option>
            <option value="classic">classic</option>
          </select>
          <select
            value={styleBoundaryPolicy.renderPresetId}
            onChange={(e) =>
              setStyleBoundaryPolicy((prev) => ({ ...prev, renderPresetId: e.target.value as StyleBoundaryPolicy["renderPresetId"] }))
            }
            className="h-10 border-[3px] border-black rounded-xl px-3 font-black uppercase text-xs"
          >
            <option value="clean">clean</option>
            <option value="cinematic">cinematic</option>
            <option value="neo">neo</option>
          </select>
          <label className="h-10 border-[3px] border-black rounded-xl px-3 font-black uppercase text-xs flex items-center gap-2">
            <input
              type="checkbox"
              checked={styleBoundaryPolicy.allowCrossMapping}
              onChange={(e) =>
                setStyleBoundaryPolicy((prev) => ({ ...prev, allowCrossMapping: e.target.checked }))
              }
            />
            allowCrossMapping
          </label>
        </div>
      </div>
    </div>
  );
};

export default ShortsStudio;
