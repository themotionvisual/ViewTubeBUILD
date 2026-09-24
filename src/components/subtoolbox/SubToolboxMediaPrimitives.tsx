import React from "react"
import {
  Captions,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Expand,
  Gauge,
  ListVideo,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings2,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"
import "../../styles/toolbox-entry.css"
import { getComponentLevelCssVars } from "./tokens"
import type { ToolboxControlLevel } from "./tokens"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

const withLevelStyle = (
  level: ToolboxControlLevel | undefined,
  style: React.CSSProperties | undefined,
): React.CSSProperties | undefined => level
  ? { ...style, ...getComponentLevelCssVars(level) } as React.CSSProperties
  : style

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export const formatMediaTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const whole = Math.floor(safe)
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const secs = whole % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`
}

export interface SubToolboxMediaControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  icon: React.ReactNode
  label: string
  active?: boolean
  wide?: boolean
}
export const SubToolboxMediaControlButton: React.FC<SubToolboxMediaControlButtonProps> = ({
  level = "l0",
  icon,
  label,
  active = false,
  wide = false,
  className,
  style,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    aria-label={label}
    aria-pressed={active || undefined}
    data-vt-control-level={level}
    style={withLevelStyle(level, style)}
    className={classes("vt-subtoolbox-media-control", active && "is-active", wide && "is-wide", className)}
    {...props}
  >
    <span aria-hidden="true">{icon}</span>
  </button>
)

export interface SubToolboxMediaPlayToggleProps extends Omit<SubToolboxMediaControlButtonProps, "icon" | "label" | "active"> {
  playing: boolean
}
export const SubToolboxMediaPlayToggle: React.FC<SubToolboxMediaPlayToggleProps> = ({ playing, ...props }) => (
  <SubToolboxMediaControlButton
    {...props}
    active={playing}
    wide
    label={playing ? "Pause media" : "Play media"}
    icon={playing ? <Pause /> : <Play />}
  />
)

export interface SubToolboxMediaSeekBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  value: number
  duration: number
  buffered?: number
  onValueChange?: (value: number) => void
  ariaLabel?: string
}
export const SubToolboxMediaSeekBar: React.FC<SubToolboxMediaSeekBarProps> = ({
  level = "l0",
  value,
  duration,
  buffered = 0,
  onValueChange,
  ariaLabel = "Seek media",
  className,
  style,
  ...props
}) => {
  const safeDuration = Math.max(0.001, duration || 0.001)
  const safeValue = clamp(value, 0, safeDuration)
  const safeBuffered = clamp(buffered, 0, safeDuration)
  const pct = safeValue / safeDuration * 100
  const bufferedPct = safeBuffered / safeDuration * 100
  return (
    <div
      className={classes("vt-subtoolbox-media-seek", className)}
      data-vt-control-level={level}
      style={{
        ...(withLevelStyle(level, style) ?? {}),
        ["--vt-media-progress" as string]: `${pct}%`,
        ["--vt-media-buffered" as string]: `${bufferedPct}%`,
      } as React.CSSProperties}
      {...props}
    >
      <span className="vt-subtoolbox-media-seek-track" aria-hidden="true">
        <i className="buffered" />
        <i className="played" />
      </span>
      <input
        type="range"
        min={0}
        max={safeDuration}
        step={0.01}
        value={safeValue}
        aria-label={ariaLabel}
        onChange={(event) => onValueChange?.(Number(event.target.value))}
      />
    </div>
  )
}

export interface SubToolboxMediaVolumeControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  value: number
  muted?: boolean
  onValueChange?: (value: number) => void
  onMutedChange?: (muted: boolean) => void
}
export const SubToolboxMediaVolumeControl: React.FC<SubToolboxMediaVolumeControlProps> = ({
  level = "l0",
  value,
  muted = false,
  onValueChange,
  onMutedChange,
  className,
  style,
  ...props
}) => {
  const safe = clamp(value)
  const Icon = muted || safe === 0 ? VolumeX : safe < .55 ? Volume1 : Volume2
  return (
    <div className={classes("vt-subtoolbox-media-volume", className)} data-vt-control-level={level} style={withLevelStyle(level, style)} {...props}>
      <button type="button" aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted} onClick={() => onMutedChange?.(!muted)}>
        <Icon aria-hidden="true" />
      </button>
      <input
        aria-label="Media volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={safe}
        style={{ ["--vt-media-volume" as string]: `${safe * 100}%` } as React.CSSProperties}
        onChange={(event) => onValueChange?.(Number(event.target.value))}
      />
    </div>
  )
}

export interface SubToolboxMediaTimecodeProps extends React.HTMLAttributes<HTMLOutputElement> {
  level?: ToolboxControlLevel
  current: number
  duration?: number
  compact?: boolean
}
export const SubToolboxMediaTimecode: React.FC<SubToolboxMediaTimecodeProps> = ({
  level = "l0",
  current,
  duration,
  compact = false,
  className,
  style,
  ...props
}) => (
  <output
    className={classes("vt-subtoolbox-media-timecode", compact && "is-compact", className)}
    data-vt-control-level={level}
    style={withLevelStyle(level, style)}
    {...props}
  >
    <b>{formatMediaTime(current)}</b>
    {duration != null ? <span>/ {formatMediaTime(duration)}</span> : null}
  </output>
)

export interface SubToolboxMediaDurationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level?: ToolboxControlLevel
  seconds: number
}
export const SubToolboxMediaDurationBadge: React.FC<SubToolboxMediaDurationBadgeProps> = ({
  level = "l0",
  seconds,
  className,
  style,
  ...props
}) => (
  <span className={classes("vt-subtoolbox-media-duration", className)} data-vt-control-level={level} style={withLevelStyle(level, style)} {...props}>
    {formatMediaTime(seconds)}
  </span>
)

export interface SubToolboxMediaCaptionToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  enabled: boolean
}
export const SubToolboxMediaCaptionToggle: React.FC<SubToolboxMediaCaptionToggleProps> = ({
  level = "l0",
  enabled,
  className,
  style,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={classes("vt-subtoolbox-media-caption", enabled && "is-on", className)}
    data-vt-control-level={level}
    style={withLevelStyle(level, style)}
    aria-pressed={enabled}
    aria-label={enabled ? "Disable captions" : "Enable captions"}
    {...props}
  >
    <Captions aria-hidden="true" />
    <span>CC</span>
  </button>
)

export interface SubToolboxMediaSpeedControlProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  level?: ToolboxControlLevel
  value: number
  options?: number[]
  onValueChange?: (value: number) => void
}
export const SubToolboxMediaSpeedControl: React.FC<SubToolboxMediaSpeedControlProps> = ({
  level = "l0",
  value,
  options = [.25, .5, .75, 1, 1.25, 1.5, 2],
  onValueChange,
  className,
  style,
  ...props
}) => (
  <label className={classes("vt-subtoolbox-media-speed", className)} data-vt-control-level={level} style={withLevelStyle(level, style)}>
    <Gauge aria-hidden="true" />
    <select aria-label="Playback speed" value={value} onChange={(event) => onValueChange?.(Number(event.target.value))} {...props}>
      {options.map((option) => <option key={option} value={option}>{option}×</option>)}
    </select>
    <ChevronDown aria-hidden="true" />
  </label>
)

export interface SubToolboxMediaPosterProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  ratio?: "16:9" | "1:1" | "9:16" | "4:5"
  src?: string
  alt?: string
  overlay?: React.ReactNode
}
export const SubToolboxMediaPoster: React.FC<SubToolboxMediaPosterProps> = ({
  level = "l0",
  ratio = "16:9",
  src,
  alt = "",
  overlay,
  children,
  className,
  style,
  ...props
}) => (
  <div
    className={classes("vt-subtoolbox-media-poster", className)}
    data-vt-control-level={level}
    data-ratio={ratio}
    style={withLevelStyle(level, style)}
    {...props}
  >
    {src ? <img src={src} alt={alt} /> : <div className="vt-subtoolbox-media-poster-placeholder">{children ?? <Play aria-hidden="true" />}</div>}
    {overlay ? <div className="vt-subtoolbox-media-poster-overlay">{overlay}</div> : null}
  </div>
)

export type SubToolboxMediaStatusTone = "ready" | "playing" | "paused" | "processing" | "error"
export interface SubToolboxMediaStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  level?: ToolboxControlLevel
  status?: SubToolboxMediaStatusTone
  label?: React.ReactNode
}
export const SubToolboxMediaStatus: React.FC<SubToolboxMediaStatusProps> = ({
  level = "l0",
  status = "ready",
  label,
  className,
  style,
  ...props
}) => (
  <span
    className={classes("vt-subtoolbox-media-status", `is-${status}`, className)}
    data-vt-control-level={level}
    style={withLevelStyle(level, style)}
    {...props}
  >
    <i aria-hidden="true" />
    <b>{label ?? status}</b>
  </span>
)

export interface SubToolboxMediaTransportBarProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  playing: boolean
  current: number
  duration: number
  speed?: number
  captions?: boolean
  onPlayingChange?: (playing: boolean) => void
  onCurrentChange?: (time: number) => void
  onSpeedChange?: (speed: number) => void
  onCaptionsChange?: (enabled: boolean) => void
  onFullscreen?: () => void
  skipSeconds?: number
}
export const SubToolboxMediaTransportBar: React.FC<SubToolboxMediaTransportBarProps> = ({
  level = "l0",
  playing,
  current,
  duration,
  speed = 1,
  captions = false,
  onPlayingChange,
  onCurrentChange,
  onSpeedChange,
  onCaptionsChange,
  onFullscreen,
  skipSeconds = 10,
  className,
  style,
  ...props
}) => (
  <div className={classes("vt-subtoolbox-media-transport", className)} data-vt-control-level={level} style={withLevelStyle(level, style)} {...props}>
    <div className="vt-subtoolbox-media-transport-cluster">
      <SubToolboxMediaControlButton level={level} label={`Back ${skipSeconds} seconds`} icon={<RotateCcw />} onClick={() => onCurrentChange?.(Math.max(0, current - skipSeconds))} />
      <SubToolboxMediaPlayToggle level={level} playing={playing} onClick={() => onPlayingChange?.(!playing)} />
      <SubToolboxMediaControlButton level={level} label={`Forward ${skipSeconds} seconds`} icon={<RotateCw />} onClick={() => onCurrentChange?.(Math.min(duration, current + skipSeconds))} />
    </div>
    <SubToolboxMediaTimecode level={level} current={current} duration={duration} compact />
    <div className="vt-subtoolbox-media-transport-cluster is-tail">
      <SubToolboxMediaCaptionToggle level={level} enabled={captions} onClick={() => onCaptionsChange?.(!captions)} />
      <SubToolboxMediaSpeedControl level={level} value={speed} onValueChange={onSpeedChange} />
      {onFullscreen ? <SubToolboxMediaControlButton level={level} label="Fullscreen" icon={<Expand />} onClick={onFullscreen} /> : null}
    </div>
  </div>
)

export interface SubToolboxMediaPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  src?: string
  poster?: string
  title?: React.ReactNode
  meta?: React.ReactNode
  current?: number
  duration?: number
  buffered?: number
  playing?: boolean
  muted?: boolean
  volume?: number
  speed?: number
  captions?: boolean
  status?: SubToolboxMediaStatusTone
  ratio?: "16:9" | "1:1" | "9:16" | "4:5"
  onCurrentChange?: (time: number) => void
  onPlayingChange?: (playing: boolean) => void
  onMutedChange?: (muted: boolean) => void
  onVolumeChange?: (value: number) => void
  onSpeedChange?: (speed: number) => void
  onCaptionsChange?: (enabled: boolean) => void
  onFullscreen?: () => void
}
export const SubToolboxMediaPlayer: React.FC<SubToolboxMediaPlayerProps> = ({
  level = "l0",
  src,
  poster,
  title = "MEDIA PREVIEW",
  meta,
  current = 0,
  duration = 60,
  buffered = 0,
  playing = false,
  muted = false,
  volume = .8,
  speed = 1,
  captions = false,
  status = playing ? "playing" : "paused",
  ratio = "16:9",
  onCurrentChange,
  onPlayingChange,
  onMutedChange,
  onVolumeChange,
  onSpeedChange,
  onCaptionsChange,
  onFullscreen,
  className,
  style,
  ...props
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return
    video.playbackRate = speed
    video.volume = clamp(volume)
    video.muted = muted
    if (Math.abs(video.currentTime - current) > .35) video.currentTime = clamp(current, 0, duration || current)
  }, [current, duration, muted, speed, src, volume])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return
    if (playing) {
      const result = video.play()
      if (result && typeof result.catch === "function") result.catch(() => onPlayingChange?.(false))
    } else {
      video.pause()
    }
  }, [playing, onPlayingChange, src])

  return (
    <div className={classes("vt-subtoolbox-media-player", className)} data-vt-control-level={level} style={withLevelStyle(level, style)} {...props}>
      <header className="vt-subtoolbox-media-player-head">
        <div>
          <strong>{title}</strong>
          {meta ? <small>{meta}</small> : null}
        </div>
        <SubToolboxMediaStatus level={level} status={status} />
      </header>

      <SubToolboxMediaPoster
        level={level}
        ratio={ratio}
        src={!src ? poster : undefined}
        overlay={!src ? (
          <SubToolboxMediaPlayToggle
            level={level}
            playing={playing}
            onClick={() => onPlayingChange?.(!playing)}
          />
        ) : undefined}
      >
        {!poster ? <Play /> : null}
      </SubToolboxMediaPoster>

      {src ? (
        <div className="vt-subtoolbox-media-player-video-wrap" data-ratio={ratio}>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            playsInline
            preload="metadata"
            onTimeUpdate={(event) => onCurrentChange?.(event.currentTarget.currentTime)}
            onDurationChange={(event) => {
              if (event.currentTarget.duration > 0 && current > event.currentTarget.duration) {
                onCurrentChange?.(event.currentTarget.duration)
              }
            }}
            onPlay={() => onPlayingChange?.(true)}
            onPause={() => onPlayingChange?.(false)}
          />
        </div>
      ) : null}

      <div className="vt-subtoolbox-media-player-timeline">
        <SubToolboxMediaSeekBar level={level} value={current} duration={duration} buffered={buffered} onValueChange={onCurrentChange} />
        <SubToolboxMediaTimecode level={level} current={current} duration={duration} />
      </div>

      <SubToolboxMediaTransportBar
        level={level}
        playing={playing}
        current={current}
        duration={duration}
        speed={speed}
        captions={captions}
        onPlayingChange={onPlayingChange}
        onCurrentChange={onCurrentChange}
        onSpeedChange={onSpeedChange}
        onCaptionsChange={onCaptionsChange}
        onFullscreen={onFullscreen}
      />

      <div className="vt-subtoolbox-media-player-footer">
        <SubToolboxMediaVolumeControl
          level={level}
          value={volume}
          muted={muted}
          onValueChange={onVolumeChange}
          onMutedChange={onMutedChange}
        />
      </div>
    </div>
  )
}

export interface SubToolboxMediaQueueItem {
  id: string
  title: React.ReactNode
  meta?: React.ReactNode
  duration?: number
  status?: SubToolboxMediaStatusTone
  thumbnail?: React.ReactNode
}
export interface SubToolboxMediaQueueProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  items: SubToolboxMediaQueueItem[]
  activeId?: string
  onActiveChange?: (id: string) => void
}
export const SubToolboxMediaQueue: React.FC<SubToolboxMediaQueueProps> = ({
  level = "l0",
  items,
  activeId,
  onActiveChange,
  className,
  style,
  ...props
}) => (
  <div className={classes("vt-subtoolbox-media-queue", className)} data-vt-control-level={level} style={withLevelStyle(level, style)} {...props}>
    <header><ListVideo aria-hidden="true" /><strong>MEDIA QUEUE</strong><b>{items.length}</b></header>
    <div className="vt-subtoolbox-media-queue-list">
      {items.map((item, index) => (
        <button
          type="button"
          key={item.id}
          className={classes("vt-subtoolbox-media-queue-row", item.id === activeId && "is-active")}
          aria-pressed={item.id === activeId}
          onClick={() => onActiveChange?.(item.id)}
        >
          <span className="vt-subtoolbox-media-queue-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="vt-subtoolbox-media-queue-thumb">{item.thumbnail ?? <Play aria-hidden="true" />}</span>
          <span className="vt-subtoolbox-media-queue-copy"><strong>{item.title}</strong>{item.meta ? <small>{item.meta}</small> : null}</span>
          {item.duration != null ? <SubToolboxMediaDurationBadge level={level} seconds={item.duration} /> : null}
          <SubToolboxMediaStatus level={level} status={item.status ?? "ready"} />
          <ChevronRight aria-hidden="true" />
        </button>
      ))}
    </div>
  </div>
)

export interface SubToolboxMediaInspectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  title: React.ReactNode
  poster?: string
  ratio?: "16:9" | "1:1" | "9:16" | "4:5"
  duration?: number
  status?: SubToolboxMediaStatusTone
  items?: Array<{ label: React.ReactNode; value: React.ReactNode }>
  actions?: React.ReactNode
}
export const SubToolboxMediaInspector: React.FC<SubToolboxMediaInspectorProps> = ({
  level = "l0",
  title,
  poster,
  ratio = "16:9",
  duration = 0,
  status = "ready",
  items = [],
  actions,
  className,
  style,
  ...props
}) => (
  <div className={classes("vt-subtoolbox-media-inspector", className)} data-vt-control-level={level} style={withLevelStyle(level, style)} {...props}>
    <SubToolboxMediaPoster level={level} ratio={ratio} src={poster} overlay={<SubToolboxMediaDurationBadge level={level} seconds={duration} />} />
    <div className="vt-subtoolbox-media-inspector-body">
      <header><strong>{title}</strong><SubToolboxMediaStatus level={level} status={status} /></header>
      <dl>
        {items.map((item, index) => <div key={index}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
      </dl>
      {actions ? <div className="vt-subtoolbox-media-inspector-actions">{actions}</div> : null}
    </div>
  </div>
)

export interface SubToolboxMediaReviewPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  title?: React.ReactNode
  player: React.ReactNode
  notes?: React.ReactNode
  status?: React.ReactNode
  actions?: React.ReactNode
}
export const SubToolboxMediaReviewPanel: React.FC<SubToolboxMediaReviewPanelProps> = ({
  level = "l0",
  title = "MEDIA REVIEW",
  player,
  notes,
  status,
  actions,
  className,
  style,
  ...props
}) => (
  <section className={classes("vt-subtoolbox-media-review", className)} data-vt-control-level={level} style={withLevelStyle(level, style)} {...props}>
    <header><Settings2 aria-hidden="true" /><strong>{title}</strong>{status}</header>
    <div className="vt-subtoolbox-media-review-main">{player}</div>
    <aside className="vt-subtoolbox-media-review-side">
      <div className="vt-subtoolbox-media-review-notes">{notes ?? <span>ADD REVIEW NOTES</span>}</div>
      {actions ? <div className="vt-subtoolbox-media-review-actions">{actions}</div> : null}
    </aside>
  </section>
)
