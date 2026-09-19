import React from "react"
import type { DirectorAudioStageProps, DirectorCompositionControlProps, DirectorLensControlProps, DirectorLightingControlProps, DirectorMoodControlProps, DirectorPacingControlProps, DirectorProviderRouteProps, DirectorShotStripProps } from "../../../../features/video-director/signatureContracts"

export const DirectorWidgetLensVisual: React.FC<DirectorLensControlProps> = ({ focalLength, aperture }) => {
  const fieldWidth = Math.max(20, Math.min(88, 92 - Math.log2(Math.max(1, focalLength) / 14) * 17))
  return (
    <div className="vtdw-signature vtdw-lens" aria-label={`Lens preview: ${focalLength} millimeter at f/${aperture}`}>
      <div className="vtdw-lens-frame is-outer" />
      <div className="vtdw-lens-frame is-fov" style={{ width: `${fieldWidth}%` }} />
      <span className="vtdw-crosshair" aria-hidden="true">＋</span>
      <div className="vtdw-signature-stats"><strong>{focalLength}MM</strong><span>F/{aperture}</span><span>{fieldWidth.toFixed(0)}% FOV</span></div>
    </div>
  )
}

export const DirectorWidgetMoodVisual: React.FC<DirectorMoodControlProps> = ({ horizontal, vertical }) => (
  <div className="vtdw-signature vtdw-mood" aria-label="Emotion and tone quadrant">
    <span className="vtdw-axis is-x" aria-hidden="true" />
    <span className="vtdw-axis is-y" aria-hidden="true" />
    <small className="is-nw">SOMBER</small><small className="is-ne">TRIUMPHANT</small>
    <small className="is-sw">CALM</small><small className="is-se">ENERGETIC</small>
    <span
      className="vtdw-mood-dot"
      style={{
        left: `calc(${((horizontal + 1) / 2) * 100}% - 13px)`,
        top: `calc(${((1 - vertical) / 2) * 100}% - 13px)`,
      }}
      aria-hidden="true"
    />
  </div>
)

export const DirectorWidgetCompositionVisual: React.FC<DirectorCompositionControlProps> = ({ subjectX, subjectY, horizonY, safeZones }) => (
  <div className="vtdw-signature vtdw-composition" aria-label="Composition framing preview">
    <span className="vtdw-grid-line is-v1" /><span className="vtdw-grid-line is-v2" />
    <span className="vtdw-grid-line is-h1" /><span className="vtdw-grid-line is-h2" />
    <span className="vtdw-horizon" style={{ top: `${horizonY * 100}%` }} />
    {safeZones ? <span className="vtdw-safe-zone" /> : null}
    <span className="vtdw-subject" style={{ left: `calc(${subjectX * 100}% - 14px)`, top: `calc(${subjectY * 100}% - 14px)` }} />
  </div>
)

export const DirectorWidgetLightingVisual: React.FC<DirectorLightingControlProps> = ({ azimuth, elevation, temperatureK }) => {
  const x = 50 + Math.sin((azimuth * Math.PI) / 180) * 34
  const y = 50 - Math.sin((elevation * Math.PI) / 180) * 34
  const light = temperatureK < 4500 ? "#ffb35e" : temperatureK > 7000 ? "#a9d8ff" : "#fff0b4"
  return (
    <div className="vtdw-signature vtdw-lighting" aria-label="Lighting direction preview">
      <span className="vtdw-light-sphere" />
      <span className="vtdw-light-source" style={{ left: `calc(${x}% - 13px)`, top: `calc(${y}% - 13px)`, background: light }} />
      <div className="vtdw-signature-stats"><strong>{azimuth}° AZ</strong><span>{elevation}° EL</span><span>{temperatureK}K</span></div>
    </div>
  )
}

export const DirectorWidgetPacingVisual: React.FC<DirectorPacingControlProps> = ({ duration, hook, hold }) => {
  const safeDuration = Math.max(1, duration)
  const hookPct = Math.min(100, (hook / safeDuration) * 100)
  const holdPct = Math.min(100, (hold / safeDuration) * 100)
  return (
    <div className="vtdw-signature vtdw-pacing" aria-label="Pacing preview">
      <div className="vtdw-pacing-track">
        <span className="is-hook" style={{ width: `${hookPct}%` }} />
        <span className="is-middle" />
        <span className="is-hold" style={{ width: `${holdPct}%` }} />
      </div>
      <div className="vtdw-signature-stats"><strong>{hook}S HOOK</strong><span>{duration}S</span><span>{hold}S HOLD</span></div>
    </div>
  )
}

export const DirectorWidgetAudioStage: React.FC<DirectorAudioStageProps> = ({ width, targetLufs }) => (
  <div className="vtdw-signature vtdw-audio" aria-label="Spatial audio placement preview">
    <div className="vtdw-audio-grid" aria-hidden="true" />
    <span className="vtdw-audio-node is-left">SFX</span>
    <span className="vtdw-audio-node is-center">VO</span>
    <span className="vtdw-audio-node is-right">AMB</span>
    <div className="vtdw-signature-stats"><strong>{Math.round(width * 100)}% WIDTH</strong><span>{targetLufs} LUFS</span></div>
  </div>
)

export const DirectorWidgetShotStrip: React.FC<DirectorShotStripProps> = ({ shots }) => (
  <div className="vtdw-shot-strip" aria-label="Storyboard shot strip">
    {shots.length ? shots.map((shot, index) => (
      <div className={`vtdw-shot ${shot.enabled ? "" : "is-disabled"}`} key={shot.id}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{shot.label}</strong>
        <small>{shot.durationSeconds.toFixed(1)}S</small>
      </div>
    )) : <div className="vtdw-shot-empty">BUILD STORYBOARD TO CREATE SHOT SCOPES</div>}
  </div>
)

export const DirectorWidgetProviderRoute: React.FC<DirectorProviderRouteProps> = ({ mode, provider, model }) => (
  <div className="vtdw-provider-route" aria-label="Provider routing preview">
    <span className="vtdw-route-node">VIDEO DNA</span>
    <span className="vtdw-route-line">→</span>
    <span className="vtdw-route-node is-router">{mode === "auto" ? "AUTO ROUTER" : "MANUAL"}</span>
    <span className="vtdw-route-line">→</span>
    <span className="vtdw-route-node">{provider || "PROVIDER"}</span>
    <span className="vtdw-route-line">→</span>
    <span className="vtdw-route-node">{model || "MODEL"}</span>
  </div>
)
