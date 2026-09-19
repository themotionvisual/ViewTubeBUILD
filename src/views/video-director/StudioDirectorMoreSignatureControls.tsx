import React from "react"
import { SubToolboxSurface } from "../../components/subtoolbox/SubToolboxPrimitives"
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
} from "../../features/video-director/signatureContracts"

export const StudioDirectorConceptDeck: React.FC<DirectorConceptDeckProps> = ({ objective, audience, treatment, conceptCount, variationStrength }) => (
  <SubToolboxSurface tone="subtle" className="relative min-h-[220px] p-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {Array.from({length:Math.min(4,Math.max(1,conceptCount))}).map((_,i)=><div key={i} className="min-h-24 border-[3px] border-current rounded-[10px] bg-white grid place-items-center text-center"><strong className="text-xl font-black">{i+1}</strong><small className="text-[9px] font-black uppercase">Concept Treatment</small></div>)}
    </div>
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-black uppercase"><span>{variationStrength}</span><span className="truncate">{objective || "Open Objective"}</span><span className="truncate">{audience || "All Audience"}</span></div>
    {treatment ? <p className="mt-2 text-[10px] font-bold opacity-60 line-clamp-2">{treatment}</p> : null}
  </SubToolboxSurface>
)

export const StudioDirectorStyleDeck: React.FC<DirectorStyleDeckProps> = ({ medium, period, realism, stylization, descriptorCount, recipeCount }) => (
  <SubToolboxSurface tone="subtle" className="min-h-[210px] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
    {[["Realism",Math.round(realism*100)+"%"],["Stylization",Math.round(stylization*100)+"%"],[medium,period||"Era Auto"]].map(([a,b])=><div key={a} className="border-[3px] border-current rounded-[10px] bg-white grid place-items-center text-center p-4"><small className="text-[9px] font-black uppercase opacity-55">{a}</small><strong className="text-[16px] font-black uppercase">{b}</strong></div>)}
    <div className="sm:col-span-3 flex justify-between text-[10px] font-black uppercase"><span>{recipeCount} recipes</span><span>{descriptorCount} descriptors</span></div>
  </SubToolboxSurface>
)

export const StudioDirectorPerspectiveRig: React.FC<DirectorPerspectiveRigProps> = ({ rig, cameraHeightMeters, pitchDegrees, yawDegrees, fieldOfViewDegrees, firstPerson }) => (
  <SubToolboxSurface tone="subtle" className="relative min-h-[230px] overflow-hidden">
    <div className="absolute left-[8%] right-[8%] bottom-[30%] border-t-[3px] border-current"/>
    <div className="absolute left-[16%] w-14 h-10 border-[3px] border-current rounded-[9px] bg-white grid place-items-center text-[9px] font-black" style={{bottom:`calc(30% + ${Math.min(72,cameraHeightMeters*12)}px)`,transform:`rotate(${pitchDegrees}deg)`}}>CAM</div>
    <div className="absolute left-[35%] bottom-[38%] h-20 border-t-[4px] border-current bg-[color:var(--vt-subtoolbox-fill,#FA618A)]/10" style={{width:`${Math.max(90,Math.min(220,fieldOfViewDegrees*1.4))}px`,clipPath:"polygon(0 50%,100% 0,100% 100%)",transform:`rotate(${yawDegrees/4}deg)`,transformOrigin:"left center"}}/>
    <div className="absolute left-3 right-3 bottom-3 flex justify-between text-[10px] font-black uppercase"><span>{rig}</span><span>{cameraHeightMeters}m</span><span>{firstPerson?"First Person":fieldOfViewDegrees+"° FOV"}</span></div>
  </SubToolboxSurface>
)

export const StudioDirectorPaletteBoard: React.FC<DirectorPaletteProps> = ({ colors, exactLock }) => (
  <SubToolboxSurface tone="subtle" className="p-4 min-h-[180px]">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{colors.slice(0,8).map((color,i)=><div key={i} className="min-h-16 border-[3px] border-current rounded-[9px] relative" style={{background:color}}><span className="absolute bottom-1 left-1 bg-white/85 rounded px-1 text-[8px] font-black">{color}</span></div>)}</div>
    <div className="mt-3 text-[10px] font-black uppercase">{exactLock?"Exact Palette Lock":"Flexible Palette"} · {colors.length} colors</div>
  </SubToolboxSurface>
)

export const StudioDirectorGradeBoard: React.FC<DirectorGradeBoardProps> = ({ exposureEv, contrast, highlights, shadows, temperatureK, saturation }) => (
  <SubToolboxSurface tone="subtle" className="p-4 min-h-[210px] flex flex-col justify-center gap-3">
    {[["Shadows",shadows],["Contrast",contrast],["Highlights",highlights]].map(([l,v])=><div key={String(l)} className="grid grid-cols-[90px_1fr_42px] gap-3 items-center text-[10px] font-black uppercase"><span>{l}</span><div className="h-5 border-[2px] border-current rounded-[7px] overflow-hidden bg-white"><i className="block h-full bg-[color:var(--vt-subtoolbox-fill,#FA618A)]" style={{width:`${50+Number(v)/2}%`}}/></div><b>{v}</b></div>)}
    <div className="flex justify-between text-[10px] font-black uppercase"><span>{exposureEv>0?"+":""}{exposureEv} EV</span><span>{temperatureK}K</span><span>{saturation}% saturation</span></div>
  </SubToolboxSurface>
)

export const StudioDirectorShotStructure: React.FC<DirectorShotStructureProps> = ({ mode, shotCount, averageShotSeconds, continuityStrength }) => (
  <SubToolboxSurface tone="subtle" className="p-4 min-h-[200px]">
    <div className="flex gap-2 h-24 overflow-hidden">{Array.from({length:Math.min(12,shotCount)}).map((_,i)=><div key={i} className="min-w-12 flex-1 border-[3px] border-current rounded-[9px] bg-white grid place-items-center text-[10px] font-black" style={{opacity:.45+(i%3)*.2}}>{i+1}</div>)}</div>
    <div className="mt-3 flex justify-between text-[10px] font-black uppercase"><span>{mode}</span><span>{shotCount} shots</span><span>{averageShotSeconds}s avg</span><span>{Math.round(continuityStrength*100)}% continuity</span></div>
  </SubToolboxSurface>
)

export const StudioDirectorSpeedCurve: React.FC<DirectorSpeedCurveProps> = ({ playbackRate, interpolation, motionBlur, pointCount }) => (
  <SubToolboxSurface tone="subtle" className="p-4 min-h-[200px]">
    <svg viewBox="0 0 420 110" className="w-full h-28" aria-label="Speed curve"><polyline points="5,84 90,64 165,72 250,30 330,46 415,18" fill="none" stroke="currentColor" strokeWidth="5"/><line x1="0" y1="88" x2="420" y2="88" stroke="currentColor" opacity=".2"/></svg>
    <div className="flex justify-between text-[10px] font-black uppercase"><span>{playbackRate}×</span><span>{interpolation}</span><span>{Math.round(motionBlur*100)}% blur</span><span>{pointCount} curve points</span></div>
  </SubToolboxSurface>
)

export const StudioDirectorDialogueLane: React.FC<DirectorDialogueLaneProps> = ({ enabled, source, language, speakingRate, expressiveness, scriptLength }) => (
  <SubToolboxSurface tone="subtle" className="p-4 min-h-[180px] flex flex-col justify-center">
    <div className="h-14 border-[3px] border-current rounded-[9px] bg-white flex items-center gap-3 p-2"><strong className="text-[10px] font-black">VO</strong><span className="block h-7 bg-[color:var(--vt-subtoolbox-fill,#FA618A)] rounded-[6px]" style={{width:`${Math.min(88,Math.max(12,scriptLength/100))}%`}}/></div>
    <div className="mt-3 flex justify-between text-[10px] font-black uppercase"><span>{enabled?"Voice On":"Voice Off"}</span><span>{source} · {language}</span><span>{speakingRate}×</span><span>{Math.round(expressiveness*100)}% expression</span></div>
  </SubToolboxSurface>
)

export const StudioDirectorSfxLane: React.FC<DirectorSfxLaneProps> = ({ enabled, cueCount, autoDetectEvents }) => (
  <SubToolboxSurface tone="subtle" className="p-4 min-h-[170px]">
    <div className="relative h-20 border-b-[3px] border-current">{Array.from({length:Math.max(4,Math.min(16,cueCount||4))}).map((_,i)=><span key={i} className={`absolute bottom-[-9px] w-4 h-4 border-[3px] border-current rounded-full ${i<cueCount?"bg-[color:var(--vt-subtoolbox-fill,#FA618A)]":"bg-white"}`} style={{left:`${5+i*6}%`}} />)}</div>
    <div className="mt-4 flex justify-between text-[10px] font-black uppercase"><span>{enabled?"SFX On":"SFX Off"}</span><span>{cueCount} cues</span><span>{autoDetectEvents?"Auto Events":"Manual Events"}</span></div>
  </SubToolboxSurface>
)

export const StudioDirectorTitleCanvas: React.FC<DirectorTitleCanvasProps> = ({ overlayCount, safeMargins }) => (
  <SubToolboxSurface tone="subtle" className="relative aspect-video grid place-items-center">
    {safeMargins?<div className="absolute inset-[8%] border-[2px] border-dashed border-current opacity-35 rounded-[8px]"/>:null}
    <strong className="text-[22px] font-black uppercase">Main Title</strong><small className="absolute bottom-[24%] text-[10px] font-black uppercase">Lower Third</small>
    <span className="absolute bottom-3 right-3 text-[9px] font-black uppercase">{overlayCount} text layers</span>
  </SubToolboxSurface>
)

export const StudioDirectorOverlayStack: React.FC<DirectorOverlayStackProps> = ({ itemCount }) => (
  <SubToolboxSurface tone="subtle" className="relative min-h-[210px] overflow-hidden">
    {Array.from({length:Math.max(3,Math.min(7,itemCount||3))}).map((_,i)=><div key={i} className="absolute left-[16%] w-[58%] h-16 border-[3px] border-current rounded-[9px] bg-white grid place-items-center text-[10px] font-black uppercase" style={{top:16+i*16,left:`calc(16% + ${i*14}px)`,opacity:i<itemCount?1:.3}}>{i<itemCount?`Layer ${i+1}`:"+"}</div>)}
    <span className="absolute bottom-3 right-3 text-[10px] font-black uppercase">{itemCount} overlays</span>
  </SubToolboxSurface>
)

export const StudioDirectorEffectsStack: React.FC<DirectorEffectsStackProps> = ({ effects }) => (
  <SubToolboxSurface tone="subtle" className="p-4 min-h-[210px] flex flex-col gap-2">
    {effects.length?effects.slice(0,8).map((effect,i)=><div key={i} className="grid grid-cols-[110px_1fr_44px] gap-3 items-center text-[9px] font-black uppercase"><strong>{effect.type}</strong><div className="h-5 border-[2px] border-current rounded-[7px] overflow-hidden bg-white"><span className="block h-full bg-[color:var(--vt-subtoolbox-fill,#FA618A)]" style={{width:`${effect.intensity*100}%`}}/></div><b>{Math.round(effect.intensity*100)}%</b></div>):<div className="m-auto text-[10px] font-black uppercase opacity-50">No Active Effects</div>}
  </SubToolboxSurface>
)

export const StudioDirectorOutputCard: React.FC<DirectorOutputCardProps> = ({ ratio, resolution, quality, outputs, nativeAudio, upscale, hdr }) => (
  <SubToolboxSurface tone="subtle" className="min-h-[240px] p-4 grid grid-cols-1 sm:grid-cols-[minmax(110px,180px)_1fr] gap-4 items-center">
    <div className="max-h-[180px] border-[4px] border-current rounded-[10px] bg-white grid place-items-center text-center" style={{aspectRatio:ratio==="9:16"?"9/16":ratio==="1:1"?"1/1":ratio==="21:9"?"21/9":"16/9"}}><div><strong className="text-[18px] font-black">{ratio}</strong><small className="block text-[10px] font-black uppercase">{resolution}</small></div></div>
    <div className="grid grid-cols-2 gap-2">{[["Quality",quality],["Outputs",outputs],["Native Audio",nativeAudio?"On":"Off"],["Upscale",upscale?"On":"Off"],["HDR",hdr?"On":"Off"]].map(([l,v])=><div key={String(l)} className="border-[2px] border-current rounded-[8px] bg-white p-2"><small className="block text-[8px] font-black uppercase opacity-50">{l}</small><strong className="text-[12px] font-black uppercase">{v}</strong></div>)}</div>
  </SubToolboxSurface>
)
