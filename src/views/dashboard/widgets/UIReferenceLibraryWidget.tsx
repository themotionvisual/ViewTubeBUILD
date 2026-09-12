import React, { useMemo, useState } from "react"
import {
  Check,
  ImagePlus,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Star,
  UploadCloud,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetActionButton,
  WidgetAlphabeticalTag,
  WidgetBadge,
  WidgetChoice,
  WidgetDisclosure,
  WidgetDropzone,
  WidgetFooter,
  WidgetHeaderStepper,
  WidgetHeaderToggle,
  WidgetMediaUploadAction,
  WidgetMediaUploadFrame,
  WidgetMetric,
  WidgetScrollArea,
  WidgetSection,
  WidgetSplitButton,
  WidgetStatePanel,
  WidgetStepTabs,
  WidgetSwitch,
  WidgetTag,
  WidgetTooltip,
} from "../WidgetPrimitives"
import {
  WidgetCheckbox,
  WidgetIconBadge,
  WidgetIconButton,
  WidgetLeftSplitBadge,
  WidgetLeftSplitButton,
  WidgetLiveBadge,
  WidgetPagination,
  WidgetProgressBar,
  WidgetRadio,
  WidgetSearchInput,
  WidgetSizedButton,
  WidgetSizedSelect,
  WidgetSpectrumFillBadge,
  WidgetStepper,
  WidgetTextInput,
  WidgetToggleSwitch,
  WidgetVideoSelect,
  type WidgetControlHeight,
  type WidgetPrimitiveTone,
  type WidgetSplitIconStyle,
} from "../WidgetPrimitiveExtensions"
import { WIDGET_BADGE_SPECTRUM } from "../WidgetPrimitives"
import { getDashboardWidgetPaletteColors } from "../../../styles/toolboxPalette"

type ReferenceCategory = "all" | "controls" | "video" | "progress" | "tags" | "media" | "navigation" | "matrix" | "states"

const CONTROL_HEIGHTS: WidgetControlHeight[] = [18, 24, 32, 38]
const CONTROL_FONT_SIZES: Record<WidgetControlHeight, number> = { 18: 8, 24: 10, 32: 12, 38: 16 }
const CONTROL_TONES: WidgetPrimitiveTone[] = ["default", "primary", "secondary"]
const REFERENCE_PALETTE_NAMES = ["ROSE", "CORAL", "ORANGE", "YELLOW", "LIME", "GREEN", "TEAL", "CYAN", "ROYAL", "PURPLE", "MAGENTA", "PINK"] as const
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

const VIDEO_OPTIONS = [
  { value: "v1", label: "Napoleon's Last Great Victory", meta: "12:42 · 48,230 views", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
  { value: "v2", label: "Austerlitz: The Battle Explained", meta: "30:04 · 73,910 views", thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg" },
  { value: "v3", label: "The Emperor's Men", meta: "08:18 · 31,845 views", thumbnail: "https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg" },
]

const SizeVariants = ({ children, square = false }: { children: (height: WidgetControlHeight) => React.ReactNode; square?: boolean }) => (
  <div className={square ? "widget-reference-square-variants" : "widget-reference-variants"}>
    {CONTROL_HEIGHTS.map((height) => (
      <div className="widget-reference-variant" key={height}>
        <small>{height}px / {CONTROL_FONT_SIZES[height]}px text / 1000</small>
        {children(height)}
      </div>
    ))}
  </div>
)

const ToneRows = ({ render, square = false }: { render: (tone: WidgetPrimitiveTone, height: WidgetControlHeight) => React.ReactNode; square?: boolean }) => (
  <div className="grid gap-2">{CONTROL_TONES.map((tone) => <div key={tone} className="grid gap-1"><small className="text-[8px] font-black uppercase tracking-wider opacity-55">{tone}</small><SizeVariants square={square}>{(height) => render(tone, height)}</SizeVariants></div>)}</div>
)

type UIReferenceLibraryWidgetProps = Omit<React.ComponentProps<typeof WidgetShell>, "children" | "headerContent" | "icon">

export default function UIReferenceLibraryWidget({ widget, ...common }: UIReferenceLibraryWidgetProps) {
  const [activeCategory, setActiveCategory] = useState<ReferenceCategory>("all")
  const [paletteIndex, setPaletteIndex] = useState(7)
  const [selectValue, setSelectValue] = useState("public")
  const [selectedVideo, setSelectedVideo] = useState("v1")
  const [headerToggleValue, setHeaderToggleValue] = useState("draft-1")
  const [stepperValue, setStepperValue] = useState("Step 1 of 4")
  const [stepTabValue, setStepTabValue] = useState("meta")
  const [switchValue, setSwitchValue] = useState(true)
  const [checkboxValue, setCheckboxValue] = useState(true)
  const [radioValue, setRadioValue] = useState("b")
  const [textValue, setTextValue] = useState("Sample Title Input")
  const [tags, setTags] = useState(["viewtube", "analytics", "creator"])
  const [hasThumbnail, setHasThumbnail] = useState(false)
  const [statePanelStatus, setStatePanelStatus] = useState<"loading" | "ready" | "empty" | "blocked" | "stale" | "error">("ready")
  const [matrixStepper, setMatrixStepper] = useState(10)
  const [matrixPage, setMatrixPage] = useState(2)
  const [matrixToggle, setMatrixToggle] = useState(true)
  const [matrixRadio, setMatrixRadio] = useState<WidgetPrimitiveTone>("primary")
  const [matrixCheck, setMatrixCheck] = useState(true)
  const [matrixSearch, setMatrixSearch] = useState("")
  const previewWidget = useMemo(() => ({ ...widget, ...getDashboardWidgetPaletteColors(paletteIndex) }), [paletteIndex, widget])

  const headerContent = <div className="widget-reference-header-controls"><WidgetHeaderToggle label="Reference category" value={activeCategory} items={[{id:"all",label:"ALL"},{id:"controls",label:"CONTROLS"},{id:"matrix",label:"MATRIX"},{id:"video",label:"VIDEO"},{id:"progress",label:"BARS"},{id:"tags",label:"TAGS"},{id:"media",label:"MEDIA"},{id:"navigation",label:"NAV"},{id:"states",label:"STATES"}]} onChange={(value)=>setActiveCategory(value as ReferenceCategory)}/><WidgetHeaderStepper label="Widget color palette" value={`${REFERENCE_PALETTE_NAMES[paletteIndex]} ${paletteIndex+1}/12`} onPrevious={()=>setPaletteIndex((current)=>(current+11)%12)} onNext={()=>setPaletteIndex((current)=>(current+1)%12)}/></div>

  const sectionHeading=(title:string,detail:string)=><header className="flex items-center justify-between gap-2 border-b pb-2" style={{borderColor:"color-mix(in srgb, var(--widget-color) 30%, transparent)"}}><strong className="text-xs font-black uppercase tracking-wider">{title}</strong><span className="text-[9px] font-black uppercase opacity-55">{detail}</span></header>
  const familyHeading=(title:string,detail:string)=><div className="widget-reference-family-title"><span>{title}</span><small>{detail}</small></div>
  const splitFamily=(iconStyle:WidgetSplitIconStyle,title:string,detail:string)=><div className="widget-reference-family">{familyHeading(title,detail)}<ToneRows render={(tone,height)=><WidgetLeftSplitButton height={height} tone={tone} iconStyle={iconStyle} icon={<Sparkles/>} width="full">Split Left</WidgetLeftSplitButton>}/></div>

  return <WidgetShell widget={previewWidget} headerContent={headerContent} icon={<Layers size={22}/>} {...common}><WidgetScrollArea ariaLabel="ViewTube Widget Component Reference Library" contentClassName="flex min-h-full flex-col gap-3 p-3">
    {(activeCategory==="all"||activeCategory==="controls")&&<WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">{sectionHeading("1. Standard Controls","Canonical type scale · 1000 weight")}<p className="text-[10px] font-bold uppercase opacity-60">Every sized primitive uses the canonical ViewTube type scale: 18px height = 8px text; 24px = 10px; 32px = 12px; 38px = 16px. All component text is 1000 weight. Default / primary / secondary tones share the same size contract.</p><div className="widget-reference-family">{familyHeading("Buttons","3 tones × 4 heights")}<ToneRows render={(tone,height)=><WidgetSizedButton height={height} tone={tone}>{tone==="default"?"Button":tone}</WidgetSizedButton>}/></div>{splitFamily("white-on-color","Split Left Buttons","White icon / colored bay")}{splitFamily("color-on-light","Split Left Buttons","Colored icon / light bay")}<div className="widget-reference-family">{familyHeading("Text Inputs","Canonical type scale")}<ToneRows render={(tone,height)=><WidgetTextInput height={height} tone={tone} value={textValue} onChange={(event)=>setTextValue(event.currentTarget.value)} aria-label={`${tone} ${height}px text input`}/>} /></div><div className="widget-reference-family">{familyHeading("Dropdown Menus","Canonical type scale")}<ToneRows render={(tone,height)=><WidgetSizedSelect height={height} tone={tone} value={selectValue} onChange={setSelectValue} label={`${tone} ${height}px dropdown`} options={[{value:"public",label:"PUBLIC"},{value:"unlisted",label:"UNLISTED"},{value:"private",label:"PRIVATE"}]}/>} /></div></WidgetSection>}
    {(activeCategory==="all"||activeCategory==="video")&&<WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">{sectionHeading("2. Video Select","Canonical type scale")} {(["white-on-color","color-on-light"] as WidgetSplitIconStyle[]).map(iconStyle=><div className="widget-reference-family" key={iconStyle}>{familyHeading("Video Selector",iconStyle==="white-on-color"?"White icon / colored bay":"Colored icon / light bay")}<ToneRows render={(tone,height)=><WidgetVideoSelect height={height} tone={tone} iconStyle={iconStyle} value={selectedVideo} onChange={setSelectedVideo} label={`${tone} select video ${height}px`} options={VIDEO_OPTIONS}/>} /></div>)}</WidgetSection>}
    {(activeCategory==="all"||activeCategory==="progress")&&<WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">{sectionHeading("3. Progress Bars","Canonical type scale")}<ToneRows render={(tone,height)=><WidgetProgressBar height={height} tone={tone} value={tone==="default"?82:tone==="primary"?64:43} label={tone==="default"?"napoleon":tone==="primary"?"austerlitz":"cavalry"} displayValue={tone==="default"?"82%":tone==="primary"?"64%":"43%"}/>} /></WidgetSection>}
    {(activeCategory==="all"||activeCategory==="matrix")&&<WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">{sectionHeading("3b. Matrix Primitives","3 tones × 4 heights")}<div className="widget-reference-family">{familyHeading("Square Icon Buttons","1:1")}<ToneRows square render={(tone,height)=><WidgetIconButton height={height} tone={tone} label="Add" icon={<Plus strokeWidth={2.5}/>}/>} /></div><ToneRows render={(tone,height)=><WidgetStepper height={height} tone={tone} label="Quantity" value={matrixStepper} onChange={setMatrixStepper} min={0} max={99}/>} /><ToneRows render={(tone,height)=><WidgetPagination height={height} tone={tone} page={matrixPage} pageCount={3} onChange={setMatrixPage}/>} /><ToneRows render={(tone,height)=><WidgetToggleSwitch height={height} tone={tone} label="Toggle" checked={matrixToggle} onChange={setMatrixToggle}/>} /><ToneRows render={(tone,height)=><WidgetSearchInput height={height} tone={tone} value={matrixSearch} onChange={setMatrixSearch} label="Search"/>} /></WidgetSection>}
    {(activeCategory==="all"||activeCategory==="tags")&&<WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">{sectionHeading("4. Tags + Badges","A–Z spectrum")}<div className="flex flex-wrap gap-1">{ALPHABET.map((letter,index)=><WidgetAlphabeticalTag key={letter} label={`${letter} TAG`} colorIndex={Math.floor(index*12/26)}/>)}</div><div className="flex flex-wrap gap-2"><WidgetBadge tone="success">Ready</WidgetBadge><WidgetLiveBadge>Live</WidgetLiveBadge><WidgetSpectrumFillBadge>Signal</WidgetSpectrumFillBadge><WidgetLeftSplitBadge icon={<Check size={12}/>}>Approved</WidgetLeftSplitBadge></div></WidgetSection>}
    {(activeCategory==="all"||activeCategory==="media")&&<WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">{sectionHeading("5. Media","Upload primitives")}<WidgetMediaUploadFrame icon={<UploadCloud/>} title="Drop media" subtitle="16:9 default upload frame"/><WidgetMediaUploadAction icon={<ImagePlus/>} label="Choose image"/><WidgetDropzone title="Drop file" subtitle="or click to browse"/><WidgetChoice selected={hasThumbnail} onClick={()=>setHasThumbnail(!hasThumbnail)} label="Include thumbnail"/></WidgetSection>}
    {(activeCategory==="all"||activeCategory==="navigation")&&<WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">{sectionHeading("6. Navigation","Existing primitives")}<WidgetHeaderToggle label="Draft" value={headerToggleValue} items={[{id:"draft-1",label:"DRAFT 1"},{id:"draft-2",label:"DRAFT 2"}]} onChange={setHeaderToggleValue}/><WidgetHeaderStepper label="Step" value={stepperValue} onPrevious={()=>setStepperValue("Step 1 of 4")} onNext={()=>setStepperValue("Step 2 of 4")}/><WidgetStepTabs value={stepTabValue} items={[{id:"meta",label:"META"},{id:"visual",label:"VISUAL"}]} onChange={setStepTabValue}/><WidgetSwitch checked={switchValue} onChange={setSwitchValue} label="Enabled"/><WidgetFooter><WidgetActionButton tone="primary">Save</WidgetActionButton></WidgetFooter></WidgetSection>}
    {(activeCategory==="all"||activeCategory==="states")&&<WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">{sectionHeading("7. States","Loading / ready / empty / blocked / stale / error")}<WidgetStatePanel status={statePanelStatus}/><div className="flex flex-wrap gap-1">{(["loading","ready","empty","blocked","stale","error"] as const).map(status=><button key={status} className="vt-button" onClick={()=>setStatePanelStatus(status)}>{status}</button>)}</div></WidgetSection>}
  </WidgetScrollArea></WidgetShell>
}
