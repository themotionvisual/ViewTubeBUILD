import React from "react"
import type { DirectorAudioStageProps, DirectorCameraPathProps, DirectorCaptionPreviewProps, DirectorCompositionControlProps, DirectorContinuityLedgerProps, DirectorFocusDepthProps, DirectorLensControlProps, DirectorLightingControlProps, DirectorMoodControlProps, DirectorNegativeBankProps, DirectorPacingControlProps, DirectorProviderRouteProps, DirectorReferenceBoardProps, DirectorShotStripProps, DirectorTextureStackProps, DirectorTransitionBridgeProps, DirectorMusicBeatProps } from "../../../../features/video-director/signatureContracts"

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


export const DirectorWidgetCameraPath: React.FC<DirectorCameraPathProps> = ({ type, speed, panDegrees, tiltDegrees, orbitDegrees }) => (
  <div className="vtdw-signature vtdw-camera-path" aria-label="Camera movement path">
    <div className="vtdw-path-grid" aria-hidden="true" />
    <span className="vtdw-camera-origin">CAM</span>
    <span className="vtdw-camera-target" style={{ transform: `translate(${Math.max(-46, Math.min(46, panDegrees / 4))}px,${Math.max(-34, Math.min(34, -tiltDegrees / 3))}px)` }}>◎</span>
    <span className="vtdw-camera-arc" style={{ transform: `rotate(${Math.max(-70, Math.min(70, orbitDegrees / 3))}deg)` }} />
    <div className="vtdw-signature-stats"><strong>{type.toUpperCase()}</strong><span>{Math.round(speed * 100)}% SPEED</span><span>{panDegrees}° PAN</span></div>
  </div>
)

export const DirectorWidgetFocusDepth: React.FC<DirectorFocusDepthProps> = ({ mode, focusDistanceMeters, depthStrength, bokeh }) => (
  <div className="vtdw-signature vtdw-focus-depth" aria-label="Focus and depth preview">
    <span className="vtdw-focus-plane is-near" />
    <span className="vtdw-focus-plane is-mid" style={{ opacity: Math.max(.35, 1 - depthStrength * .5) }} />
    <span className="vtdw-focus-plane is-far" style={{ filter: `blur(${Math.round(bokeh * 5)}px)` }} />
    <span className="vtdw-focus-marker">FOCUS</span>
    <div className="vtdw-signature-stats"><strong>{mode.toUpperCase()}</strong><span>{focusDistanceMeters}M</span><span>{Math.round(depthStrength * 100)}% DEPTH</span></div>
  </div>
)

export const DirectorWidgetTextureStack: React.FC<DirectorTextureStackProps> = ({ grain, halation, bloom, vignette, filmStock }) => (
  <div className="vtdw-signature vtdw-texture-stack" aria-label="Film texture stack">
    {[["GRAIN",grain],["HALATION",halation],["BLOOM",bloom],["VIGNETTE",vignette]].map(([label,value],index)=>(
      <div className="vtdw-texture-layer" key={String(label)} style={{ transform:`translateY(${index*9}px)` }}>
        <strong>{label}</strong><span>{value}%</span>
      </div>
    ))}
    <div className="vtdw-signature-stats"><strong>{filmStock || "DIGITAL CLEAN"}</strong><span>STACKED FX</span></div>
  </div>
)

export const DirectorWidgetTransitionBridge: React.FC<DirectorTransitionBridgeProps> = ({ type, durationFrames, matchMotion }) => (
  <div className="vtdw-signature vtdw-transition" aria-label="Transition bridge preview">
    <div className="vtdw-transition-clip is-left">A</div>
    <div className="vtdw-transition-bridge">{type.toUpperCase()}</div>
    <div className="vtdw-transition-clip is-right">B</div>
    <div className="vtdw-signature-stats"><strong>{durationFrames} FRAMES</strong><span>{matchMotion ? "MOTION MATCH" : "FREE MOTION"}</span></div>
  </div>
)

export const DirectorWidgetMusicBeat: React.FC<DirectorMusicBeatProps> = ({ bpm, intensity, beatSync }) => (
  <div className="vtdw-signature vtdw-music" aria-label="Music beat preview">
    <div className="vtdw-waveform" aria-hidden="true">{Array.from({length:24}).map((_,i)=><span key={i} style={{height:`${18 + ((i*13)%44)}%`}} />)}</div>
    <div className="vtdw-beat-line">{Array.from({length:8}).map((_,i)=><i key={i} />)}</div>
    <div className="vtdw-signature-stats"><strong>{bpm} BPM</strong><span>{Math.round(intensity*100)}% INTENSITY</span><span>{beatSync.toUpperCase()}</span></div>
  </div>
)

export const DirectorWidgetCaptionPreview: React.FC<DirectorCaptionPreviewProps> = ({ position, animation, maxWordsPerLine, burnIn }) => (
  <div className="vtdw-signature vtdw-caption" aria-label="Caption preview">
    <span className="vtdw-caption-safe" />
    <span className={`vtdw-caption-line is-${position}`}>CAPTION PREVIEW</span>
    <div className="vtdw-signature-stats"><strong>{position.toUpperCase()}</strong><span>{animation.toUpperCase()}</span><span>{maxWordsPerLine} WORDS · {burnIn?"BURN IN":"SIDECAR"}</span></div>
  </div>
)

export const DirectorWidgetReferenceBoard: React.FC<DirectorReferenceBoardProps> = ({ referenceCount, seed, lockSeed, variationNoise }) => (
  <div className="vtdw-signature vtdw-reference-board" aria-label="Reference weighting board">
    <div className="vtdw-reference-tiles">
      {Array.from({length:Math.max(3,Math.min(6,referenceCount||3))}).map((_,i)=><span key={i}>{i<referenceCount?`REF ${i+1}`:"＋"}</span>)}
    </div>
    <div className="vtdw-signature-stats"><strong>{referenceCount} REFERENCES</strong><span>{lockSeed?"LOCKED":"FREE"} SEED {seed??"AUTO"}</span><span>{Math.round(variationNoise*100)}% NOISE</span></div>
  </div>
)

export const DirectorWidgetContinuityLedger: React.FC<DirectorContinuityLedgerProps> = ({ entityCount, identityStrength, wardrobeStrength, environmentStrength }) => (
  <div className="vtdw-signature vtdw-continuity" aria-label="Continuity ledger">
    <div className="vtdw-continuity-rows">
      {[["IDENTITY",identityStrength],["WARDROBE",wardrobeStrength],["ENVIRONMENT",environmentStrength]].map(([label,value])=>(
        <div key={String(label)}><strong>{label}</strong><span><i style={{width:`${Number(value)*100}%`}} /></span><b>{Math.round(Number(value)*100)}%</b></div>
      ))}
    </div>
    <div className="vtdw-signature-stats"><strong>{entityCount} ENTITIES</strong><span>CONTINUITY LEDGER</span></div>
  </div>
)

export const DirectorWidgetNegativeBank: React.FC<DirectorNegativeBankProps> = ({ tagCount, enforcement, freeText }) => (
  <div className="vtdw-signature vtdw-negative-bank" aria-label="Negative constraint bank">
    <div className="vtdw-negative-chips">
      {Array.from({length:Math.max(3,Math.min(8,tagCount||3))}).map((_,i)=><span key={i}>{i<tagCount?`EXCLUDE ${i+1}`:"EMPTY"}</span>)}
    </div>
    <div className="vtdw-signature-stats"><strong>{enforcement.toUpperCase()}</strong><span>{tagCount} TAGS</span><span>{freeText.trim()?"CUSTOM NOTE":"NO NOTE"}</span></div>
  </div>
)
