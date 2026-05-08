import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  applyTimelineCommand,
  buildLaunchProjectJson,
  createRemotionRenderJobPayload,
  createRenderJobRequestFromBridgePayload,
  createMediaAssetFromFile,
  createMediaAssetFromUrl,
  createTimelineState,
  enqueueRemotionRenderJob,
  parseLaunchProjectJson,
  pollRemotionRenderJob,
  serializeRemotionRenderJobPayload,
  timelineToComposition,
  type EditorClip,
  type RenderJobStatus,
  type TemplatePresetV1,
  type TimelineState,
} from "../editor-core";
import {
  listOracleJobs,
  runManualOracleJob,
  type OracleSuggestionResult,
} from "../services/oracle";
import type { OracleAgentId, OracleJobV1 } from "../services/oracle";

const IS_PROD = import.meta.env.VITE_APP_ENV === "production";
const API_BASE = IS_PROD ? "https://api.viewtubex.com" : "http://localhost:3000";
const TRACK_HEIGHT = 52;
const TIME_SCALE = 1;
const COLORS = {
  bg: "#f0f0f4",
  black: "#1a1a1a",
  white: "#ffffff",
  pink: "#FF8AAF",
  orange: "#FFB570",
  yellow: "#FFFF61",
  green: "#4FFF5B",
  cyan: "#40C6E9",
  blue: "#579AFF",
  purple: "#CC00FF",
  violet: "#FF83EA",
};

const LAUNCH_TEMPLATES: TemplatePresetV1[] = [
  {
    id: "tpl-subscribe-bar",
    name: "Subscribe Bar",
    clips: [
      { kind: "shape", title: "Bar", color: COLORS.pink, startOffsetFrames: 0, durationFrames: 120, y: 280, scale: 1, opacity: 1 },
      { kind: "text", title: "Subscribe CTA", text: "SUBSCRIBE + @YOURHANDLE", color: COLORS.black, startOffsetFrames: 8, durationFrames: 112, y: 280, scale: 1, opacity: 1 },
    ],
  },
  {
    id: "tpl-chapter-pill",
    name: "Chapter Pill",
    clips: [
      { kind: "shape", title: "Chapter Pill", color: COLORS.yellow, startOffsetFrames: 0, durationFrames: 90, y: -250, scale: 0.8, opacity: 1 },
      { kind: "text", title: "Chapter Label", text: "CHAPTER 01", color: COLORS.black, startOffsetFrames: 6, durationFrames: 84, y: -250, scale: 0.8, opacity: 1 },
    ],
  },
  {
    id: "tpl-topic-tag",
    name: "Topic Tag",
    clips: [
      { kind: "shape", title: "Topic Tag", color: COLORS.cyan, startOffsetFrames: 0, durationFrames: 75, y: 220, scale: 0.7, opacity: 1 },
      { kind: "text", title: "Topic Text", text: "#TIPS", color: COLORS.black, startOffsetFrames: 4, durationFrames: 70, y: 220, scale: 0.7, opacity: 1 },
    ],
  },
];

const ORACLE_AGENT_OPTIONS: Array<{ id: OracleAgentId; label: string }> = [
  { id: "hook-strategist", label: "Hook Strategist" },
  { id: "story-beat", label: "Story Beat" },
  { id: "visual-motion", label: "Visual Motion" },
  { id: "caption-rhythm", label: "Caption Rhythm" },
  { id: "audio-energy", label: "Audio Energy" },
  { id: "retention-critic", label: "Retention Critic" },
  { id: "render-optimization", label: "Render Optimization" },
];

const RESOLUTION_MAP: Record<"720" | "1080" | "1k" | "2k" | "4k", [number, number]> = {
  "720": [1280, 720],
  "1080": [1920, 1080],
  "1k": [1920, 1080],
  "2k": [2560, 1440],
  "4k": [3840, 2160],
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const rowTrackIdAtY = (y: number, trackIds: string[]): string => {
  const idx = clamp(Math.floor(y / (TRACK_HEIGHT + 8)), 0, Math.max(0, trackIds.length - 1));
  return trackIds[idx] ?? "video-1";
};

const clipDuration = (clip: EditorClip) => Math.max(1, clip.endFrame - clip.startFrame);

export const LaunchEditor: React.FC = () => {
  const [state, setState] = useState<TimelineState>(() => createTimelineState(30));
  const [selectedTrackId, setSelectedTrackId] = useState("video-1");
  const [aspect, setAspect] = useState<"16:9" | "9:16">("16:9");
  const [resolutionProfile, setResolutionProfile] = useState<"720" | "1080" | "1k" | "2k" | "4k">("1080");
  const [renderFormat, setRenderFormat] = useState<"mp4" | "mov" | "webp">("mp4");
  const [renderMode, setRenderMode] = useState<"realtime" | "quality" | "frame-perfect">("quality");
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<string>("");
  const [renderJobs, setRenderJobs] = useState<RenderJobStatus[]>([]);
  const [templateId, setTemplateId] = useState(LAUNCH_TEMPLATES[0].id);
  const [oracleAgentId, setOracleAgentId] = useState<OracleAgentId>("hook-strategist");
  const [oracleObjective, setOracleObjective] = useState("Improve first 20 seconds for retention.");
  const [oracleJobs, setOracleJobs] = useState<OracleJobV1[]>([]);
  const [oracleSuggestions, setOracleSuggestions] = useState<OracleSuggestionResult[]>([]);
  const [oraclePrompt, setOraclePrompt] = useState("");
  const [oracleRunning, setOracleRunning] = useState(false);
  const [showOraclePrompt, setShowOraclePrompt] = useState(false);
  const [dragAction, setDragAction] = useState<{
    clipId: string;
    offsetFrame: number;
  } | null>(null);

  const timelineRef = useRef<HTMLDivElement | null>(null);
  const loadRef = useRef<HTMLInputElement | null>(null);

  const dispatch = (command: Parameters<typeof applyTimelineCommand>[1]) => {
    setState((prev) => applyTimelineCommand(prev, command));
  };

  const trackIds = useMemo(
    () => state.tracks.slice().sort((a, b) => a.index - b.index).map((t) => t.id),
    [state.tracks],
  );

  const selectedClip = useMemo(
    () => state.clips.find((c) => c.id === state.selectedClipId) ?? null,
    [state.clips, state.selectedClipId],
  );

  const composition = useMemo(() => {
    const [w, h] = RESOLUTION_MAP[resolutionProfile];
    const [width, height] = aspect === "16:9" ? [w, h] : [h, w];
    return timelineToComposition(state, {
      compositionId: "viewtube-launch-editor",
      width,
      height,
      fps: state.fps,
      durationInFrames: Math.max(120, state.clips.reduce((m, c) => Math.max(m, c.endFrame), 120)),
    });
  }, [state, aspect, resolutionProfile]);

  const visiblePreviewClips = useMemo(() => {
    const byTrack = new Map(state.tracks.map((t) => [t.id, t.index]));
    return state.clips
      .filter((clip) => clip.startFrame <= state.playheadFrame && clip.endFrame >= state.playheadFrame)
      .slice()
      .sort((a, b) => (byTrack.get(a.trackId) ?? 0) - (byTrack.get(b.trackId) ?? 0));
  }, [state.clips, state.playheadFrame, state.tracks]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragAction || !timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const frame = Math.max(0, Math.round((event.clientX - rect.left) / (state.zoom * TIME_SCALE)));
      const y = Math.max(0, event.clientY - rect.top - 40);
      const trackId = rowTrackIdAtY(y, trackIds);
      const clip = state.clips.find((c) => c.id === dragAction.clipId);
      if (!clip) return;
      const startFrame = frame - dragAction.offsetFrame;
      dispatch({
        type: "moveClip",
        clipId: clip.id,
        trackId,
        startFrame,
        endFrame: startFrame + clipDuration(clip),
      });
    };
    const onUp = () => {
      setDragAction(null);
      dispatch({ type: "commitPointerAction" });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragAction, state.zoom, state.clips, trackIds]);

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    const files: File[] = Array.from(fileList);
    for (const file of files) {
      try {
        const asset = await createMediaAssetFromFile(file);
        dispatch({
          type: "insertClip",
          clip: {
            id: `clip-${asset.id}`,
            trackId: asset.kind === "audio" ? "audio-1" : selectedTrackId,
            kind: asset.kind,
            sourceId: asset.id,
            title: asset.name,
            color: asset.kind === "audio" ? COLORS.blue : COLORS.yellow,
            startFrame: state.playheadFrame,
            endFrame: state.playheadFrame + state.fps * (asset.kind === "image" ? 3 : 2),
            speed: 1,
            volume: 1,
            muted: false,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
            clipType: "media",
            mediaUrl: asset.sourceUrl,
            groupedWithNext: false,
            keyframeIds: [],
            effectIds: [],
          },
        });
      } catch (error) {
        setStatus((error as Error).message);
      }
    }
    event.target.value = "";
  };

  const onAddUrl = async () => {
    try {
      const asset = await createMediaAssetFromUrl(urlInput);
      dispatch({
        type: "insertClip",
        clip: {
          id: `clip-${asset.id}`,
          trackId: asset.kind === "audio" ? "audio-1" : selectedTrackId,
          kind: asset.kind,
          sourceId: asset.id,
          title: asset.name,
          color: asset.kind === "audio" ? COLORS.blue : COLORS.orange,
          startFrame: state.playheadFrame,
          endFrame: state.playheadFrame + state.fps * (asset.kind === "image" ? 3 : 2),
          speed: 1,
          volume: 1,
          muted: false,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          clipType: "media",
          mediaUrl: asset.sourceUrl,
          groupedWithNext: false,
          keyframeIds: [],
          effectIds: [],
        },
      });
      setUrlInput("");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const addTextClip = () => {
    dispatch({
      type: "insertClip",
      clip: {
        id: `clip-text-${Date.now()}`,
        trackId: "text-1",
        kind: "text",
        sourceId: "manual-text",
        title: "Text",
        text: "TYPE HERE",
        color: COLORS.violet,
        startFrame: state.playheadFrame,
        endFrame: state.playheadFrame + state.fps * 2,
        speed: 1,
        volume: 1,
        muted: false,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        clipType: "text",
        mediaUrl: "",
        groupedWithNext: false,
        keyframeIds: [],
        effectIds: [],
      },
    });
  };

  const addShapeClip = () => {
    dispatch({
      type: "insertClip",
      clip: {
        id: `clip-shape-${Date.now()}`,
        trackId: "image-1",
        kind: "image",
        sourceId: "shape-rect",
        title: "Shape",
        color: COLORS.green,
        startFrame: state.playheadFrame,
        endFrame: state.playheadFrame + state.fps * 2,
        speed: 1,
        volume: 1,
        muted: false,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        clipType: "shape",
        mediaUrl: "",
        groupedWithNext: false,
        keyframeIds: [],
        effectIds: [],
      },
    });
  };

  const splitSelected = () => {
    if (!selectedClip) return;
    dispatch({
      type: "splitClip",
      clipId: selectedClip.id,
      frame: state.playheadFrame,
      newClipId: `${selectedClip.id}-split-${Date.now()}`,
    });
  };

  const applyTemplate = () => {
    const tpl = LAUNCH_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    tpl.clips.forEach((entry, index) => {
      dispatch({
        type: "insertClip",
        clip: {
          id: `clip-tpl-${tpl.id}-${Date.now()}-${index}`,
          trackId: entry.kind === "text" ? "text-1" : "image-1",
          kind: entry.kind === "text" ? "text" : "image",
          sourceId: entry.kind === "shape" ? "shape-template" : "text-template",
          title: entry.title,
          text: entry.text ?? "",
          color: entry.color,
          startFrame: state.playheadFrame + entry.startOffsetFrames,
          endFrame: state.playheadFrame + entry.startOffsetFrames + entry.durationFrames,
          speed: 1,
          volume: 1,
          muted: false,
          x: entry.x ?? 0,
          y: entry.y ?? 0,
          scale: entry.scale ?? 1,
          rotation: 0,
          opacity: entry.opacity ?? 1,
          clipType: entry.kind,
          mediaUrl: "",
          groupedWithNext: false,
          keyframeIds: [],
          effectIds: [],
        },
      });
    });
  };

  const saveProject = () => {
    const json = buildLaunchProjectJson(state, { aspect, resolutionProfile });
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "viewtube-launch-editor.project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const raw = await file.text();
    try {
      const parsed = parseLaunchProjectJson(raw);
      setState((prev) => ({
        ...prev,
        fps: parsed.timeline.fps,
        playheadFrame: parsed.timeline.playheadFrame,
        zoom: parsed.timeline.zoom,
        snapping: parsed.timeline.snapping,
        tracks: parsed.timeline.tracks,
        clips: parsed.timeline.clips,
        keyframes: parsed.timeline.keyframes,
        transitions: parsed.timeline.transitions,
      }));
      if (parsed.exportMeta) {
        setAspect(parsed.exportMeta.aspect);
        setResolutionProfile(parsed.exportMeta.resolutionProfile);
      }
      setStatus("Project loaded.");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      event.target.value = "";
    }
  };

  const queueRender = async () => {
    try {
      const payload = createRemotionRenderJobPayload({
        state,
        format: renderFormat,
        resolutionProfile,
        aspect,
        renderMode,
      });
      const request = createRenderJobRequestFromBridgePayload(payload, `launch-${Date.now()}`);
      const queued = await enqueueRemotionRenderJob(API_BASE, request);
      setRenderJobs((prev) => [queued, ...prev]);
      setStatus(`Render queued: ${queued.jobId}`);

      const poll = async () => {
        const next = await pollRemotionRenderJob(API_BASE, queued.jobId);
        setRenderJobs((prev) =>
          prev.map((j) => (j.jobId === next.jobId ? next : j)),
        );
        if (next.status === "queued" || next.status === "rendering") {
          window.setTimeout(() => {
            void poll();
          }, 1800);
        }
      };
      window.setTimeout(() => {
        void poll();
      }, 1200);
    } catch (error) {
      setStatus(`Render failed: ${(error as Error).message}`);
    }
  };

  const exportRemotionJob = () => {
    const payload = createRemotionRenderJobPayload({
      state,
      format: renderFormat,
      resolutionProfile,
      aspect,
      renderMode,
    });
    const json = serializeRemotionRenderJobPayload(payload);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `viewtube-launch-editor.remotion.${renderFormat}.job.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Remotion bridge job exported.");
  };

  const runOracle = async () => {
    const objective = oracleObjective.trim();
    if (!objective) {
      setStatus("Oracle objective is required.");
      return;
    }

    setOracleRunning(true);
    try {
      const clipCount = state.clips.length;
      const transitionCount = state.transitions.length;
      const timelineContext = {
        fps: state.fps,
        playheadFrame: state.playheadFrame,
        durationInFrames: composition.durationInFrames,
        tracks: state.tracks.map((track) => ({ id: track.id, name: track.name, kind: track.kind })),
        clipCount,
        transitionCount,
        selectedClipId: state.selectedClipId,
      };

      const complexityScore = Math.max(35, Math.min(96, Math.round(40 + clipCount * 4 + transitionCount * 5 + state.zoom * 12)));
      const result = await runManualOracleJob({
        agentId: oracleAgentId,
        objective,
        channelVoiceDna: "ViewTube launch creator DNA: direct, high-energy, no filler.",
        audienceStyle: "YouTube viewers expecting immediate hook and clear payoff.",
        creatorConstraints: ["manual-copilot only", "no auto-apply", "preserve creator intent"],
        timelineContextJson: JSON.stringify(timelineContext),
        complexityScore,
      });

      setOraclePrompt(result.prompt);
      setOracleSuggestions(result.suggestions);
      setOracleJobs(listOracleJobs());
      setStatus(`Oracle job ready: ${result.job.id}`);
    } catch (error) {
      setStatus(`Oracle failed: ${(error as Error).message}`);
    } finally {
      setOracleRunning(false);
    }
  };

  const applyOracleSuggestion = (suggestion: OracleSuggestionResult) => {
    if (!selectedClip) {
      setStatus("Select a clip before applying an Oracle suggestion.");
      return;
    }
    if (!suggestion.safePatch) {
      setStatus("This suggestion does not include a safe patch. Use it as guidance.");
      return;
    }

    dispatch({
      type: "setClipProps",
      clipId: selectedClip.id,
      props: suggestion.safePatch,
    });
    setStatus(`Applied ${suggestion.variantLabel} to ${selectedClip.title}.`);
  };

  const timelineWidth = Math.max(1400, composition.durationInFrames * state.zoom * TIME_SCALE + 120);

  return (
    <div className="min-h-full w-full p-3" style={{ background: COLORS.bg }}>
      <div className="border-[4px] p-3" style={{ borderColor: COLORS.black, background: COLORS.white }}>
        <div className="mb-3 flex flex-wrap items-center gap-2 border-[3px] p-2" style={{ borderColor: COLORS.black, background: COLORS.yellow }}>
          <input type="file" multiple accept=".jpg,.jpeg,.png,.svg,.mp4,.mp3,.wav,image/*,video/mp4,audio/*" onChange={(e) => void onUpload(e)} className="text-xs font-black" />
          <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://.../asset.mp4" className="min-w-[220px] border-[2px] px-2 py-1 text-xs font-bold" style={{ borderColor: COLORS.black }} />
          <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.cyan }} onClick={() => void onAddUrl()}>Add URL</button>
          <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.violet }} onClick={addTextClip}>Add Text</button>
          <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.green }} onClick={addShapeClip}>Add Shape</button>
          <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={() => dispatch({ type: "undo" })}>Undo</button>
          <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={() => dispatch({ type: "redo" })}>Redo</button>
          <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.orange }} onClick={splitSelected}>Split</button>
          <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: state.snapping ? COLORS.blue : COLORS.white }} onClick={() => dispatch({ type: "setSnapping", enabled: !state.snapping })}>Snap</button>
          <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.pink }} onClick={() => selectedClip && dispatch({ type: "deleteClip", clipId: selectedClip.id })}>Delete</button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <div className="mb-2 border-[3px] p-2" style={{ borderColor: COLORS.black, background: COLORS.white }}>
              <div className="mb-2 text-xs font-black uppercase">Preview</div>
              <div className="relative overflow-hidden border-[3px]" style={{ borderColor: COLORS.black, aspectRatio: aspect === "16:9" ? "16 / 9" : "9 / 16", borderRadius: "10px", background: "#1e1e1e" }}>
                {visiblePreviewClips.map((clip, idx) => {
                  const w = clip.clipType === "text" ? 280 : 220;
                  const h = clip.clipType === "text" ? 72 : 120;
                  return (
                    <div
                      key={clip.id}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: `${w}px`,
                        height: `${h}px`,
                        transform: `translate(-50%, -50%) translate(${clip.x ?? 0}px, ${clip.y ?? 0}px) scale(${clip.scale ?? 1}) rotate(${clip.rotation ?? 0}deg)`,
                        background: clip.clipType === "text" ? "transparent" : clip.color,
                        color: clip.clipType === "text" ? clip.color : COLORS.black,
                        opacity: clip.opacity ?? 1,
                        border: `2px solid ${COLORS.black}`,
                        borderRadius: clip.clipType === "shape" ? "16px" : "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: clip.clipType === "text" ? "30px" : "14px",
                        zIndex: idx + 1,
                      }}
                    >
                      {clip.clipType === "text" ? (clip.text || clip.title) : clip.title}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-[3px] p-2" style={{ borderColor: COLORS.black, background: COLORS.white }}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className="text-xs font-black uppercase">Timeline</div>
                <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={() => dispatch({ type: "setPlayhead", frame: Math.max(0, state.playheadFrame - state.snapStepFrames) })}>◀</button>
                <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={() => dispatch({ type: "setPlayhead", frame: state.playheadFrame + state.snapStepFrames })}>▶</button>
                <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={() => dispatch({ type: "setZoom", zoom: state.zoom - 0.2 })}>Zoom-</button>
                <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={() => dispatch({ type: "setZoom", zoom: state.zoom + 0.2 })}>Zoom+</button>
                <span className="text-xs font-bold">Playhead: {(state.playheadFrame / state.fps).toFixed(2)}s</span>
              </div>
              <div className="overflow-x-auto" ref={timelineRef}>
                <div style={{ width: `${timelineWidth}px` }}>
                  <div
                    className="relative mb-2 h-8 border-[2px]"
                    style={{ borderColor: COLORS.black, background: "#f7f7f7" }}
                    onPointerDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const frame = Math.round((e.clientX - rect.left) / (state.zoom * TIME_SCALE));
                      dispatch({ type: "setPlayhead", frame });
                    }}
                  >
                    <div className="absolute top-0 bottom-0 w-[2px]" style={{ left: `${state.playheadFrame * state.zoom * TIME_SCALE}px`, background: COLORS.blue }} />
                  </div>
                  {trackIds.map((trackId) => {
                    const track = state.tracks.find((t) => t.id === trackId);
                    if (!track) return null;
                    const clips = state.clips.filter((c) => c.trackId === trackId).sort((a, b) => a.startFrame - b.startFrame);
                    return (
                      <div key={trackId} className="mb-2">
                        <button className="mb-1 border-[2px] px-2 py-1 text-[10px] font-black uppercase" style={{ borderColor: COLORS.black, background: selectedTrackId === trackId ? COLORS.cyan : COLORS.white }} onClick={() => setSelectedTrackId(trackId)}>
                          {track.name}
                        </button>
                        <div className="relative border-[2px]" style={{ borderColor: COLORS.black, height: `${TRACK_HEIGHT}px`, background: "#fafafa" }}>
                          {clips.map((clip) => {
                            const isSelected = clip.id === state.selectedClipId;
                            return (
                              <div
                                key={clip.id}
                                className="absolute top-[3px] bottom-[3px] border-[2px] px-2 text-[10px] font-black"
                                style={{
                                  left: `${clip.startFrame * state.zoom * TIME_SCALE}px`,
                                  width: `${Math.max(32, clipDuration(clip) * state.zoom * TIME_SCALE)}px`,
                                  borderColor: COLORS.black,
                                  background: clip.color,
                                  boxShadow: isSelected ? `0 0 0 2px ${COLORS.blue}` : "none",
                                }}
                                onPointerDown={(event) => {
                                  dispatch({ type: "selectClip", clipId: clip.id });
                                  const rect = timelineRef.current?.getBoundingClientRect();
                                  if (!rect) return;
                                  const frameAtPointer = Math.round((event.clientX - rect.left) / (state.zoom * TIME_SCALE));
                                  setDragAction({ clipId: clip.id, offsetFrame: frameAtPointer - clip.startFrame });
                                  dispatch({
                                    type: "beginPointerAction",
                                    action: { kind: "move", clipId: clip.id, startFrame: clip.startFrame, initialTrackId: clip.trackId },
                                  });
                                }}
                              >
                                <div className="truncate">{clip.title}</div>
                                <div className="absolute left-0 top-0 h-full w-[8px] cursor-w-resize" onPointerDown={(event) => {
                                  event.stopPropagation();
                                  dispatch({ type: "trimClipStart", clipId: clip.id, startFrame: state.playheadFrame });
                                }} />
                                <div className="absolute right-0 top-0 h-full w-[8px] cursor-e-resize" onPointerDown={(event) => {
                                  event.stopPropagation();
                                  dispatch({ type: "trimClipEnd", clipId: clip.id, endFrame: state.playheadFrame });
                                }} />
                              </div>
                            );
                          })}
                          <div className="absolute top-0 bottom-0 w-[2px]" style={{ left: `${state.playheadFrame * state.zoom * TIME_SCALE}px`, background: "#ff2222" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border-[3px] p-2" style={{ borderColor: COLORS.black, background: COLORS.white }}>
              <div className="mb-2 text-xs font-black uppercase">Templates</div>
              <select className="mb-2 w-full border-[2px] px-2 py-1 text-xs font-bold" style={{ borderColor: COLORS.black }} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                {LAUNCH_TEMPLATES.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
              </select>
              <button className="w-full border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.green }} onClick={applyTemplate}>Append Template</button>
            </div>

            <div className="border-[3px] p-2" style={{ borderColor: COLORS.black, background: COLORS.white }}>
              <div className="mb-2 text-xs font-black uppercase">AI Oracle (Manual)</div>
              <select
                className="mb-2 w-full border-[2px] px-2 py-1 text-xs font-bold"
                style={{ borderColor: COLORS.black }}
                value={oracleAgentId}
                onChange={(e) => setOracleAgentId(e.target.value as OracleAgentId)}
              >
                {ORACLE_AGENT_OPTIONS.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.label}</option>
                ))}
              </select>
              <textarea
                className="mb-2 h-20 w-full border-[2px] px-2 py-1 text-xs font-bold"
                style={{ borderColor: COLORS.black }}
                value={oracleObjective}
                onChange={(e) => setOracleObjective(e.target.value)}
                placeholder="What should Oracle optimize?"
              />
              <button
                className="w-full border-[2px] px-2 py-1 text-xs font-black"
                style={{ borderColor: COLORS.black, background: oracleRunning ? COLORS.white : COLORS.purple, color: oracleRunning ? COLORS.black : COLORS.white }}
                onClick={() => void runOracle()}
                disabled={oracleRunning}
              >
                {oracleRunning ? "Running..." : "Run Oracle"}
              </button>
              <button
                className="mt-2 w-full border-[2px] px-2 py-1 text-xs font-black"
                style={{ borderColor: COLORS.black, background: COLORS.white }}
                onClick={() => setShowOraclePrompt((value) => !value)}
              >
                {showOraclePrompt ? "Hide Prompt" : "Show Prompt"}
              </button>
              {showOraclePrompt && (
                <pre className="mt-2 max-h-28 overflow-auto border-[2px] p-1 text-[10px] font-bold whitespace-pre-wrap" style={{ borderColor: COLORS.black, background: "#f9f9f9" }}>
                  {oraclePrompt || "No Oracle prompt yet."}
                </pre>
              )}
              <div className="mt-2 max-h-44 overflow-auto space-y-2">
                {oracleSuggestions.length === 0 && (
                  <div className="border-[2px] p-1 text-[10px] font-bold" style={{ borderColor: COLORS.black, background: "#f9f9f9" }}>
                    Run Oracle to get suggestions.
                  </div>
                )}
                {oracleSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border-[2px] p-1 text-[10px] font-bold" style={{ borderColor: COLORS.black, background: COLORS.white }}>
                    <div>{suggestion.variantLabel} - {suggestion.estimatedImpact.toUpperCase()}</div>
                    <div>Quality: {suggestion.qualityScore}</div>
                    <div>Mode: {suggestion.suggestedMode}</div>
                    <div>{suggestion.rationaleDetail}</div>
                    <button
                      className="mt-1 w-full border-[2px] px-2 py-1 text-[10px] font-black"
                      style={{ borderColor: COLORS.black, background: suggestion.safePatch ? COLORS.cyan : COLORS.white }}
                      disabled={!suggestion.safePatch}
                      onClick={() => applyOracleSuggestion(suggestion)}
                    >
                      {suggestion.safePatch ? "Apply Safe Patch" : "Guidance Only"}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 max-h-20 overflow-auto border-[2px] p-1 text-[10px] font-bold" style={{ borderColor: COLORS.black, background: "#f9f9f9" }}>
                {oracleJobs.length === 0 && "No Oracle jobs yet."}
                {oracleJobs.map((job) => (
                  <div key={job.id}>{job.id} - {job.status}</div>
                ))}
              </div>
            </div>

            <div className="border-[3px] p-2" style={{ borderColor: COLORS.black, background: COLORS.white }}>
              <div className="mb-2 text-xs font-black uppercase">Export</div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <select className="border-[2px] px-2 py-1 text-xs font-bold" style={{ borderColor: COLORS.black }} value={aspect} onChange={(e) => setAspect(e.target.value as "16:9" | "9:16")}>
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                </select>
                <select className="border-[2px] px-2 py-1 text-xs font-bold" style={{ borderColor: COLORS.black }} value={resolutionProfile} onChange={(e) => setResolutionProfile(e.target.value as "720" | "1080" | "1k" | "2k" | "4k")}>
                  <option value="720">720</option><option value="1080">1080</option><option value="1k">1K</option><option value="2k">2K</option><option value="4k">4K</option>
                </select>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <select className="border-[2px] px-2 py-1 text-xs font-bold" style={{ borderColor: COLORS.black }} value={renderFormat} onChange={(e) => setRenderFormat(e.target.value as "mp4" | "mov" | "webp")}>
                  <option value="mp4">MP4</option>
                  <option value="mov">MOV</option>
                  <option value="webp">WEBP</option>
                </select>
                <select className="border-[2px] px-2 py-1 text-xs font-bold" style={{ borderColor: COLORS.black }} value={renderMode} onChange={(e) => setRenderMode(e.target.value as "realtime" | "quality" | "frame-perfect")}>
                  <option value="realtime">Realtime</option>
                  <option value="quality">Quality</option>
                  <option value="frame-perfect">Frame-Perfect</option>
                </select>
                <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.orange }} onClick={() => void queueRender()}>Queue Render</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={saveProject}>Save JSON</button>
                <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={() => loadRef.current?.click()}>Load JSON</button>
                <button className="border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: COLORS.white }} onClick={exportRemotionJob}>Save Remotion Job</button>
                <input ref={loadRef} type="file" accept="application/json" onChange={(e) => void loadProject(e)} className="hidden" />
              </div>
              <div className="mt-2 max-h-28 overflow-auto border-[2px] p-1 text-[10px] font-bold" style={{ borderColor: COLORS.black, background: "#f9f9f9" }}>
                {renderJobs.length === 0 && "No render jobs yet."}
                {renderJobs.map((j) => (
                  <div key={j.jobId} className="mb-1 border-b pb-1" style={{ borderColor: "#00000033" }}>
                    <div>{j.jobId} - {j.status}</div>
                    {typeof j.progress === "number" && <div>{Math.round(j.progress * 100)}%</div>}
                    {j.outputUrl && <a className="underline" href={j.outputUrl} target="_blank" rel="noreferrer">download</a>}
                    {j.error && <div className="text-red-700">{j.error}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-[3px] p-2" style={{ borderColor: COLORS.black, background: COLORS.white }}>
              <div className="mb-2 text-xs font-black uppercase">Inspector</div>
              {!selectedClip && <div className="text-xs font-bold">Select a clip.</div>}
              {selectedClip && (
                <div className="space-y-2 text-xs font-bold">
                  <input className="w-full border-[2px] px-2 py-1" style={{ borderColor: COLORS.black }} value={selectedClip.title} onChange={(e) => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { title: e.target.value } })} />
                  {selectedClip.clipType === "text" && (
                    <textarea className="w-full border-[2px] px-2 py-1" style={{ borderColor: COLORS.black }} value={selectedClip.text ?? ""} onChange={(e) => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { text: e.target.value } })} />
                  )}
                  <label className="block">Placement X <input type="range" min={-500} max={500} value={selectedClip.x ?? 0} onChange={(e) => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { x: Number(e.target.value) } })} className="w-full" /></label>
                  <label className="block">Placement Y <input type="range" min={-500} max={500} value={selectedClip.y ?? 0} onChange={(e) => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { y: Number(e.target.value) } })} className="w-full" /></label>
                  <label className="block">Scale <input type="range" min={0.1} max={4} step={0.05} value={selectedClip.scale ?? 1} onChange={(e) => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { scale: Number(e.target.value) } })} className="w-full" /></label>
                  <label className="block">Rotation <input type="range" min={-360} max={360} value={selectedClip.rotation ?? 0} onChange={(e) => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { rotation: Number(e.target.value) } })} className="w-full" /></label>
                  <label className="block">Opacity <input type="range" min={0} max={1} step={0.01} value={selectedClip.opacity ?? 1} onChange={(e) => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { opacity: Number(e.target.value) } })} className="w-full" /></label>
                  {selectedClip.kind === "audio" && (
                    <>
                      <label className="block">Volume <input type="range" min={0} max={1} step={0.01} value={selectedClip.volume ?? 1} onChange={(e) => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { volume: Number(e.target.value) } })} className="w-full" /></label>
                      <button className="w-full border-[2px] px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.black, background: (selectedClip.muted ?? false) ? COLORS.pink : COLORS.white }} onClick={() => dispatch({ type: "setClipProps", clipId: selectedClip.id, props: { muted: !(selectedClip.muted ?? false) } })}>
                        {(selectedClip.muted ?? false) ? "Unmute" : "Mute"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {status && <div className="mt-2 text-xs font-black">{status}</div>}
      </div>
    </div>
  );
};
