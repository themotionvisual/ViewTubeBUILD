import React from "react"
import { SubToolboxSurface } from "../../components/subtoolbox/SubToolboxPrimitives"
import type {
  DirectorCameraPathProps,
  DirectorCaptionPreviewProps,
  DirectorContinuityLedgerProps,
  DirectorFocusDepthProps,
  DirectorMusicBeatProps,
  DirectorNegativeBankProps,
  DirectorReferenceBoardProps,
  DirectorTextureStackProps,
  DirectorTransitionBridgeProps,
} from "../../features/video-director/signatureContracts"

export const StudioDirectorCameraPath: React.FC<DirectorCameraPathProps> = ({ type, speed, panDegrees, tiltDegrees, orbitDegrees }) => (
  <SubToolboxSurface tone="subtle" className="relative min-h-[210px] overflow-hidden">
    <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:25%_25%]" />
    <div className="absolute left-[15%] top-[42%] w-12 h-12 border-[3px] border-current rounded-[10px] bg-white grid place-items-center text-[9px] font-black">CAM</div>
    <div className="absolute right-[17%] top-[38%] w-12 h-12 border-[3px] border-current rounded-full bg-white grid place-items-center text-[18px] font-black"
      style={{ transform: `translate(${Math.max(-54, Math.min(54, panDegrees / 4))}px,${Math.max(-40, Math.min(40, -tiltDegrees / 3))}px)` }}>◎</div>
    <div className="absolute left-[28%] top-[29%] w-[46%] h-[46%] border-t-[5px] border-current rounded-full opacity-60"
      style={{ transform: `rotate(${Math.max(-70, Math.min(70, orbitDegrees / 3))}deg)` }} />
    <div className="absolute left-3 right-3 bottom-3 flex justify-between text-[10px] font-black uppercase">
      <span>{type}</span><span>{Math.round(speed * 100)}% speed</span><span>{panDegrees}° pan</span>
    </div>
  </SubToolboxSurface>
)

export const StudioDirectorFocusDepth: React.FC<DirectorFocusDepthProps> = ({ mode, focusDistanceMeters, depthStrength, bokeh }) => (
  <SubToolboxSurface tone="subtle" className="relative min-h-[210px] overflow-hidden grid place-items-center">
    <div className="absolute w-[54%] h-[54%] -translate-x-[34%] scale-[.74] border-[3px] border-current rounded-[10px] opacity-35 bg-white" />
    <div className="absolute w-[54%] h-[54%] border-[3px] border-current rounded-[10px] bg-white/80" style={{ opacity: Math.max(.35, 1 - depthStrength * .5) }} />
    <div className="absolute w-[54%] h-[54%] translate-x-[34%] scale-[.84] border-[3px] border-current rounded-[10px] opacity-55 bg-white"
      style={{ filter: `blur(${Math.round(bokeh * 5)}px)` }} />
    <div className="relative border-[3px] border-current rounded-[8px] bg-white px-3 py-2 text-[10px] font-black uppercase">Focus Plane</div>
    <div className="absolute left-3 right-3 bottom-3 flex justify-between text-[10px] font-black uppercase">
      <span>{mode}</span><span>{focusDistanceMeters}m</span><span>{Math.round(depthStrength * 100)}% depth</span>
    </div>
  </SubToolboxSurface>
)

export const StudioDirectorTextureStack: React.FC<DirectorTextureStackProps> = ({ grain, halation, bloom, vignette, filmStock }) => (
  <SubToolboxSurface tone="subtle" className="relative min-h-[220px] overflow-hidden p-4">
    {[["Grain", grain], ["Halation", halation], ["Bloom", bloom], ["Vignette", vignette]].map(([label, value], index) => (
      <div key={String(label)} className="absolute left-[10%] right-[10%] h-14 border-[3px] border-current rounded-[10px] bg-white flex items-center justify-between px-3 shadow-[0_5px_0_current]"
        style={{ top: 14 + index * 18, opacity: .95 - index * .08 }}>
        <strong className="text-[10px] font-black uppercase">{label}</strong>
        <span className="text-[10px] font-black">{value}%</span>
      </div>
    ))}
    <div className="absolute left-3 right-3 bottom-3 flex justify-between text-[10px] font-black uppercase">
      <span>{filmStock || "Digital Clean"}</span><span>Ordered Texture Stack</span>
    </div>
  </SubToolboxSurface>
)

export const StudioDirectorTransitionBridge: React.FC<DirectorTransitionBridgeProps> = ({ type, durationFrames, matchMotion }) => (
  <SubToolboxSurface tone="subtle" className="min-h-[190px] grid place-items-center p-5">
    <div className="w-full grid grid-cols-[1fr_minmax(120px,.72fr)_1fr] items-center">
      <div className="h-20 border-[3px] border-current rounded-l-[10px] bg-white grid place-items-center text-[18px] font-black">A</div>
      <div className="h-20 -mx-[3px] border-y-[3px] border-current bg-[color:var(--vt-subtoolbox-fill,#FA618A)]/20 grid place-items-center text-[10px] font-black uppercase"
        style={{ clipPath: "polygon(12% 0,88% 0,100% 50%,88% 100%,12% 100%,0 50%)" }}>{type}</div>
      <div className="h-20 border-[3px] border-current rounded-r-[10px] bg-white grid place-items-center text-[18px] font-black">B</div>
    </div>
    <div className="w-full flex justify-between text-[10px] font-black uppercase opacity-60">
      <span>{durationFrames} frames</span><span>{matchMotion ? "Motion Matched" : "Free Motion"}</span>
    </div>
  </SubToolboxSurface>
)

export const StudioDirectorMusicBeat: React.FC<DirectorMusicBeatProps> = ({ bpm, intensity, beatSync }) => (
  <SubToolboxSurface tone="subtle" className="min-h-[190px] p-4 flex flex-col justify-center">
    <div className="h-20 flex items-center gap-1">
      {Array.from({ length: 32 }).map((_, index) => (
        <span key={index} className="flex-1 min-w-[2px] rounded-full bg-[color:var(--vt-subtoolbox-fill,#FA618A)]"
          style={{ height: `${18 + ((index * 13) % 56)}%` }} />
      ))}
    </div>
    <div className="mt-2 grid grid-cols-8 gap-1 opacity-35">{Array.from({length:8}).map((_,i)=><span key={i} className="border-l-[2px] border-current h-3" />)}</div>
    <div className="mt-3 flex justify-between text-[10px] font-black uppercase">
      <span>{bpm} BPM</span><span>{Math.round(intensity * 100)}% intensity</span><span>{beatSync}</span>
    </div>
  </SubToolboxSurface>
)

export const StudioDirectorCaptionPreview: React.FC<DirectorCaptionPreviewProps> = ({ position, animation, maxWordsPerLine, burnIn }) => (
  <SubToolboxSurface tone="subtle" className="relative aspect-video overflow-hidden">
    <div className="absolute inset-[8%] border-[2px] border-dashed border-current opacity-35 rounded-[8px]" />
    <div className={`absolute left-[14%] right-[14%] min-h-10 border-[3px] border-current rounded-[8px] bg-white grid place-items-center text-[11px] font-black uppercase ${position === "top" ? "top-[12%]" : position === "upper-third" ? "top-[28%]" : position === "center" ? "top-[44%]" : position === "bottom" ? "bottom-[12%]" : "bottom-[25%]"}`}>
      Caption Preview
    </div>
    <div className="absolute left-3 right-3 bottom-3 flex justify-between text-[9px] font-black uppercase opacity-60">
      <span>{animation}</span><span>{maxWordsPerLine} words/line</span><span>{burnIn ? "Burn In" : "Sidecar"}</span>
    </div>
  </SubToolboxSurface>
)

export const StudioDirectorReferenceBoard: React.FC<DirectorReferenceBoardProps> = ({ referenceCount, seed, lockSeed, variationNoise }) => (
  <SubToolboxSurface tone="subtle" className="min-h-[230px] p-4 flex flex-col justify-between">
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: Math.max(3, Math.min(6, referenceCount || 3)) }).map((_, index) => (
        <div key={index} className="aspect-[4/3] border-[3px] border-current rounded-[10px] bg-white grid place-items-center text-[10px] font-black uppercase">
          {index < referenceCount ? `Ref ${index + 1}` : "+"}
        </div>
      ))}
    </div>
    <div className="flex justify-between text-[10px] font-black uppercase">
      <span>{referenceCount} references</span><span>{lockSeed ? "Locked" : "Free"} seed {seed ?? "Auto"}</span><span>{Math.round(variationNoise * 100)}% noise</span>
    </div>
  </SubToolboxSurface>
)

export const StudioDirectorContinuityLedger: React.FC<DirectorContinuityLedgerProps> = ({ entityCount, identityStrength, wardrobeStrength, environmentStrength }) => (
  <SubToolboxSurface tone="subtle" className="min-h-[210px] p-4 flex flex-col justify-center gap-3">
    {[["Identity", identityStrength], ["Wardrobe", wardrobeStrength], ["Environment", environmentStrength]].map(([label, value]) => (
      <div key={String(label)} className="grid grid-cols-[100px_1fr_44px] gap-3 items-center text-[10px] font-black uppercase">
        <strong>{label}</strong>
        <div className="h-5 border-[2px] border-current rounded-[7px] overflow-hidden bg-white"><span className="block h-full bg-[color:var(--vt-subtoolbox-fill,#FA618A)]" style={{ width: `${Number(value) * 100}%` }} /></div>
        <b>{Math.round(Number(value) * 100)}%</b>
      </div>
    ))}
    <div className="text-[10px] font-black uppercase opacity-60">{entityCount} continuity entities</div>
  </SubToolboxSurface>
)

export const StudioDirectorNegativeBank: React.FC<DirectorNegativeBankProps> = ({ tagCount, enforcement, freeText }) => (
  <SubToolboxSurface tone="subtle" className="min-h-[190px] p-4 flex flex-col justify-between">
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: Math.max(3, Math.min(8, tagCount || 3)) }).map((_, index) => (
        <span key={index} className="border-[2px] border-current rounded-[8px] bg-white px-3 py-2 text-[9px] font-black uppercase">
          {index < tagCount ? `Exclude ${index + 1}` : "Empty"}
        </span>
      ))}
    </div>
    <div className="flex justify-between text-[10px] font-black uppercase">
      <span>{enforcement}</span><span>{tagCount} tags</span><span>{freeText.trim() ? "Custom note" : "No note"}</span>
    </div>
  </SubToolboxSurface>
)
