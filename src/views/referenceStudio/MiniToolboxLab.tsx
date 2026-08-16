import React, { useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Check,
  Clock3,
  Expand,
  ExternalLink,
  FileText,
  Grid3X3,
  Image,
  LayoutList,
  ListFilter,
  Minus,
  Play,
  Plus,
  Send,
  Shrink,
  SlidersHorizontal,
  Upload,
} from "lucide-react"
import { SubToolbox, ToolboxScaffold } from "../../components/Toolbox"
import { getToolboxPaletteColors } from "../../styles/toolboxPalette"
import componentLibraryUrl from "../../assets/reference/viewtube-full-component-library.html?url"
import miniToolboxBundleUrl from "../../assets/reference/viewtube-mini-toolbox-bundle.html?url"

type MiniSize = "short" | "half" | "standard" | "wide" | "square" | "tall"

interface MiniToolboxProps {
  title: string
  code: string
  paletteIndex: number
  size?: MiniSize
  embedded?: boolean
  icon: React.ReactNode
  children: React.ReactNode
  glassy?: boolean
}

const getGlassyHeaderStyle = (startColor: string, endColor: string): React.CSSProperties => ({
  backgroundColor: startColor,
  backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) 40%, transparent 40%), linear-gradient(135deg, ${startColor}, ${endColor})`,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
})

const sizeClasses: Record<MiniSize, { height: string; span: string }> = {
  short: { height: "min-h-[104px]", span: "lg:col-span-8" },
  half: { height: "min-h-[104px]", span: "lg:col-span-4" },
  standard: { height: "min-h-[164px]", span: "lg:col-span-4" },
  wide: { height: "min-h-[164px]", span: "lg:col-span-8" },
  square: { height: "min-h-[320px] lg:aspect-square", span: "lg:col-span-4" },
  tall: { height: "min-h-[252px]", span: "lg:col-span-4" },
}

const controlClass =
  "min-h-9 border-[2px] border-black rounded-md bg-white px-2.5 py-1.5 text-[9px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,0.24)] transition-transform active:translate-x-px active:translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#1769ff] focus-visible:outline-offset-2 max-sm:min-h-11"

const fieldClass =
  "w-full min-w-0 min-h-9 border-[2px] border-black rounded-md bg-white px-2.5 py-1.5 text-[11px] font-extrabold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#1769ff] focus-visible:outline-offset-2 max-sm:min-h-11 max-sm:text-base"

const MiniToolboxToggleIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <span className="relative block size-5 rotate-45 transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-90 motion-reduce:transition-none" aria-hidden="true">
    <Expand
      size={20}
      strokeWidth={2.6}
      className={`absolute inset-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${open ? "rotate-180 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
    />
    <Shrink
      size={20}
      strokeWidth={2.6}
      className={`absolute inset-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${open ? "rotate-180 scale-100 opacity-100" : "rotate-0 scale-75 opacity-0"}`}
    />
  </span>
)

const MiniToolbox: React.FC<MiniToolboxProps> = ({
  title,
  code,
  paletteIndex,
  size = "standard",
  embedded = false,
  icon,
  children,
  glassy = false,
}) => {
  const palette = getToolboxPaletteColors(paletteIndex)
  const [open, setOpen] = useState(true)
  const contentId = React.useId()

  return (
    <article
      className={`min-w-0 self-start overflow-hidden border-[3px] border-black rounded-[10px] bg-white transition-[min-height] duration-300 ease-out motion-reduce:transition-none ${open ? sizeClasses[size].height : "min-h-0"} ${embedded ? "" : sizeClasses[size].span}`}
      style={{ boxShadow: `4px 4px 0 ${palette.header}70` }}
    >
      <header
        className="relative z-10 grid grid-cols-[44px_minmax(0,1fr)_auto] min-h-11 border-b-[3px] border-black"
        style={glassy ? getGlassyHeaderStyle(palette.header, palette.icon) : { backgroundColor: palette.header }}
      >
        <div
          className="grid place-items-center border-r-[3px] border-black"
          style={{ backgroundColor: palette.icon }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <h3 className="min-w-0 self-center px-2.5 text-[11px] font-[1000] uppercase leading-none truncate">
          {title}
        </h3>
        <div className="flex min-h-11 self-stretch items-center">
          <span className="mx-1.5 border-[2px] border-black rounded bg-white/70 px-1.5 py-1 text-[8px] font-black uppercase">
            {code}
          </span>
          <button
            type="button"
            aria-label={`${open ? "Collapse" : "Expand"} ${title}`}
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen((value) => !value)}
            className="group grid min-h-11 w-11 place-items-center self-stretch border-l-[3px] border-black bg-white/25 transition-colors hover:bg-white/55 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#1769ff] focus-visible:outline-offset-[-5px]"
          >
            <MiniToolboxToggleIcon open={open} />
          </button>
        </div>
      </header>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        style={{ marginTop: "-3px" }}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </article>
  )
}

interface MicroToolboxProps {
  label: string
  marker: string
  accent: string
  children: React.ReactNode
  glassy?: boolean
  gradientEnd?: string
}

const MicroToolbox: React.FC<MicroToolboxProps> = ({ label, marker, accent, children, glassy = false, gradientEnd = accent }) => {
  const [open, setOpen] = useState(true)
  const contentId = React.useId()

  return (
    <section className="min-w-0 self-start overflow-hidden border-[2px] border-black rounded-md bg-white shadow-[2px_2px_0_0_rgba(0,0,0,0.22)]">
      <header
        className="grid grid-cols-[28px_minmax(0,1fr)_28px] min-h-7 border-b-[2px] border-black"
        style={{
          ...(glassy ? getGlassyHeaderStyle(accent, gradientEnd) : { backgroundColor: accent }),
        }}
      >
        <span className="grid place-items-center border-r-[2px] border-black text-[10px] font-black" aria-hidden="true">
          {marker}
        </span>
        <strong className="self-center min-w-0 px-1.5 text-[8px] font-black uppercase truncate">{label}</strong>
        <button
          type="button"
          aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((value) => !value)}
          className="group grid min-h-7 place-items-center border-l-[2px] border-black bg-white/25 hover:bg-white/55 focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#1769ff] focus-visible:outline-offset-[-3px]"
        >
          <span className="scale-[0.68]">
            <MiniToolboxToggleIcon open={open} />
          </span>
        </button>
      </header>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        style={{ marginTop: "-2px" }}
      >
        <div className="min-h-0 overflow-hidden"><div className="p-2">{children}</div></div>
      </div>
    </section>
  )
}

interface WordToggleProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  label: string
}

const WordToggle: React.FC<WordToggleProps> = ({ options, value, onChange, label }) => (
  <div className="grid grid-flow-col auto-cols-fr overflow-hidden border-[2px] border-black rounded-md bg-white" aria-label={label} role="group">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={value === option}
        onClick={() => onChange(option)}
        className={`min-h-8 border-r-[2px] border-black px-2 py-1 text-[8px] font-black uppercase last:border-r-0 max-sm:min-h-11 ${
          value === option ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
)

const FlushScrollArea: React.FC = () => {
  const [scrollRatio, setScrollRatio] = useState(0)

  return (
    <div className="relative h-[190px] overflow-hidden border-t-[2px] border-black rounded-br-[7px]">
      <div
        className="vt-mini-scroll h-full overflow-y-auto overscroll-contain p-2 pr-5"
        onScroll={(event) => {
          const element = event.currentTarget
          const maxScroll = Math.max(1, element.scrollHeight - element.clientHeight)
          setScrollRatio(element.scrollTop / maxScroll)
        }}
      >
        <div className="grid gap-2">
          <MicroToolbox label="Audience" marker="A" accent="#7FE5D2">
            <select className={fieldClass} aria-label="Audience selection" defaultValue="all">
              <option value="all">All Viewers</option>
              <option value="new">New Viewers</option>
              <option value="returning">Returning Viewers</option>
            </select>
          </MicroToolbox>
          <MicroToolbox label="Window" marker="W" accent="#7FE5D2">
            <div className="grid grid-cols-3 overflow-hidden border-[2px] border-black rounded-md text-center text-[8px] font-black uppercase">
              <span className="bg-black text-white py-2">28D</span>
              <span className="border-l-[2px] border-black py-2">90D</span>
              <span className="border-l-[2px] border-black py-2">1Y</span>
            </div>
          </MicroToolbox>
          <MicroToolbox label="Format" marker="F" accent="#7FE5D2">
            <fieldset className="grid gap-2 text-[8px] font-black uppercase">
              <legend className="sr-only">Video format</legend>
              {[
                ["all", "All Videos"],
                ["shorts", "Shorts"],
                ["long", "Long Form"],
              ].map(([value, label]) => (
                <label key={value} className="flex min-h-7 items-center gap-2">
                  <input type="radio" name="mini-format" value={value} defaultChecked={value === "all"} className="size-4 accent-black" />
                  {label}
                </label>
              ))}
            </fieldset>
          </MicroToolbox>
          <MicroToolbox label="Sort" marker="S" accent="#7FE5D2">
            <select className={fieldClass} aria-label="Sort order" defaultValue="top">
              <option value="top">Top Performing</option>
              <option value="recent">Most Recent</option>
              <option value="review">Needs Review</option>
            </select>
          </MicroToolbox>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-3 border-l-[2px] border-black bg-transparent" aria-hidden="true">
        <span
          className="absolute right-0 h-16 w-[10px] bg-black"
          style={{ transform: `translateY(${scrollRatio * 124}px)` }}
        />
      </div>
    </div>
  )
}

const HierarchyMatrix: React.FC = () => {
  const [subtoolboxOpen, setSubtoolboxOpen] = useState([true, true])
  const subtoolboxes = [
    {
      title: "Prepare",
      icon: <Send size={20} />,
      paletteIndex: 1,
      minis: [
        { title: "Queue", icon: <Send size={18} />, micros: [["Review", "R"], ["Approve", "A"]] },
        { title: "Assets", icon: <Image size={18} />, micros: [["Browse", "B"], ["Upload", "U"]] },
        { title: "Metadata", icon: <FileText size={18} />, micros: [["Title", "T"], ["Tags", "G"]] },
        { title: "Checks", icon: <Check size={18} />, micros: [["Scan", "S"], ["Resolve", "R"]] },
      ],
    },
    {
      title: "Publish",
      icon: <Upload size={20} />,
      paletteIndex: 7,
      minis: [
        { title: "Schedule", icon: <Clock3 size={18} />, micros: [["Date", "D"], ["Time", "T"]] },
        { title: "Audience", icon: <Blocks size={18} />, micros: [["Region", "R"], ["Segment", "S"]] },
        { title: "Release", icon: <Play size={18} />, micros: [["Visibility", "V"], ["Notify", "N"]] },
        { title: "Results", icon: <BarChart3 size={18} />, micros: [["Views", "V"], ["CTR", "C"]] },
      ],
    },
  ]

  return (
    <section className="mb-6 border-[3px] border-black rounded-[10px] bg-white p-3 shadow-[5px_5px_0_0_rgba(0,0,0,0.26)]" aria-labelledby="hierarchy-matrix-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-black pb-2">
        <h2 id="hierarchy-matrix-title" className="text-lg font-[1000] uppercase">Toolbox Hierarchy Matrix</h2>
        <span className="text-[8px] font-black uppercase">2 subs / 4 minis each / 2 micros each</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {subtoolboxes.map((subtoolbox, subtoolboxIndex) => {
          const glassy = subtoolboxIndex === 1
          const subtoolboxPalette = getToolboxPaletteColors(subtoolbox.paletteIndex)

          return (
            <SubToolbox
            key={subtoolbox.title}
            title={subtoolbox.title}
            icon={subtoolbox.icon}
            paletteIndex={subtoolbox.paletteIndex}
            collapsible
            isOpen={subtoolboxOpen[subtoolboxIndex]}
            onToggle={() => setSubtoolboxOpen((values) => values.map((value, index) => index === subtoolboxIndex ? !value : value))}
            heightMode="compact"
            contentClassName="!p-2.5 bg-[#f8f8f6]"
            shellClassName="min-w-0 [&_h3]:!text-[18px] [&_h3]:!tracking-normal"
            headerStyle={glassy ? getGlassyHeaderStyle(subtoolboxPalette.header, subtoolboxPalette.icon) : undefined}
          >
            <div className="grid grid-cols-2 gap-2.5">
              {subtoolbox.minis.map((mini, miniIndex) => {
                const paletteIndex = subtoolboxIndex * 6 + miniIndex + 2

                return (
                  <MiniToolbox
                    key={mini.title}
                    title={mini.title}
                    code={`${subtoolboxIndex + 1}${miniIndex + 1}`}
                    paletteIndex={paletteIndex}
                    size="standard"
                    embedded
                    icon={mini.icon}
                    glassy={glassy}
                  >
                    <div className="grid grid-cols-2 gap-1.5 p-2">
                      {mini.micros.map(([label, marker], microIndex) => (
                        <MicroToolbox
                          key={label}
                          label={label}
                          marker={marker}
                          accent={getToolboxPaletteColors(paletteIndex + microIndex + 1).header}
                          gradientEnd={getToolboxPaletteColors(paletteIndex + microIndex + 2).header}
                          glassy={glassy}
                        >
                          <button type="button" className={`${controlClass} w-full min-h-7 px-1 max-sm:min-h-9`}>
                            {label}
                          </button>
                        </MicroToolbox>
                      ))}
                    </div>
                  </MiniToolbox>
                )
              })}
            </div>
            </SubToolbox>
          )
        })}
      </div>
    </section>
  )
}

interface EmbeddedReferenceToolboxProps {
  title: string
  subtitle: string
  helpText: string
  sourceUrl: string
  paletteIndex: number
  iframeTitle: string
  compact?: boolean
}

const EmbeddedReferenceToolbox: React.FC<EmbeddedReferenceToolboxProps> = ({
  title,
  subtitle,
  helpText,
  sourceUrl,
  paletteIndex,
  iframeTitle,
  compact = false,
}) => {
  const [open, setOpen] = useState(true)

  return (
    <ToolboxScaffold
      title={title}
      subtitle={subtitle}
      icon={<Grid3X3 />}
      paletteIndex={paletteIndex}
      collapsible
      isOpen={open}
      onToggle={() => setOpen((value) => !value)}
      outerClassName="max-sm:[&_header>div:first-child]:min-w-0 max-sm:[&_h1]:text-[18px] max-sm:[&_h1]:leading-tight max-sm:[&_h1]:tracking-normal max-sm:[&_h1]:whitespace-normal max-sm:[&_h1]:break-words"
      contentClassName="bg-[#d7d7d4] p-3 md:p-4"
      helpText={helpText}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-[2px] border-black rounded-md bg-white p-2 shadow-[2px_2px_0_0_rgba(0,0,0,0.22)]">
        <span className="text-[9px] font-black uppercase">Standalone source mounted inside the Reference Studio</span>
        <a href={sourceUrl} target="_blank" rel="noreferrer" className={`${controlClass} inline-flex items-center gap-1.5 bg-[#3FEE56]`}>
          <ExternalLink size={14} strokeWidth={2.5} /> Open Full Page
        </a>
      </div>
      <div className="overflow-hidden border-[3px] border-black rounded-[10px] bg-white shadow-[4px_4px_0_0_rgba(0,0,0,0.28)]">
        <iframe
          title={iframeTitle}
          src={sourceUrl}
          loading="lazy"
          className={`block w-full border-0 bg-white ${compact ? "h-[68vh] min-h-[620px] max-sm:min-h-[540px]" : "h-[78vh] min-h-[720px] max-sm:min-h-[620px]"}`}
        />
      </div>
    </ToolboxScaffold>
  )
}

const MiniToolboxLab: React.FC = () => {
  const [videoCount, setVideoCount] = useState(50)
  const [metadataTab, setMetadataTab] = useState("Title")
  const [wordMode, setWordMode] = useState("Best")
  const [scheduleMode, setScheduleMode] = useState("Now")
  const [loading, setLoading] = useState(true)
  const [labOpen, setLabOpen] = useState(true)
  const [systemOpen, setSystemOpen] = useState(true)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [checks, setChecks] = useState([true, true, false])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const readiness = useMemo(
    () => Math.round((checks.filter(Boolean).length / checks.length) * 100),
    [checks],
  )

  const setFiles = (files: FileList | null) => {
    setUploadedFiles(files ? Array.from(files, (file) => file.name) : [])
  }

  return (
    <div className="space-y-8">
     <ToolboxScaffold
      title="Mini Toolbox Lab"
      subtitle="Toolbox to subtoolbox to mini toolbox to micro toolbox"
      icon={<Blocks />}
      paletteIndex={0}
      collapsible
      isOpen={labOpen}
      onToggle={() => setLabOpen((value) => !value)}
      outerClassName="max-sm:[&_header>div:first-child]:min-w-0 max-sm:[&_h1]:text-[18px] max-sm:[&_h1]:leading-tight max-sm:[&_h1]:tracking-normal max-sm:[&_h1]:whitespace-normal max-sm:[&_h1]:break-words"
      contentClassName="bg-[#f3f4f6] p-4 md:p-6"
      helpText="Ten native component families that continue ViewTube's toolbox hierarchy at smaller scales."
    >
      <style>{`.vt-mini-scroll{scrollbar-width:none}.vt-mini-scroll::-webkit-scrollbar{display:none}`}</style>

      <HierarchyMatrix />

      <div className="mb-5 flex flex-wrap gap-2" aria-label="Mini toolbox design rules">
        {["5 / 4 / 3 / 2 PX Strokes", "12-Stop VT Spectrum", "Square Icon Rails", "Half / Full / Asset / Square", "Working States"].map((rule) => (
          <span key={rule} className="border-[2px] border-black rounded-md bg-white px-2 py-1.5 text-[9px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]">
            {rule}
          </span>
        ))}
      </div>

      <div className="mb-3 flex items-end justify-between gap-4 border-b-[4px] border-black">
        <h2 className="mb-2 text-xl font-[1000] uppercase">10 Mini Toolbox Families</h2>
        <span className="mb-2 text-right text-[9px] font-black uppercase">Native Reference Studio Components</span>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12" aria-label="Mini toolbox design families">
        <MiniToolbox title="01 Quick Publish" code="Short / Full" paletteIndex={0} size="short" icon={<ArrowRight size={23} strokeWidth={2.5} />}>
          <div className="relative flex items-center gap-2 p-3">
            <button type="button" className={`${controlClass} flex-1 bg-[#3FEE56]`} onClick={() => setPopoverOpen(false)}>Queue Video</button>
            <button type="button" aria-label="Open publish settings" aria-expanded={popoverOpen} onClick={() => setPopoverOpen((value) => !value)} className={`${controlClass} size-9 px-0 max-sm:size-11`}>•••</button>
            {popoverOpen && (
              <div className="absolute right-3 top-[52px] z-20 w-52 border-[3px] border-black rounded-lg bg-white p-2 shadow-[5px_5px_0_0_rgba(0,0,0,0.32)]">
                <label htmlFor="mini-visibility" className="mb-1 block text-[9px] font-black uppercase">Visibility</label>
                <select id="mini-visibility" className={fieldClass} defaultValue="private"><option value="private">Private</option><option value="unlisted">Unlisted</option><option value="public">Public</option></select>
              </div>
            )}
          </div>
        </MiniToolbox>

        <MiniToolbox title="02 Metric Step" code="Half" paletteIndex={1} size="half" icon={<Grid3X3 size={23} strokeWidth={2.5} />}>
          <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] m-3 overflow-hidden border-[2px] border-black rounded-md">
            <button type="button" aria-label="Decrease video count" onClick={() => setVideoCount((value) => Math.max(10, value - 10))} className="bg-black text-white"><Minus className="mx-auto" size={17} /></button>
            <output className="grid min-h-12 place-items-center bg-[#FFDA47] text-2xl font-[1000] tabular-nums">{videoCount}</output>
            <button type="button" aria-label="Increase video count" onClick={() => setVideoCount((value) => Math.min(1500, value + 10))} className="bg-black text-white"><Plus className="mx-auto" size={17} /></button>
          </div>
        </MiniToolbox>

        <MiniToolbox title="03 Asset Preview" code="16:9" paletteIndex={2} icon={<Image size={23} strokeWidth={2.5} />}>
          <div className="relative aspect-video overflow-hidden border-b-[3px] border-black bg-[#26203f]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_35%,rgba(54,224,246,.82)_36%_52%,transparent_53%),linear-gradient(30deg,rgba(250,97,138,.95)_0_34%,transparent_35%)]" />
            <button type="button" aria-label="Play asset preview" className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center border-[2px] border-black rounded-md bg-[#FFDA47]"><Play size={18} fill="currentColor" /></button>
          </div>
          <div className="flex items-center gap-2 p-2"><span className="border-[2px] border-black rounded px-2 py-1 text-[8px] font-black uppercase">Cinematic</span><button type="button" className={controlClass}>Select</button><button type="button" className={`${controlClass} bg-[#FF7AC8]`}>+ Tag</button></div>
        </MiniToolbox>

        <MiniToolbox title="04 Canvas Crop" code="1:1" paletteIndex={3} size="square" icon={<Grid3X3 size={23} strokeWidth={2.5} />}>
          <div className="relative grid min-h-[274px] place-items-center bg-[#e4e4e1] bg-[linear-gradient(90deg,transparent_49%,rgba(0,0,0,.12)_50%,transparent_51%),linear-gradient(transparent_49%,rgba(0,0,0,.12)_50%,transparent_51%)] bg-[length:20px_20px]">
            <div className="h-[78%] aspect-[9/16] border-[2px] border-black bg-[#528FFA] shadow-[4px_4px_0_0_rgba(0,0,0,.24)]" />
            <div className="absolute bottom-2 left-2 flex gap-2"><button type="button" aria-label="Zoom out" className={controlClass}>−</button><button type="button" className={`${controlClass} bg-[#3FEE56]`}>Fit</button><button type="button" aria-label="Zoom in" className={controlClass}>+</button></div>
          </div>
        </MiniToolbox>

        <MiniToolbox title="05 Upload Dock" code="Asset" paletteIndex={4} icon={<Upload size={23} strokeWidth={2.5} />}>
          <div className="p-3">
            <input ref={fileInputRef} type="file" multiple className="sr-only" aria-label="Choose video or thumbnail files" onChange={(event) => setFiles(event.target.files)} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); setFiles(event.dataTransfer.files) }}
              className="grid min-h-24 w-full place-items-center border-[3px] border-dashed border-black rounded-lg bg-[#ededeb] text-center focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#1769ff] focus-visible:outline-offset-2"
            >
              <span><Upload className="mx-auto" size={28} /><strong className="mt-1 block text-[9px] font-black uppercase">Drop Media</strong><small className="block text-[8px] font-extrabold uppercase">or click to upload</small></span>
            </button>
            <p className="mt-2 min-h-4 text-[9px] font-black uppercase" aria-live="polite">{uploadedFiles.length ? `${uploadedFiles.length} files selected` : ""}</p>
          </div>
        </MiniToolbox>

        <MiniToolbox title="06 Metadata Pages" code="Tabs" paletteIndex={5} size="wide" icon={<FileText size={23} strokeWidth={2.5} />}>
          <div className="p-3">
            <WordToggle options={["Title", "Details", "Checks"]} value={metadataTab} onChange={setMetadataTab} label="Metadata pages" />
            <div className="pt-3">
              {metadataTab === "Title" && <><label htmlFor="mini-title" className="mb-1 block text-[9px] font-black uppercase">Video Title</label><input id="mini-title" name="mini-title" autoComplete="off" className={fieldClass} placeholder="Type a working title…" /></>}
              {metadataTab === "Details" && <div className="grid gap-2 sm:grid-cols-2"><select className={fieldClass} aria-label="Video category" defaultValue="education"><option value="education">Education</option><option value="entertainment">Entertainment</option></select><select className={fieldClass} aria-label="Video language" defaultValue="english"><option value="english">English</option><option value="spanish">Spanish</option></select></div>}
              {metadataTab === "Checks" && <div className="grid gap-2 text-[9px] font-black uppercase"><label className="flex min-h-8 items-center gap-2"><input type="checkbox" defaultChecked className="size-4 accent-black" /> Includes Captions</label><label className="flex min-h-8 items-center gap-2"><input type="checkbox" className="size-4 accent-black" /> Contains Paid Promotion</label></div>}
            </div>
          </div>
        </MiniToolbox>

        <MiniToolbox title="07 Control Stack" code="Scroll" paletteIndex={6} size="tall" icon={<LayoutList size={23} strokeWidth={2.5} />}>
          <FlushScrollArea />
        </MiniToolbox>

        <MiniToolbox title="08 Word Toggle" code="Short" paletteIndex={7} size="half" icon={<SlidersHorizontal size={23} strokeWidth={2.5} />}>
          <div className="p-3"><WordToggle options={["Best", "Recent"]} value={wordMode} onChange={setWordMode} label="Result ordering" /></div>
        </MiniToolbox>

        <MiniToolbox title="09 Readiness" code="State" paletteIndex={8} icon={<BarChart3 size={23} strokeWidth={2.5} />}>
          <div className="grid gap-2 p-3">
            <div className="h-5 overflow-hidden border-[2px] border-black rounded bg-[#d7d7d4]" role="progressbar" aria-label="Publishing readiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={readiness}><div className="h-full bg-[#3FEE56]" style={{ width: `${readiness}%` }} /></div>
            <div className="flex justify-between text-[8px] font-black uppercase"><span>Publishing Readiness</span><span className="tabular-nums">{readiness}%</span></div>
            {["Thumbnail Selected", "Description Complete", "End Screen Assigned"].map((label, index) => (
              <label key={label} className="flex min-h-7 items-center gap-2 text-[8px] font-black uppercase"><input type="checkbox" checked={checks[index]} onChange={() => setChecks((values) => values.map((value, itemIndex) => itemIndex === index ? !value : value))} className="size-4 accent-black" />{label}</label>
            ))}
          </div>
        </MiniToolbox>

        <MiniToolbox title="10 State Deck" code={loading ? "Loading" : "Ready"} paletteIndex={9} icon={<ListFilter size={23} strokeWidth={2.5} />}>
          <div className="grid gap-2 p-3">
            <button type="button" aria-pressed={loading} onClick={() => setLoading((value) => !value)} className={`${controlClass} bg-black text-white`}>{loading ? "Show Ready State" : "Show Loading State"}</button>
            {loading ? <div className="grid gap-2" aria-label="Loading content"><span className="h-3 border-[2px] border-black rounded-sm bg-[#d7d7d4]" /><span className="h-3 w-3/4 border-[2px] border-black rounded-sm bg-[#d7d7d4]" /><span className="h-3 w-[88%] border-[2px] border-black rounded-sm bg-[#d7d7d4]" /></div> : <div className="flex min-h-16 items-center justify-center gap-2 border-[2px] border-black rounded-md bg-[#3FEE56] text-[10px] font-black uppercase"><Check size={18} /> Ready to Publish</div>}
          </div>
        </MiniToolbox>
      </section>

      <div className="mt-7">
        <SubToolbox
          title="Video Manager + Publisher"
          icon={<Blocks />}
          paletteIndex={6}
          collapsible
          isOpen={systemOpen}
          onToggle={() => setSystemOpen((value) => !value)}
          openUnits={4}
          contentClassName="!p-3 bg-[#f8f8f6]"
          shellClassName="max-sm:[&_h3]:text-[18px] max-sm:[&_h3]:tracking-normal"
        >
          <div className="grid gap-3 lg:grid-cols-2">
            <MiniToolbox title="Title Draft" code="Input" paletteIndex={10} size="short" embedded icon={<FileText size={22} />}><div className="flex gap-2 p-3"><input className={fieldClass} name="title-draft" autoComplete="off" aria-label="Draft video title" placeholder="Working title…" /><button type="button" className={`${controlClass} bg-[#3FEE56]`}>Save</button></div></MiniToolbox>
            <MiniToolbox title="Quick Actions" code="Buttons" paletteIndex={11} size="short" embedded icon={<Plus size={22} />}><div className="grid grid-cols-2 gap-2 p-3"><button type="button" className={`${controlClass} bg-[#3FEE56]`}>Duplicate</button><button type="button" className={`${controlClass} bg-[#FF7AC8]`}>Move</button></div></MiniToolbox>
            <MiniToolbox title="Thumbnail Slot" code="16:9" paletteIndex={0} embedded icon={<Image size={22} />}><div className="relative aspect-video bg-[#26203f]"><div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_35%,rgba(54,224,246,.82)_36%_52%,transparent_53%),linear-gradient(30deg,rgba(250,97,138,.95)_0_34%,transparent_35%)]" /><button type="button" aria-label="Choose thumbnail" className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center border-[2px] border-black rounded-md bg-[#FFDA47]"><Plus size={18} /></button></div></MiniToolbox>
            <MiniToolbox title="Schedule" code="Toggle" paletteIndex={1} embedded icon={<Clock3 size={22} />}><div className="grid gap-2 p-3"><WordToggle options={["Now", "Later"]} value={scheduleMode} onChange={setScheduleMode} label="Publish schedule" /><input type="datetime-local" name="publish-time" aria-label="Publish time" className={fieldClass} /></div></MiniToolbox>
            <MiniToolbox title="Description" code="Micro" paletteIndex={2} size="short" embedded icon={<ListFilter size={22} />}><div className="grid grid-cols-2 gap-2 p-3"><MicroToolbox label="Auto Chapters" marker="A" accent="#FFB880"><label className="flex items-center gap-2 text-[8px] font-black uppercase"><input type="checkbox" defaultChecked className="size-4 accent-black" /> Enabled</label></MicroToolbox><MicroToolbox label="Links" marker="L" accent="#FFB880"><button type="button" className={controlClass}>+ Add</button></MicroToolbox></div></MiniToolbox>
            <MiniToolbox title="Publish Check" code="Ready" paletteIndex={3} size="short" embedded icon={<Send size={22} />}><div className="p-3"><div className="h-5 overflow-hidden border-[2px] border-black rounded bg-[#d7d7d4]"><div className="h-full w-[84%] bg-[#3FEE56]" /></div><div className="mt-1 flex justify-between text-[8px] font-black uppercase"><span>4 of 5 Checks</span><span>84%</span></div></div></MiniToolbox>
          </div>
        </SubToolbox>
      </div>
     </ToolboxScaffold>

     <EmbeddedReferenceToolbox
      title="Mini Toolbox Component Bundle"
      subtitle="Compact interactive controls and hierarchy reference"
      helpText="The supplied MiniToolbox component bundle, reformatted with denser spacing for Reference Studio use."
      sourceUrl={miniToolboxBundleUrl}
      paletteIndex={1}
      iframeTitle="ViewTube Mini Toolbox Component Bundle"
      compact
     />

     <EmbeddedReferenceToolbox
      title="Full Component Library"
      subtitle="Interactive ViewTube controls and curated asset-module layouts"
      helpText="The complete standalone component reference, including two examples of every asset-module layout."
      sourceUrl={componentLibraryUrl}
      paletteIndex={2}
      iframeTitle="ViewTube Full Component Library"
     />
    </div>
  )
}

export default MiniToolboxLab
