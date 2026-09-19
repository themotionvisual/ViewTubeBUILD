import React from "react"
import { Crosshair, Lightbulb, MonitorPlay } from "lucide-react"
import { SubToolboxSurface } from "../../components/subtoolbox/SubToolboxPrimitives"
import type {
  DirectorAudioStageProps,
  DirectorCompositionControlProps,
  DirectorLensControlProps,
  DirectorLightingControlProps,
  DirectorMoodControlProps,
  DirectorOutputFrameProps,
  DirectorPacingControlProps,
  DirectorPaletteProps,
} from "../../features/video-director/signatureContracts"

export const StudioDirectorLensVisual: React.FC<DirectorLensControlProps & { movement?: string }> = ({
  focalLength,
  aperture,
  movement,
}) => {
  const fieldWidth = Math.max(18, Math.min(86, 90 - Math.log2(Math.max(1, focalLength) / 14) * 16))
  return (
    <SubToolboxSurface tone="subtle" className="relative overflow-hidden min-h-[190px] grid place-items-center">
      <div className="absolute inset-3 border-[3px] border-current rounded-[10px] opacity-25" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[76%] border-[3px] border-current rounded-[10px] opacity-70"
        style={{ width: `${fieldWidth}%` }}
      />
      <Crosshair size={50} strokeWidth={2.5} aria-hidden="true" />
      <div className="absolute left-3 right-3 bottom-3 grid grid-cols-3 gap-2 text-[10px] font-black uppercase">
        <span>{focalLength}mm</span>
        <span className="text-center">f/{aperture}</span>
        <span className="text-right">{movement || "Auto"}</span>
      </div>
    </SubToolboxSurface>
  )
}

export const StudioDirectorMoodVisual: React.FC<DirectorMoodControlProps> = ({ horizontal, vertical }) => (
  <SubToolboxSurface tone="subtle" className="relative min-h-[200px] overflow-hidden">
    <div className="absolute left-1/2 top-3 bottom-3 border-l-[2px] border-current opacity-25" />
    <div className="absolute top-1/2 left-3 right-3 border-t-[2px] border-current opacity-25" />
    <span className="absolute left-3 top-3 text-[10px] font-black uppercase opacity-55">Somber</span>
    <span className="absolute right-3 top-3 text-[10px] font-black uppercase opacity-55">Triumphant</span>
    <span className="absolute left-3 bottom-3 text-[10px] font-black uppercase opacity-55">Calm</span>
    <span className="absolute right-3 bottom-3 text-[10px] font-black uppercase opacity-55">Energetic</span>
    <span
      className="absolute w-9 h-9 rounded-full border-[3px] border-current bg-white shadow-[3px_3px_0_current]"
      style={{
        left: `calc(${((horizontal + 1) / 2) * 100}% - 18px)`,
        top: `calc(${((1 - vertical) / 2) * 100}% - 18px)`,
      }}
    />
  </SubToolboxSurface>
)

export const StudioDirectorPaletteVisual: React.FC<DirectorPaletteProps> = ({ colors, exactLock }) => (
  <div className="grid grid-cols-3 sm:grid-cols-6 border-[3px] border-current rounded-[10px] overflow-hidden min-h-[104px]">
    {colors.map((color, index) => (
      <div key={`${color}-${index}`} className="relative min-h-[92px]" style={{ backgroundColor: color }}>
        <span className="absolute bottom-1 left-1 text-[9px] font-black px-1 bg-white/80 rounded">{color.toUpperCase()}</span>
      </div>
    ))}
    {exactLock ? <span className="absolute sr-only">Palette is exactly locked.</span> : null}
  </div>
)

export const StudioDirectorLightingVisual: React.FC<DirectorLightingControlProps> = ({
  azimuth,
  elevation,
  temperatureK,
}) => {
  const x = 50 + Math.sin((azimuth * Math.PI) / 180) * 35
  const y = 50 - Math.sin((elevation * Math.PI) / 180) * 35
  return (
    <SubToolboxSurface tone="subtle" className="relative min-h-[210px] grid place-items-center overflow-hidden">
      <div className="w-32 h-32 rounded-full border-[3px] border-current bg-white/60 shadow-inner" />
      <div
        className="absolute w-9 h-9 rounded-full border-[3px] border-current"
        style={{
          left: `calc(${x}% - 18px)`,
          top: `calc(${y}% - 18px)`,
          backgroundColor: temperatureK < 4500 ? "#FFB15C" : temperatureK > 7000 ? "#A9D8FF" : "#FFF0B4",
        }}
      />
      <Lightbulb size={34} strokeWidth={2.5} aria-hidden="true" />
      <div className="absolute left-3 right-3 bottom-3 flex justify-between text-[10px] font-black uppercase">
        <span>{azimuth}° azimuth</span><span>{elevation}° elevation</span><span>{temperatureK}K</span>
      </div>
    </SubToolboxSurface>
  )
}

export const StudioDirectorCompositionVisual: React.FC<DirectorCompositionControlProps> = ({
  subjectX,
  subjectY,
  horizonY,
  safeZones,
}) => (
  <SubToolboxSurface tone="subtle" className="relative aspect-video overflow-hidden">
    <div className="absolute inset-y-0 left-1/3 border-l-[2px] border-current opacity-25" />
    <div className="absolute inset-y-0 left-2/3 border-l-[2px] border-current opacity-25" />
    <div className="absolute inset-x-0 top-1/3 border-t-[2px] border-current opacity-25" />
    <div className="absolute inset-x-0 top-2/3 border-t-[2px] border-current opacity-25" />
    <div className="absolute left-0 right-0 border-t-[3px] border-current opacity-55" style={{ top: `${horizonY * 100}%` }} />
    {safeZones ? <div className="absolute inset-[8%] border-[2px] border-dashed border-current opacity-40 rounded-[8px]" /> : null}
    <div
      className="absolute w-12 h-12 rounded-full border-[3px] border-current bg-white/80 shadow-[3px_3px_0_current]"
      style={{ left: `calc(${subjectX * 100}% - 24px)`, top: `calc(${subjectY * 100}% - 24px)` }}
    />
  </SubToolboxSurface>
)

export const StudioDirectorPacingVisual: React.FC<DirectorPacingControlProps> = ({ duration, hook, hold }) => {
  const safeDuration = Math.max(1, duration)
  const hookPct = Math.min(100, (hook / safeDuration) * 100)
  const holdPct = Math.min(100, (hold / safeDuration) * 100)
  return (
    <SubToolboxSurface tone="subtle" className="p-4 min-h-[126px] flex flex-col justify-center">
      <div className="h-14 border-[3px] border-current rounded-[8px] overflow-hidden flex">
        <div className="h-full opacity-80" style={{ width: `${hookPct}%`, background: "var(--vt-subtoolbox-fill, #FA618A)" }} />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full opacity-60" style={{ width: `${holdPct}%`, background: "var(--vt-subtoolbox-fill, #FA618A)" }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-black uppercase opacity-60">
        <span>Hook {hook}s</span><span>{duration}s total</span><span>Hold {hold}s</span>
      </div>
    </SubToolboxSurface>
  )
}

export const StudioDirectorAudioStage: React.FC<DirectorAudioStageProps> = ({ width, targetLufs }) => (
  <SubToolboxSurface tone="subtle" className="relative aspect-[2/1] overflow-hidden">
    <div className="absolute inset-0 grid grid-cols-5 grid-rows-3 opacity-20">
      {Array.from({ length: 15 }).map((_, index) => <span key={index} className="border-r border-b border-current" />)}
    </div>
    <div className="absolute left-[18%] top-[42%] w-8 h-8 rounded-full border-[3px] border-current bg-white grid place-items-center text-[8px] font-black">SFX</div>
    <div className="absolute left-[49%] top-[48%] w-10 h-10 rounded-full border-[3px] border-current bg-white grid place-items-center text-[8px] font-black">VO</div>
    <div className="absolute right-[14%] top-[30%] w-9 h-9 rounded-full border-[3px] border-current bg-white grid place-items-center text-[8px] font-black">AMB</div>
    <div className="absolute left-3 right-3 bottom-3 flex justify-between text-[10px] font-black uppercase">
      <span>{Math.round(width * 100)}% spatial width</span><span>{targetLufs} LUFS target</span>
    </div>
  </SubToolboxSurface>
)

export const StudioDirectorOutputFrame: React.FC<DirectorOutputFrameProps> = ({ ratio, quality, outputs }) => {
  const aspect = ratio === "9:16" ? "9 / 16" : ratio === "1:1" ? "1 / 1" : ratio === "21:9" ? "21 / 9" : "16 / 9"
  return (
    <SubToolboxSurface tone="subtle" className="min-h-[220px] grid place-items-center p-4">
      <div
        className="max-h-[176px] max-w-full border-[4px] border-current rounded-[10px] bg-white grid place-items-center"
        style={{ aspectRatio: aspect, width: ratio === "9:16" ? "96px" : "78%" }}
      >
        <div className="text-center">
          <MonitorPlay size={32} className="mx-auto" />
          <strong className="block text-[14px] font-black uppercase mt-1">{ratio}</strong>
          <small className="text-[10px] font-black uppercase opacity-55">{quality} · {outputs} output{outputs === 1 ? "" : "s"}</small>
        </div>
      </div>
    </SubToolboxSurface>
  )
}
