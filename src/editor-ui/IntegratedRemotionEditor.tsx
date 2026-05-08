import React, { useEffect, useMemo, useRef, useState } from "react"
import { useBrain } from "../context/useBrain"
import { generateTimelinePatch } from "../services/gemini"
import {
 FEATURE_REGISTRY,
 applyAIPatchPlan,
 applyTimelineCommand,
 buildBasicSvgFrame,
 buildHtmlPackage,
 buildProjectJson,
 completeExportJob,
 createExportJob,
 createMediaAssetFromFile,
 createTimelineState,
 getAdjacentClipOnTrack,
 timelineToComposition,
 type AIProviderAdapter,
 type CompositionBinding,
 type EditorClip,
 type EditorKeyframe,
 type ExportJob,
 type MediaAsset,
 type RenderFormat,
 type TimelineState,
} from "../editor-core"
import { buildRemotionParityReport, type RemotionParityReport } from "../services/remotionParity"

interface Props {
 mode?: "embedded" | "full"
}

interface DragAction {
 type: "move" | "trim-start" | "trim-end" | "keyframe"
 clipId?: string
 keyframeId?: string
 pointerId: number
 offsetFrame?: number
}

const TRACK_ORDER = ["video-1", "image-1", "text-1", "audio-1"] as const
const TRACK_HEIGHT = 44
const COLLAPSED_HEIGHT = 6

const defaultBinding: CompositionBinding = {
 compositionId: "viewtube-editor",
 width: 1080,
 height: 1920,
 fps: 30,
 durationInFrames: 300,
}

// Launch Configuration:
// Ensure VITE_APP_ENV is set to 'production' in Vercel
const IS_PROD = import.meta.env.VITE_APP_ENV === "production"
const API_BASE = IS_PROD ? "https://api.viewtubex.com" : "http://localhost:3000"

const COLOR_SWATCHES = [
 "#00FF00",
 "#FF00FF",
 "#70d6ff",
 "#fff070",
 "#ff8fb3",
 "#c970ff",
]

const getTrackForY = (
 y: number,
 trackHeights: Record<string, number>,
): string => {
 let cursor = 0
 for (const trackId of TRACK_ORDER) {
  const height = trackHeights[trackId] ?? TRACK_HEIGHT
  if (y >= cursor && y <= cursor + height) return trackId
  cursor += height + 8
 }
 return "video-1"
}

const formatFrameTime = (frame: number, fps: number): string =>
 `${(frame / fps).toFixed(2)}s`

export const IntegratedRemotionEditor: React.FC<Props> = ({
 mode = "embedded",
}) => {
 const { brain } = useBrain()
 const [state, setState] = useState<TimelineState>(() => {
  let next = createTimelineState(30)
  next = applyTimelineCommand(next, {
   type: "insertClip",
   clip: {
    id: "seed-video",
    trackId: "video-1",
    kind: "video",
    sourceId: "seed",
    title: "Seed Clip",
    color: "#00FF00",
    startFrame: 0,
    endFrame: 120,
    speed: 1,
    groupedWithNext: false,
    keyframeIds: [],
    effectIds: [],
   },
  })
  return next
 })
 const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
 const [prompt, setPrompt] = useState("")
 const [isThinking, setIsThinking] = useState(false)
 const [patchStatus, setPatchStatus] = useState<string | null>(null)
 const [dragAction, setDragAction] = useState<DragAction | null>(null)
 const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
 const [selectedTrackId, setSelectedTrackId] = useState<string>("video-1")
 const [showMediaPanel, setShowMediaPanel] = useState(true)
 const [showAiPanel, setShowAiPanel] = useState(false)
 const [showExportPanel, setShowExportPanel] = useState(false)
 const [jobs, setJobs] = useState<ExportJob[]>([])
 const [pendingPatch, setPendingPatch] = useState<AIPatchPlan | null>(null)
 const [contextMenu, setContextMenu] = useState<{
  x: number
  y: number
  clipId: string
 } | null>(null)
 const [exportFormat, setExportFormat] = useState<RenderFormat>("mp4")
 const [parityReport, setParityReport] = useState<RemotionParityReport | null>(null)
 const [showParityPanel, setShowParityPanel] = useState(false)

 const timelineRef = useRef<HTMLDivElement | null>(null)
 const holdTimerRef = useRef<number | null>(null)

 const composition = useMemo(
  () => timelineToComposition(state, defaultBinding),
  [state],
 )

 const clipKeyframes = useMemo(() => {
  const byClip = new Map<string, EditorKeyframe[]>()
  state.keyframes.forEach((keyframe) => {
   const list = byClip.get(keyframe.clipId) ?? []
   list.push(keyframe)
   byClip.set(keyframe.clipId, list)
  })
  return byClip
 }, [state.keyframes])

 const trackHeights = useMemo(() => {
  const map: Record<string, number> = {}
  state.tracks.forEach((track) => {
   map[track.id] =
    track.viewportState === "collapsed-thread" ? COLLAPSED_HEIGHT : TRACK_HEIGHT
  })
  return map
 }, [state.tracks])

 const dispatch = (
  command: Parameters<typeof applyTimelineCommand>[1],
 ): void => {
  setState((prev) => applyTimelineCommand(prev, command))
 }

 const selectedClip =
  state.clips.find((clip) => clip.id === state.selectedClipId) ?? null

 useEffect(() => {
  const keyDown = (event: KeyboardEvent): void => {
   setActiveKeys((prev) => new Set(prev).add(event.key))
   if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault()
    dispatch({ type: event.shiftKey ? "redo" : "undo" })
   }
   if (event.key === "Delete" && state.selectedClipId) {
    dispatch({ type: "deleteClip", clipId: state.selectedClipId })
   }
  }

  const keyUp = (event: KeyboardEvent): void => {
   setActiveKeys((prev) => {
    const next = new Set(prev)
    next.delete(event.key)
    return next
   })
  }

  window.addEventListener("keydown", keyDown)
  window.addEventListener("keyup", keyUp)
  return () => {
   window.removeEventListener("keydown", keyDown)
   window.removeEventListener("keyup", keyUp)
  }
 }, [state.selectedClipId])

 useEffect(() => {
  const rangeEnd = state.playheadFrame + Math.floor(300 / state.zoom)
  state.tracks.forEach((track) => {
   const hasVisible = state.clips.some(
    (clip) =>
     clip.trackId === track.id &&
     !(clip.endFrame < state.playheadFrame || clip.startFrame > rangeEnd),
   )
   const desired = hasVisible ? "normal" : "collapsed-thread"
   if (track.viewportState !== desired) {
    dispatch({
     type: "setTrackViewportState",
     trackId: track.id,
     viewportState: desired,
    })
   }
  })
 }, [state.playheadFrame, state.zoom, state.clips, state.tracks])

 useEffect(() => {
  const move = (event: PointerEvent): void => {
   if (!dragAction || !timelineRef.current) return
   const rect = timelineRef.current.getBoundingClientRect()
   const localX = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
   const frame = Math.max(0, Math.round(localX / state.zoom))

   if (dragAction.type === "keyframe" && dragAction.keyframeId) {
    const keyframe = state.keyframes.find(
     (item) => item.id === dragAction.keyframeId,
    )
    if (!keyframe) return
    dispatch({ type: "setKeyframe", keyframe: { ...keyframe, frame } })
    return
   }

   if (!dragAction.clipId) return
   const clip = state.clips.find((item) => item.id === dragAction.clipId)
   if (!clip) return

   if (dragAction.type === "trim-start") {
    dispatch({ type: "trimClipStart", clipId: clip.id, startFrame: frame })
    return
   }
   if (dragAction.type === "trim-end") {
    dispatch({ type: "trimClipEnd", clipId: clip.id, endFrame: frame })
    return
   }

   const localY = Math.max(0, event.clientY - rect.top - 36)
   const targetTrackId = getTrackForY(localY, trackHeights)
   const duration = clip.endFrame - clip.startFrame
   const offset = dragAction.offsetFrame ?? 0
   const startFrame = frame - offset

   const selectedIds = new Set(state.selectedClipIds);
   if (clip.groupedWithNext) {
       const next = state.clips.find(c => c.trackId === clip.trackId && Math.abs(c.startFrame - clip.endFrame) < 2);
       if (next) selectedIds.add(next.id);
   }
   // Also check if previous clip is linked to this one
   const prev = state.clips.find(c => c.trackId === clip.trackId && Math.abs(clip.startFrame - c.endFrame) < 2 && c.groupedWithNext);
   if (prev) selectedIds.add(prev.id);

   if (selectedIds.size > 1 || selectedIds.has(clip.id)) {
    const moves = Array.from(selectedIds).map(id => {
        const c = state.clips.find(item => item.id === id);
        if (!c) return null;
        const clipOffset = c.startFrame - clip.startFrame;
        return {
            clipId: c.id,
            trackId: c.id === clip.id ? targetTrackId : c.trackId,
            startFrame: startFrame + clipOffset,
            endFrame: startFrame + clipOffset + (c.endFrame - c.startFrame)
        };
    }).filter(Boolean) as any[];
    dispatch({ type: "moveClips", moves });
   } else {
    dispatch({
     type: "moveClip",
     clipId: clip.id,
     trackId: targetTrackId,
     startFrame,
     endFrame: startFrame + duration,
    })
   }
  }

  const up = (): void => {
   if (!dragAction) return
   setDragAction(null)
   if (holdTimerRef.current) {
    window.clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
   }
   dispatch({ type: "commitPointerAction" })
  }

  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", up)
  return () => {
   window.removeEventListener("pointermove", move)
   window.removeEventListener("pointerup", up)
  }
 }, [dragAction, state.zoom, state.clips, state.keyframes, trackHeights])

 const beginMoveWithHold = (
  event: React.PointerEvent,
  clip: EditorClip,
 ): void => {
  event.preventDefault()
  
  if (event.metaKey || event.ctrlKey || event.shiftKey) {
    const nextIds = new Set(state.selectedClipIds);
    if (nextIds.has(clip.id)) nextIds.delete(clip.id);
    else nextIds.add(clip.id);
    dispatch({ type: "selectClips", clipIds: Array.from(nextIds) });
  } else {
    if (!state.selectedClipIds.includes(clip.id)) {
        dispatch({ type: "selectClip", clipId: clip.id })
    }
  }

  if (activeKeys.has("ArrowDown")) {
   const deleteSide =
    activeKeys.has("ArrowLeft") ? "left"
    : activeKeys.has("ArrowRight") ? "right"
    : "none"
   dispatch({
    type: "arrowCut",
    clipId: clip.id,
    frame: state.playheadFrame,
    deleteSide,
   })
   return
  }

  const rect = timelineRef.current?.getBoundingClientRect()
  if (!rect) return
  const frameAtPointer = Math.round((event.clientX - rect.left) / state.zoom)
  holdTimerRef.current = window.setTimeout(() => {
   setDragAction({
    type: "move",
    clipId: clip.id,
    pointerId: event.pointerId,
    offsetFrame: frameAtPointer - clip.startFrame,
   })
   dispatch({
    type: "beginPointerAction",
    action: {
     kind: "move",
     clipId: clip.id,
     startFrame: clip.startFrame,
     initialTrackId: clip.trackId,
    },
   })
  }, 250)
 }

 const beginTrim = (
  event: React.PointerEvent,
  clip: EditorClip,
  side: "start" | "end",
 ): void => {
  event.preventDefault()
  event.stopPropagation()
  if (holdTimerRef.current) {
   window.clearTimeout(holdTimerRef.current)
   holdTimerRef.current = null
  }
  setDragAction({
   type: side === "start" ? "trim-start" : "trim-end",
   clipId: clip.id,
   pointerId: event.pointerId,
  })
  dispatch({
   type: "beginPointerAction",
   action: {
    kind: side === "start" ? "trim-start" : "trim-end",
    clipId: clip.id,
    startFrame: side === "start" ? clip.startFrame : clip.endFrame,
   },
  })
 }

 const beginKeyframeDrag = (
  event: React.PointerEvent,
  keyframe: EditorKeyframe,
 ): void => {
  event.stopPropagation()
  setDragAction({
   type: "keyframe",
   keyframeId: keyframe.id,
   pointerId: event.pointerId,
  })
  dispatch({
   type: "beginPointerAction",
   action: {
    kind: "keyframe",
    clipId: keyframe.clipId,
    startFrame: keyframe.frame,
   },
  })
 }

 const addManualClip = (kind: EditorClip["kind"]) => {
  const id = `clip-${Date.now()}`
  dispatch({
   type: "insertClip",
   clip: {
    id,
    trackId: kind === "audio" ? "audio-1" : selectedTrackId,
    kind,
    sourceId: `manual-${kind}`,
    title: `Manual ${kind}`,
    color: kind === "audio" ? "#70d6ff" : "#FF00FF",
    startFrame: state.playheadFrame,
    endFrame: state.playheadFrame + state.fps * 2,
    speed: 1,
    groupedWithNext: false,
    keyframeIds: [],
    effectIds: [],
   },
  })
 }

 const addKeyframeAtPlayhead = (clip: EditorClip): void => {
  dispatch({
   type: "setKeyframe",
   keyframe: {
    id: `kf-${Date.now()}`,
    clipId: clip.id,
    frame: state.playheadFrame,
    easing: "easeInOut",
    value: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
   },
  })
 }

 const onMediaUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
 ): Promise<void> => {
  const files = Array.from(event.target.files ?? [])
  for (const file of files) {
   try {
    const asset = await createMediaAssetFromFile(file)
    setMediaAssets((prev) => [asset, ...prev])
    dispatch({
     type: "insertClip",
     clip: {
      id: `clip-${asset.id}`,
      trackId: asset.kind === "audio" ? "audio-1" : selectedTrackId,
      kind: asset.kind,
      sourceId: asset.id,
      title: asset.name,
      color: asset.kind === "audio" ? "#70d6ff" : "#fff070",
      startFrame: state.playheadFrame,
      endFrame:
       state.playheadFrame +
       (asset.kind === "image" ? state.fps * 3 : state.fps * 2),
      speed: 1,
      groupedWithNext: false,
      keyframeIds: [],
      effectIds: [],
     },
    })
   } catch (error) {
    setPatchStatus(`Upload rejected: ${(error as Error).message}`)
   }
  }
  event.target.value = ""
 }

 const applyAiPatch = async (): Promise<void> => {
  if (!prompt.trim()) return
  setIsThinking(true)
  setPatchStatus("Consulting the Brain...")
  try {
   const plan = await generateTimelinePatch(prompt, state, brain)
   setPendingPatch(plan)
   setPatchStatus(`AI proposed: ${plan.reason}`)
  } catch (error) {
   setPatchStatus(`Error: ${(error as Error).message}`)
  } finally {
   setIsThinking(false)
  }
 }

 const commitPendingPatch = (): void => {
     if (!pendingPatch) return;
     const result = applyAIPatchPlan(state, pendingPatch)
     if (!result.validation.valid) {
      setPatchStatus(`Patch rejected: ${result.validation.issues.join(", ")}`)
      setPendingPatch(null)
      return
     }
     setState(result.state)
     setPatchStatus(`Applied: ${pendingPatch.reason}`)
     setPendingPatch(null)
 }

 const runExport = (): void => {
  const job = createExportJob(
   { format: exportFormat, presetId: "default" },
   "viewtube-export",
  )
  let payload = ""
  if (exportFormat === "json") payload = buildProjectJson(state)
  if (exportFormat === "html")
   payload = buildHtmlPackage(buildProjectJson(state))
  if (exportFormat === "svg") payload = buildBasicSvgFrame(state)
  if (!payload) {
   payload = JSON.stringify({
    note: "Artifact requires renderer worker",
    format: exportFormat,
   })
  }

  const mimeType =
   exportFormat === "html" ? "text/html"
   : exportFormat === "svg" ? "image/svg+xml"
   : "application/json"
  const blob = new Blob([payload], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const completed = completeExportJob(job, url)
  setJobs((prev) => [completed, ...prev])
 }

 const adjacent =
  selectedClip ? getAdjacentClipOnTrack(state, selectedClip.id) : {}

 return (
  <div
   className={`min-h-full w-full bg-[#f0f0f4] text-black ${mode === "full" ? "p-4" : "p-3"}`}>
   <div className="border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
    <div className="flex items-center justify-between border-b-[4px] border-black bg-[#fff070] p-3">
     <div>
      <div className="text-lg font-black uppercase tracking-tight">
       ViewTube VIDX Editor
      </div>
      <div className="text-[10px] font-bold uppercase">
       CLINE_VIDX_V1 + CLINE_VIDX_V2 baseline
      </div>
     </div>
     <div className="flex items-center gap-2">
      <button
       className="border-[3px] border-black bg-white px-3 py-1 text-xs font-black"
       onClick={() => dispatch({ type: "undo" })}>
       Undo
      </button>
      <button
       className="border-[3px] border-black bg-white px-3 py-1 text-xs font-black"
       onClick={() => dispatch({ type: "redo" })}>
       Redo
      </button>
      <button
       className="border-[3px] border-black bg-white px-3 py-1 text-xs font-black"
       onClick={() =>
        dispatch({ type: "setSnapping", enabled: !state.snapping })
       }>
       Snap: {state.snapping ? "On" : "Off"}
      </button>
      <button
       className="border-[3px] border-black bg-white px-3 py-1 text-xs font-black"
       onClick={() => dispatch({ type: "setZoom", zoom: state.zoom - 0.25 })}>
       Zoom -
      </button>
      <button
       className="border-[3px] border-black bg-white px-3 py-1 text-xs font-black"
       onClick={() => dispatch({ type: "setZoom", zoom: state.zoom + 0.25 })}>
       Zoom +
      </button>
      <button
       className={`border-[3px] border-black px-3 py-1 text-xs font-black ${parityReport?.summary.parity === "warn" ? "bg-[#ff8fb3]" : "bg-white"}`}
       onClick={() => {
         const report = buildRemotionParityReport(state, composition);
         setParityReport(report);
         setShowParityPanel(true);
       }}>
       Parity {parityReport ? `(${parityReport.summary.parity.toUpperCase()})` : "Check"}
      </button>
     </div>
    </div>

    {showParityPanel && parityReport && (
      <div className="border-b-[4px] border-black bg-[#f9f9ff] p-3">
        <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-black uppercase">Parity Diagnostics Dashboard</div>
            <button className="text-[10px] font-bold underline" onClick={() => setShowParityPanel(false)}>Close</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
            <div className={`border-[2px] border-black p-2 bg-white ${parityReport.summary.parity === "warn" ? "border-[#ff0000]" : ""}`}>
                <div className="text-[10px] font-black uppercase mb-1">Status</div>
                <div className={`text-lg font-black ${parityReport.summary.parity === "warn" ? "text-[#ff0000]" : "text-[#00aa00]"}`}>
                    {parityReport.summary.parity.toUpperCase()}
                </div>
                <div className="text-[9px] font-bold">{parityReport.summary.totalIssues} issues found</div>
            </div>
            <div className="border-[2px] border-black p-2 bg-white col-span-2">
                <div className="text-[10px] font-black uppercase mb-1">Drift Details</div>
                <div className="max-h-24 overflow-auto text-[9px] font-bold">
                    {parityReport.frameDrift.map((d, i) => (
                        <div key={i} className="mb-1">🔴 Timing Drift: Clip {d.clipId} (Exp: {d.expected}, Act: {d.actual})</div>
                    ))}
                    {parityReport.easingMismatches.map((d, i) => (
                        <div key={i} className="mb-1">🟡 Easing Mismatch: Clip {d.clipId} (Exp: {d.expected}, Act: {d.actual})</div>
                    ))}
                    {parityReport.summary.totalIssues === 0 && "All systems nominal. Visual parity confirmed."}
                </div>
            </div>
        </div>
      </div>
    )}

    <div className="grid gap-0 lg:grid-cols-[280px_1fr_300px]">
     <div className="border-r-[4px] border-black bg-[#f9f9ff] p-3">
      <button
       className="mb-2 w-full border-[3px] border-black bg-[#85ff85] p-2 text-xs font-black"
       onClick={() => setShowMediaPanel((v) => !v)}>
       Media {showMediaPanel ? "Hide" : "Show"}
      </button>
      {showMediaPanel && (
       <div className="mb-3 border-[3px] border-black bg-white p-2">
        <div className="mb-2 text-[11px] font-black uppercase">Uploader</div>
        <input
         type="file"
         multiple
         accept=".jpg,.jpeg,.png,.svg,.mp4,.mp3,.wav,image/*,video/mp4,audio/*"
         onChange={(event) => void onMediaUpload(event)}
         className="mb-2 w-full text-[11px] font-bold"
        />
        <div className="grid grid-cols-2 gap-1">
         <button
          className="border-[2px] border-black bg-[#ff8fb3] p-1 text-[10px] font-black"
          onClick={() => addManualClip("video")}>
          + Video
         </button>
         <button
          className="border-[2px] border-black bg-[#fff070] p-1 text-[10px] font-black"
          onClick={() => addManualClip("image")}>
          + Image
         </button>
         <button
          className="border-[2px] border-black bg-[#c970ff] p-1 text-[10px] font-black text-white"
          onClick={() => addManualClip("text")}>
          + Text
         </button>
         <button
          className="border-[2px] border-black bg-[#70d6ff] p-1 text-[10px] font-black"
          onClick={() => addManualClip("audio")}>
          + Audio
         </button>
        </div>
        <div className="mt-2 max-h-28 overflow-auto border-[2px] border-black bg-[#fafafa] p-1 text-[10px] font-bold">
         {mediaAssets.length === 0 ?
          "No imported assets"
         : mediaAssets.map((asset) => <div key={asset.id}>{asset.name}</div>)}
        </div>
       </div>
      )}

      <button
       className="mb-2 w-full border-[3px] border-black bg-[#ff8fb3] p-2 text-xs font-black"
       onClick={() => setShowAiPanel((v) => !v)}>
       AI {showAiPanel ? "Hide" : "Show"}
      </button>
      {showAiPanel && (
       <div className="mb-3 border-[3px] border-black bg-white p-2">
        <textarea
         value={prompt}
         onChange={(event) => setPrompt(event.target.value)}
         placeholder="Describe your edit (e.g. 'Add a high-energy intro')"
         className="mb-2 h-24 w-full border-[2px] border-black p-1 text-xs"
        />
        <button
         className={`w-full border-[2px] border-black p-2 text-xs font-black text-white flex items-center justify-center gap-2 ${isThinking ? "bg-gray-500" : "bg-[#ff00ff]"}`}
         onClick={() => void applyAiPatch()}
         disabled={isThinking}>
         {isThinking && (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
         )}
         {isThinking ? "PROCESSING..." : "Apply AI Patch"}
        </button>
        {pendingPatch && (
            <div className="mt-3 border-[2px] border-black bg-[#fff070] p-2 text-[10px]">
                <div className="font-black uppercase mb-1">Proposed Changes</div>
                <div className="mb-2 italic">"{pendingPatch.reason}"</div>
                <div className="space-y-1 mb-2 max-h-32 overflow-auto font-bold">
                    {pendingPatch.operations.map((op, i) => (
                        <div key={i} className="border-b border-black/10 pb-1">
                            • {op.op === "insertClip" ? `Insert ${op.clip.kind} "${op.clip.title}"` : 
                               op.op === "moveClip" ? `Move clip ${op.clipId} to frame ${op.startFrame}` :
                               op.op === "deleteClip" ? `Delete clip ${op.clipId}` :
                               op.op === "setClipProps" ? `Update properties for ${op.clipId}` :
                               op.op}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        className="border-[2px] border-black bg-[#85ff85] p-1 font-black"
                        onClick={commitPendingPatch}
                    >
                        APPROVE
                    </button>
                    <button 
                        className="border-[2px] border-black bg-white p-1 font-black"
                        onClick={() => setPendingPatch(null)}
                    >
                        REJECT
                    </button>
                </div>
            </div>
        )}
        <div className="mt-1 text-[10px] font-bold">
         {patchStatus ?? "Describe an edit to start."}
        </div>
       </div>
      )}

      <button
       className="mb-2 w-full border-[3px] border-black bg-[#70d6ff] p-2 text-xs font-black"
       onClick={() => setShowExportPanel((v) => !v)}>
       Export {showExportPanel ? "Hide" : "Show"}
      </button>
      {showExportPanel && (
       <div className="border-[3px] border-black bg-white p-2">
        <div className="mb-2 text-[11px] font-black uppercase">
         Export Engine
        </div>
        <select
         className="mb-2 w-full border-[2px] border-black p-1 text-xs font-bold"
         value={exportFormat}
         onChange={(event) =>
          setExportFormat(event.target.value as RenderFormat)
         }>
         <option value="mp4">MP4</option>
         <option value="mov">MOV</option>
         <option value="wav">WAV (J sound profile)</option>
         <option value="svg">SVG</option>
         <option value="gif">GIF</option>
         <option value="png-sequence">PNG sequence</option>
         <option value="json">JSON</option>
         <option value="html">HTML package</option>
        </select>
        <button
         className="mb-2 w-full border-[2px] border-black bg-[#85ff85] p-2 text-xs font-black"
         onClick={runExport}>
         Queue Export
        </button>
        <div className="max-h-24 overflow-auto border-[2px] border-black bg-[#fafafa] p-1 text-[10px] font-bold">
         {jobs.map((job) => (
          <div key={job.id} className="mb-1 border-b border-black/20 pb-1">
           <div>
            {job.request.format.toUpperCase()} - {job.status}
           </div>
           {job.artifacts[0]?.downloadUrl && (
            <a
             href={job.artifacts[0].downloadUrl}
             download={job.artifacts[0].filename}
             className="underline">
             download
            </a>
           )}
          </div>
         ))}
         {jobs.length === 0 && "No exports yet"}
        </div>
       </div>
      )}
     </div>

     <div className="min-w-0 p-3">
      <div className="mb-2 border-[3px] border-black bg-[#1a1a1a] p-3 text-white">
       <div className="text-xs font-black uppercase">Preview</div>
       <div className="mt-2 aspect-video border-[3px] border-black bg-[#f0f0f4] p-2">
        <div className="mb-1 text-[10px] font-bold text-black">
         Playhead: {formatFrameTime(state.playheadFrame, state.fps)}
        </div>
        <div className="grid h-[calc(100%-20px)] gap-2 overflow-hidden">
         {state.clips
          .filter(
           (clip) =>
            clip.startFrame <= state.playheadFrame &&
            clip.endFrame >= state.playheadFrame,
          )
          .map((clip) => (
           <div
            key={clip.id}
            className="flex items-center justify-center border-[3px] border-black text-[11px] font-black"
            style={{ background: clip.color }}>
            {clip.title}
           </div>
          ))}
        </div>
       </div>
      </div>

      <div className="border-[3px] border-black bg-white">
       <div className="flex items-center justify-between border-b-[3px] border-black bg-[#fff070] p-2">
        <div className="text-xs font-black uppercase">Timeline</div>
        <div className="flex items-center gap-2 text-[10px] font-bold">
         <span>Arrow Cut: hold ↓ + click clip (←/→ deletes side)</span>
         <button
          className="border-[2px] border-black bg-white px-2 py-1"
          onClick={() =>
           dispatch({
            type: "setPlayhead",
            frame: Math.max(0, state.playheadFrame - state.snapStepFrames),
           })
          }>
          ◀
         </button>
         <button
          className="border-[2px] border-black bg-white px-2 py-1"
          onClick={() =>
           dispatch({
            type: "setPlayhead",
            frame: state.playheadFrame + state.snapStepFrames,
           })
          }>
          ▶
         </button>
        </div>
       </div>

       <div className="relative overflow-x-auto p-2" ref={timelineRef}>
        <div
         style={{
          width: `${Math.max(1200, composition.durationInFrames * state.zoom + 200)}px`,
         }}>
         <div
          className="relative mb-2 h-8 border-[2px] border-black bg-[#f4f4f4]"
          onDoubleClick={(event) => {
           const rect = event.currentTarget.getBoundingClientRect()
           const frame = Math.round((event.clientX - rect.left) / state.zoom)
           dispatch({ type: "setPlayhead", frame })
          }}>
          <div
           className="absolute bottom-0 top-0 w-[2px] bg-[#1a7bff]"
           style={{ left: `${state.playheadFrame * state.zoom}px` }}
          />
         </div>

         {TRACK_ORDER.map((trackId) => {
          const track = state.tracks.find((item) => item.id === trackId)
          if (!track) return null
          const clips = state.clips
           .filter((clip) => clip.trackId === track.id)
           .sort((a, b) => a.startFrame - b.startFrame)
          const rowHeight = trackHeights[track.id] ?? TRACK_HEIGHT
          return (
           <div key={track.id} className="mb-2">
            <button
             className="mb-1 border-[2px] border-black bg-[#f9f9ff] px-2 py-1 text-[10px] font-black uppercase"
             onClick={() => setSelectedTrackId(track.id)}>
             {track.name} {selectedTrackId === track.id ? "(active)" : ""}
            </button>
            <div
             className="relative border-[2px] border-black bg-[#fafafa]"
             style={{ height: `${rowHeight}px` }}>
             {clips.map((clip) => {
              const keyframes = clipKeyframes.get(clip.id) ?? []
              const isSelected = state.selectedClipIds.includes(clip.id)
              return (
               <div
                key={clip.id}
                className={`absolute top-[3px] bottom-[3px] border-[3px] border-black px-3 text-[10px] font-black shadow-[2px_2px_0px_0px_black] ${isSelected ? "ring-2 ring-white" : ""}`}
                style={{
                 left: `${clip.startFrame * state.zoom}px`,
                 width: `${Math.max(28, (clip.endFrame - clip.startFrame) * state.zoom)}px`,
                 background: clip.color,
                 zIndex: isSelected ? 30 : 10,
                }}
                onPointerDown={(event) => beginMoveWithHold(event, clip)}
                onDoubleClick={(event) => {
                 event.stopPropagation()
                 setContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  clipId: clip.id,
                 })
                }}>
                <div className="truncate">{clip.title}</div>
                <div
                 className="absolute left-0 top-0 h-full w-2 cursor-w-resize"
                 onPointerDown={(event) => beginTrim(event, clip, "start")}
                />
                <div
                 className="absolute right-0 top-0 h-full w-2 cursor-e-resize"
                 onPointerDown={(event) => beginTrim(event, clip, "end")}
                />
                {keyframes.map((keyframe) => (
                 <div
                  key={keyframe.id}
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-2 border-black bg-white"
                  style={{
                   left: `${(keyframe.frame - clip.startFrame) * state.zoom - 6}px`,
                  }}
                  onPointerDown={(event) => beginKeyframeDrag(event, keyframe)}
                 />
                ))}
               </div>
              )
             })}
             {clips.map((clip, i) => {
                 const next = clips[i+1];
                 if (!next) return null;
                 if (Math.abs(next.startFrame - clip.endFrame) > 2) return null;
                 const transition = state.transitions.find(t => t.fromClipId === clip.id);
                 return (
                     <div 
                        key={`seam-${clip.id}`}
                        className={`absolute top-0 bottom-0 w-4 -ml-2 cursor-pointer z-40 flex items-center justify-center`}
                        style={{ left: `${clip.endFrame * state.zoom}px` }}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Cycle seam kind: Cut -> Group -> Transition
                            if (clip.groupedWithNext) {
                                dispatch({ type: "groupSeam", clipId: clip.id, enabled: false });
                                dispatch({ type: "setTransition", transition: { id: `tr-${clip.id}`, fromClipId: clip.id, toClipId: next.id, type: "crossfade", durationInFrames: 15 } });
                            } else if (transition) {
                                dispatch({ type: "setTransition", transition: { id: `tr-${clip.id}`, fromClipId: clip.id, toClipId: next.id, type: "none", durationInFrames: 0 } });
                            } else {
                                dispatch({ type: "groupSeam", clipId: clip.id, enabled: true });
                            }
                        }}
                     >
                         <div className={`w-1 h-3/4 border-x border-black ${clip.groupedWithNext ? "bg-[#85ff85]" : transition ? "bg-[#70d6ff]" : "bg-black/20"}`} />
                     </div>
                 )
             })}
             <div
              className="absolute bottom-0 top-0 w-[2px] bg-[#1a7bff]"
              style={{ left: `${state.playheadFrame * state.zoom}px` }}
             />
            </div>
           </div>
          )
         })}
        </div>
       </div>
      </div>
     </div>

     <div className="border-l-[4px] border-black bg-[#f9f9ff] p-3">
      <div className="mb-2 text-xs font-black uppercase">Inspector</div>
      {!selectedClip && (
       <div className="border-[2px] border-black bg-white p-2 text-[11px] font-bold">
        Select a clip to reveal settings.
       </div>
      )}
      {selectedClip && (
       <div className="space-y-2 border-[2px] border-black bg-white p-2 text-[11px] font-bold">
        <div>{selectedClip.title}</div>
        <div>Track: {selectedClip.trackId}</div>
        <div>
         {formatFrameTime(selectedClip.startFrame, state.fps)} -{" "}
         {formatFrameTime(selectedClip.endFrame, state.fps)}
        </div>
        <label className="block">
         Speed
         <input
          type="range"
          min="0.1"
          max="4"
          step="0.1"
          value={selectedClip.speed}
          onChange={(event) =>
           dispatch({
            type: "setClipSpeed",
            clipId: selectedClip.id,
            speed: Number(event.target.value),
           })
          }
          className="w-full"
         />
        </label>
        <button
         className="w-full border-[2px] border-black bg-[#fff070] p-1 text-[10px] font-black"
         onClick={() => addKeyframeAtPlayhead(selectedClip)}>
         Add Keyframe at Playhead
        </button>
        <button
         className="w-full border-[2px] border-black bg-[#ff8fb3] p-1 text-[10px] font-black"
         onClick={() =>
          dispatch({
           type: "groupSeam",
           clipId: selectedClip.id,
           enabled: !selectedClip.groupedWithNext,
          })
         }>
         Seam Group: {selectedClip.groupedWithNext ? "On" : "Off"}
        </button>
        {adjacent.right && (
         <select
          className="w-full border-[2px] border-black p-1 text-[10px] font-black"
          onChange={(event) =>
           dispatch({
            type: "setTransition",
            transition: {
             id: `tr-${selectedClip.id}`,
             fromClipId: selectedClip.id,
             toClipId: adjacent.right!.id,
             type: event.target.value as
              | "none"
              | "crossfade"
              | "wipe"
              | "slide"
              | "flip",
             durationInFrames: Math.round(state.fps / 2),
            },
           })
          }>
          <option value="none">Transition: none</option>
          <option value="crossfade">crossfade</option>
          <option value="wipe">wipe</option>
          <option value="slide">slide</option>
          <option value="flip">flip</option>
         </select>
        )}
        <div className="text-[10px] uppercase">
         Feature Registry:{" "}
         {
          FEATURE_REGISTRY.filter((entry) => entry.status === "implemented")
           .length
         }{" "}
         implemented
        </div>
       </div>
      )}
     </div>
    </div>
   </div>

   {contextMenu &&
    (() => {
     const clip = state.clips.find((item) => item.id === contextMenu.clipId)
     if (!clip) return null
     return (
      <div
       className="fixed z-50 border-[3px] border-black bg-white p-2 shadow-[4px_4px_0px_0px_black]"
       style={{ left: contextMenu.x, top: contextMenu.y }}
       onMouseLeave={() => setContextMenu(null)}>
       <div className="mb-1 text-[10px] font-black uppercase">
        Clip Settings
       </div>
       <div className="mb-1 flex gap-1">
        {COLOR_SWATCHES.map((color) => (
         <button
          key={color}
          className="h-5 w-5 border-[2px] border-black"
          style={{ background: color }}
          onClick={() =>
           dispatch({ type: "setClipColor", clipId: clip.id, color })
          }
         />
        ))}
       </div>
       <button
        className="mb-1 w-full border-[2px] border-black bg-[#fff070] p-1 text-[10px] font-black"
        onClick={() => addKeyframeAtPlayhead(clip)}>
        Add Keyframe
       </button>
       <button
        className="w-full border-[2px] border-black bg-[#ff8fb3] p-1 text-[10px] font-black"
        onClick={() => dispatch({ type: "deleteClip", clipId: clip.id })}>
        Delete Clip
       </button>
      </div>
     )
    })()}
  </div>
 )
}
