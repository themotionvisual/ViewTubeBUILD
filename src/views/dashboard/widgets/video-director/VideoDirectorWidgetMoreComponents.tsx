import React from "react"
import type {
  DirectorConceptDeckProps,
  DirectorStyleDeckProps,
  DirectorPerspectiveRigProps,
  DirectorPaletteProps,
  DirectorGradeBoardProps,
  DirectorShotStructureProps,
  DirectorSpeedCurveProps,
  DirectorDialogueLaneProps,
  DirectorSfxLaneProps,
  DirectorTitleCanvasProps,
  DirectorOverlayStackProps,
  DirectorEffectsStackProps,
  DirectorOutputCardProps,
} from "../../../../features/video-director/signatureContracts"

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <span className="vtdw-mini-stat"><small>{label}</small><strong>{value}</strong></span>
)

export const DirectorWidgetConceptDeck: React.FC<DirectorConceptDeckProps> = ({ objective, audience, treatment, conceptCount, variationStrength }) => (
  <div className="vtdw-signature vtdw-concept-deck">
    <div className="vtdw-concept-cards">
      {Array.from({ length: Math.min(4, Math.max(1, conceptCount)) }).map((_, i) => <span key={i}><b>{i + 1}</b><small>CONCEPT</small></span>)}
    </div>
    <div className="vtdw-signature-stats"><strong>{variationStrength.toUpperCase()}</strong><span>{objective || "OPEN OBJECTIVE"}</span><span>{audience || "ALL AUDIENCE"}</span></div>
    {treatment ? <p className="vtdw-signature-note">{treatment}</p> : null}
  </div>
)

export const DirectorWidgetStyleDeck: React.FC<DirectorStyleDeckProps> = ({ medium, period, realism, stylization, descriptorCount, recipeCount }) => (
  <div className="vtdw-signature vtdw-style-deck">
    <div className="vtdw-style-cards"><span>REAL<br/><b>{Math.round(realism * 100)}%</b></span><span>STYLE<br/><b>{Math.round(stylization * 100)}%</b></span><span>{medium.toUpperCase()}<br/><b>{period || "ERA AUTO"}</b></span></div>
    <div className="vtdw-signature-stats"><strong>{recipeCount} RECIPES</strong><span>{descriptorCount} DESCRIPTORS</span></div>
  </div>
)

export const DirectorWidgetPerspectiveRig: React.FC<DirectorPerspectiveRigProps> = ({ rig, cameraHeightMeters, pitchDegrees, yawDegrees, fieldOfViewDegrees, firstPerson }) => (
  <div className="vtdw-signature vtdw-rig">
    <span className="vtdw-rig-ground" /><span className="vtdw-rig-camera" style={{ bottom: `calc(20% + ${Math.min(54, cameraHeightMeters * 10)}px)`, transform: `rotate(${pitchDegrees}deg)` }}>CAM</span>
    <span className="vtdw-rig-cone" style={{ transform: `rotate(${yawDegrees / 4}deg)`, width: `${Math.max(70, Math.min(170, fieldOfViewDegrees))}px` }} />
    <div className="vtdw-signature-stats"><strong>{rig.toUpperCase()}</strong><span>{cameraHeightMeters}M</span><span>{firstPerson ? "1ST PERSON" : `${fieldOfViewDegrees}° FOV`}</span></div>
  </div>
)

export const DirectorWidgetPaletteBoard: React.FC<DirectorPaletteProps> = ({ colors, exactLock }) => (
  <div className="vtdw-signature vtdw-palette-board">
    <div className="vtdw-palette-swatches">{colors.slice(0,8).map((color,i)=><span key={i} style={{background:color}}><b>{color}</b></span>)}</div>
    <div className="vtdw-signature-stats"><strong>{exactLock ? "PALETTE LOCKED" : "PALETTE FLEX"}</strong><span>{colors.length} COLORS</span></div>
  </div>
)

export const DirectorWidgetGradeBoard: React.FC<DirectorGradeBoardProps> = ({ exposureEv, contrast, highlights, shadows, temperatureK, saturation }) => (
  <div className="vtdw-signature vtdw-grade-board">
    <div className="vtdw-grade-bars">{[["SHADOW",shadows],["CONTRAST",contrast],["HIGHLIGHT",highlights]].map(([l,v])=><div key={String(l)}><small>{l}</small><span><i style={{width:`${50 + Number(v)/2}%`}} /></span></div>)}</div>
    <div className="vtdw-signature-stats"><strong>{exposureEv > 0 ? "+" : ""}{exposureEv} EV</strong><span>{temperatureK}K</span><span>{saturation}% SAT</span></div>
  </div>
)

export const DirectorWidgetShotStructure: React.FC<DirectorShotStructureProps> = ({ mode, shotCount, averageShotSeconds, continuityStrength }) => (
  <div className="vtdw-signature vtdw-structure">
    <div className="vtdw-structure-track">{Array.from({length:Math.min(10,shotCount)}).map((_,i)=><span key={i} style={{opacity:.45 + (i%3)*.2}}>{i+1}</span>)}</div>
    <div className="vtdw-signature-stats"><strong>{mode.toUpperCase()}</strong><span>{shotCount} SHOTS</span><span>{averageShotSeconds}S AVG · {Math.round(continuityStrength*100)}% CONT</span></div>
  </div>
)

export const DirectorWidgetSpeedCurve: React.FC<DirectorSpeedCurveProps> = ({ playbackRate, interpolation, motionBlur, pointCount }) => (
  <div className="vtdw-signature vtdw-speed">
    <svg viewBox="0 0 300 90" aria-label="Speed curve"><polyline points="5,68 70,55 120,60 180,25 240,38 295,18" fill="none" stroke="currentColor" strokeWidth="4"/><line x1="0" y1="70" x2="300" y2="70" stroke="currentColor" opacity=".2"/></svg>
    <div className="vtdw-signature-stats"><strong>{playbackRate}×</strong><span>{interpolation.toUpperCase()}</span><span>{Math.round(motionBlur*100)}% BLUR · {pointCount} PTS</span></div>
  </div>
)

export const DirectorWidgetDialogueLane: React.FC<DirectorDialogueLaneProps> = ({ enabled, source, language, speakingRate, expressiveness, scriptLength }) => (
  <div className="vtdw-signature vtdw-dialogue">
    <div className="vtdw-dialogue-lane"><span>VO</span><i style={{width:`${Math.min(88, Math.max(12, scriptLength/100))}%`}} /></div>
    <div className="vtdw-signature-stats"><strong>{enabled ? "VOICE ON" : "VOICE OFF"}</strong><span>{source.toUpperCase()} · {language.toUpperCase()}</span><span>{speakingRate}× · {Math.round(expressiveness*100)}%</span></div>
  </div>
)

export const DirectorWidgetSfxLane: React.FC<DirectorSfxLaneProps> = ({ enabled, cueCount, autoDetectEvents }) => (
  <div className="vtdw-signature vtdw-sfx">
    <div className="vtdw-sfx-line">{Array.from({length:Math.max(3,Math.min(12,cueCount||3))}).map((_,i)=><span key={i} className={i<cueCount?"is-cue":""} style={{left:`${8 + i*7.5}%`}} />)}</div>
    <div className="vtdw-signature-stats"><strong>{enabled ? "SFX ON" : "SFX OFF"}</strong><span>{cueCount} CUES</span><span>{autoDetectEvents ? "AUTO EVENTS" : "MANUAL EVENTS"}</span></div>
  </div>
)

export const DirectorWidgetTitleCanvas: React.FC<DirectorTitleCanvasProps> = ({ overlayCount, safeMargins }) => (
  <div className="vtdw-signature vtdw-title-canvas"><span className={safeMargins?"vtdw-title-safe":""}/><strong>MAIN TITLE</strong><small>LOWER THIRD</small><div className="vtdw-signature-stats"><b>{overlayCount} TEXT LAYERS</b><span>{safeMargins?"SAFE MARGINS":"EDGE FREE"}</span></div></div>
)

export const DirectorWidgetOverlayStack: React.FC<DirectorOverlayStackProps> = ({ itemCount }) => (
  <div className="vtdw-signature vtdw-overlay-stack">{Array.from({length:Math.max(3,Math.min(6,itemCount||3))}).map((_,i)=><span key={i} style={{transform:`translate(${i*12}px,${i*9}px)`,opacity:i<itemCount?1:.3}}>{i<itemCount?`LAYER ${i+1}`:"＋"}</span>)}<div className="vtdw-signature-stats"><strong>{itemCount} OVERLAYS</strong><span>LAYER STACK</span></div></div>
)

export const DirectorWidgetEffectsStack: React.FC<DirectorEffectsStackProps> = ({ effects }) => (
  <div className="vtdw-signature vtdw-effects-stack"><div>{effects.length?effects.slice(0,6).map((effect,i)=><span key={i}><b>{effect.type.toUpperCase()}</b><i style={{width:`${effect.intensity*100}%`}}/></span>):<em>NO ACTIVE EFFECTS</em>}</div><div className="vtdw-signature-stats"><strong>{effects.length} FX</strong><span>DETERMINISTIC STACK</span></div></div>
)

export const DirectorWidgetOutputCard: React.FC<DirectorOutputCardProps> = ({ ratio, resolution, quality, outputs, nativeAudio, upscale, hdr }) => (
  <div className="vtdw-signature vtdw-output-card"><div className="vtdw-output-frame" style={{aspectRatio:ratio==="9:16"?"9/16":ratio==="1:1"?"1/1":ratio==="21:9"?"21/9":"16/9"}}><strong>{ratio}</strong><small>{resolution}</small></div><div className="vtdw-output-flags"><Stat label="QUALITY" value={quality.toUpperCase()}/><Stat label="OUTPUTS" value={outputs}/><Stat label="AUDIO" value={nativeAudio?"ON":"OFF"}/><Stat label="UPSCALE" value={upscale?"ON":"OFF"}/><Stat label="HDR" value={hdr?"ON":"OFF"}/></div></div>
)
