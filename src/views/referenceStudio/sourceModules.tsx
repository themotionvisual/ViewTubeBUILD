import React, { useMemo, useState } from "react"
import {
 AlertCircle,
 Bell,
 Calendar,
 Check,
 ChevronDown,
 FileVideo,
 FolderTree,
 Edit,
 Image,
 Layers,
 Minus,
 Palette,
 Plus,
 Save,
 Sparkles,
 Upload,
 Video,
 X,
 Zap,
} from "lucide-react"

type SourceKey = "sectionCE" | "toolboxSet" | "shim" | "ustube"

type SourceCategory =
 | "Controls"
 | "Inputs"
 | "Navigation"
 | "Feedback/Status"
 | "Cards/Media"
 | "Dialogs/Popups"
 | "Trees/Structure"

export type SourceComponentId =
 | "ce_analytics_protocol"
 | "ce_viral_passing"
 | "ce_audience_matrix"
 | "ce_retention_pulse"
 | "ce_thumbnail_studio"
 | "ce_storyboard_planner"
 | "ce_asset_vault"
 | "ce_media_analyzer"
 | "ce_user_feedback"
 | "ce_hook_architect"
 | "ce_box02_graphic"
 | "ce_box02_minimalist"
 | "ce_box02_cinematic"
 | "ce_box04_toggles"
 | "ce_box04_checkboxes"
 | "ce_box04_radios"
 | "ce_box05_channel_url"
 | "ce_box05_category"
 | "ce_box05_daily_stats"
 | "ce_box09_kpi_cards"
 | "ce_box13_sidebar_nav"
 | "ce_box14_collapsible_tree"
 | "ce_box17_sync_tooltip"
 | "ce_box18_modal_dialog"
 | "ce_box22_video_cards"
 | "ce_box22_status_pills"
 | "ce_vault_module"
 | "set1_checker_avatars_swatches"
 | "set1_tags_chips_separators"
 | "set1_jdmkrs_overlap"
 | "set1_accordions"
 | "set1_dividers_marquee"
 | "set1_horizontal_stepper"
 | "set1_timeline"
 | "set1_pagination"
 | "set1_download_upload_storage_meters"
 | "set1_low_mid_high_meters"
 | "set1_small_big_slider"
 | "set1_loading_circles"
 | "set1_progress_rings"
 | "set1_top_toggle"
 | "set1_color_picker_stack"
 | "set1_multiline"
 | "set1_editable_text"
 | "set1_single_buttons"
 | "shim_pink_loading_bar"
 | "shim_live_status"
 | "shim_system_operational"
 | "shim_complex_controls"
 | "shim_hook_retention"
 | "shim_hover_me"
 | "shim_tactile_hardware"
 | "shim_console_matrix"
 | "shim_console_media_strip"
 | "ustube_analytics_toolbox"
 | "ustube_algorithm_architect"
 | "ustube_keyword_research"
 | "ustube_strategy_chat"
 | "ustube_impressions_trend"
 | "ustube_views_histogram"
 | "ustube_revenue_distribution"
 | "ustube_performance_bin"
 | "ustube_ability_vectors"
 | "ustube_hook_effectiveness"
 | "ustube_inputs_four"
 | "ustube_resizable_description"
 | "ustube_add_input_button"
 | "ustube_sliders_three"
 | "ustube_toggles_two"
 | "ustube_button_small_cyan"
 | "ustube_button_small_lime"
 | "ustube_hover_tip_button"
 | "ustube_tasks_with_strike"
 | "ustube_channel_goals_progress"
 | "ustube_video_manager_box"
 | "ustube_content_calendar_box"
 | "ustube_loading_states"
 | "ustube_dialog_notifications"

export interface SourceInteractionContract {
 id: SourceComponentId
 source: SourceKey
 category: SourceCategory
 title: string
 destination: string
 interactions: string[]
 notes?: string
}

export interface SourceComponentModule extends SourceInteractionContract {
 render: React.ReactNode
}

export interface SourceModuleCollection {
 controls: React.ReactNode
 inputs: React.ReactNode
 navigation: React.ReactNode
 feedback: React.ReactNode
 cardsMedia: React.ReactNode
 dialogs: React.ReactNode
 trees: React.ReactNode
 contracts: SourceComponentModule[]
}

const CARD = "border-[3px] border-black rounded-xl bg-white p-3"
const LIGHT_CARD = "border-[3px] border-black rounded-xl bg-[#f3f4f6] p-3"
const CAPTION = "text-[9px] font-black uppercase tracking-[0.14em] text-black/45 mb-2"

const toneLightBySource: Record<SourceKey, string> = {
 sectionCE: "rgba(255,177,88,0.24)",
 toolboxSet: "rgba(36,211,255,0.24)",
 shim: "rgba(255,227,87,0.24)",
 ustube: "rgba(255,116,151,0.24)",
}

const renderCard = (
 source: SourceKey,
 title: string,
 children: React.ReactNode,
): React.ReactNode => (
 <div className={CARD} style={{ boxShadow: `4px 4px 0 0 ${toneLightBySource[source]}` }}>
  <div className={CAPTION}>{title}</div>
  {children}
 </div>
)

const SourceHeader: React.FC<{
 title: string
 subtitle?: string
 tone: string
}> = ({ title, subtitle, tone }) => (
 <div className="border-[3px] border-black rounded-xl overflow-hidden bg-white">
  <div className="h-10 border-b-[3px] border-black px-3 flex items-center justify-between" style={{ background: tone }}>
   <span className="text-[10px] font-black uppercase tracking-[0.14em]">{title}</span>
   <Sparkles size={12} strokeWidth={2.8} />
  </div>
  {subtitle ? (
   <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] opacity-55">{subtitle}</div>
  ) : null}
 </div>
)

const tagTone = ["#FF33AA", "#CCFF00", "#24D3FF", "#FFE357", "#FFB158"]

const TagPills: React.FC<{ items: string[]; compact?: boolean }> = ({ items, compact = false }) => (
 <div className="flex flex-wrap gap-2">
  {items.map((item, index) => (
   <span
    key={item}
    className={`${compact ? "h-6 px-2" : "h-7 px-3"} border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-[0.1em] inline-flex items-center`}
    style={{ background: tagTone[index % tagTone.length] }}>
    {item}
   </span>
  ))}
 </div>
)

const HoverInfoButton: React.FC<{ label: string; tooltip: string; tone?: string }> = ({
 label,
 tooltip,
 tone = "#CCFF00",
}) => {
 const [open, setOpen] = useState(false)
 return (
  <div
   className="relative inline-flex"
   onMouseEnter={() => setOpen(true)}
   onMouseLeave={() => setOpen(false)}>
   <button className="h-10 px-4 border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-[0.11em]" style={{ background: tone }}>
    {label}
   </button>
   {open ? (
    <div className="absolute top-full left-0 mt-2 w-60 border-[3px] border-black rounded-xl bg-white p-2 text-[10px] font-black uppercase tracking-[0.09em] z-20">
     {tooltip}
    </div>
   ) : null}
  </div>
 )
}

const ModalLauncher: React.FC<{ label: string; title?: string; message?: string }> = ({
 label,
 title = "Modal Dialog",
 message = "Source interaction preserved for exact extraction contract.",
}) => {
 const [open, setOpen] = useState(false)
 return (
  <>
   <button
    type="button"
    onClick={() => setOpen(true)}
    className="h-10 px-4 border-[3px] border-black rounded-lg bg-[#FF7497] text-[10px] font-black uppercase tracking-[0.11em]">
    {label}
   </button>
   {open ? (
    <div className="fixed inset-0 z-[1200] bg-black/45 flex items-center justify-center p-4">
     <div className="w-full max-w-sm border-[4px] border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_black]">
      <div className="h-12 border-b-[4px] border-black bg-[#FFE357] px-3 flex items-center justify-between">
       <span className="text-[10px] font-black uppercase tracking-[0.14em]">{title}</span>
       <button onClick={() => setOpen(false)} className="h-7 w-7 border-[3px] border-black rounded-full bg-white inline-flex items-center justify-center">
        <X size={12} strokeWidth={3} />
       </button>
      </div>
      <div className="p-3 text-xs font-bold uppercase tracking-[0.08em]">{message}</div>
     </div>
    </div>
   ) : null}
  </>
 )
}

const StrikeTaskList: React.FC<{ items?: string[] }> = ({
 items = ["Auto optimize SEO", "Smart scheduling"],
}) => {
 const [done, setDone] = useState<Record<string, boolean>>({})
 return (
  <div className="space-y-2">
   {items.map((item) => (
    <label key={item} className="h-9 px-3 border-[3px] border-black rounded-lg bg-white flex items-center gap-2">
     <input
      type="checkbox"
      checked={done[item] === true}
      onChange={() => setDone((prev) => ({ ...prev, [item]: !prev[item] }))}
     />
     <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${done[item] ? "line-through opacity-60" : ""}`}>
      {item}
     </span>
    </label>
   ))}
  </div>
 )
}

const FocusFields: React.FC<{
 includeChannelUrl?: boolean
 includeAddButton?: boolean
}> = ({ includeChannelUrl = false, includeAddButton = false }) => {
 const [title, setTitle] = useState("")
 const [channelId, setChannelId] = useState("")
 const [channelUrl, setChannelUrl] = useState("")
 const [category, setCategory] = useState("Education")
 const [description, setDescription] = useState("Describe your video...")
 const [customInput, setCustomInput] = useState("")
 const [added, setAdded] = useState<string[]>([])

 return (
  <div className="space-y-2">
   <div className="grid grid-cols-2 gap-2">
    <input
     value={title}
     onChange={(event) => setTitle(event.target.value)}
     placeholder="Enter title..."
     className="h-11 px-3 border-[3px] border-black rounded-lg bg-white text-xs font-black focus:border-[#24D3FF] focus:outline-none"
    />
    <input
     value={channelId}
     onChange={(event) => setChannelId(event.target.value)}
     placeholder="UC..."
     className="h-11 px-3 border-[3px] border-black rounded-lg bg-white text-xs font-black focus:border-[#24D3FF] focus:outline-none"
    />
   </div>
   {includeChannelUrl ? (
    <input
     value={channelUrl}
     onChange={(event) => setChannelUrl(event.target.value)}
     placeholder="https://youtube.com/channel/..."
     className="h-11 px-3 border-[3px] border-black rounded-lg bg-white text-xs font-black focus:border-[#24D3FF] focus:outline-none"
    />
   ) : null}
   <div className="relative">
    <select
     value={category}
     onChange={(event) => setCategory(event.target.value)}
     className="appearance-none h-11 w-full px-3 border-[3px] border-black rounded-lg bg-white text-xs font-black uppercase focus:border-[#24D3FF] focus:outline-none">
     <option>Education</option>
     <option>History</option>
     <option>Strategy</option>
    </select>
    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2" />
   </div>
   <textarea
    value={description}
    onChange={(event) => setDescription(event.target.value)}
    className="w-full min-h-[92px] resize-y px-3 py-2 border-[3px] border-black rounded-lg bg-white text-xs font-black focus:border-[#24D3FF] focus:outline-none"
   />
   {includeAddButton ? (
    <div className="space-y-2">
     <div className="flex items-center gap-2">
      <input
       value={customInput}
       onChange={(event) => setCustomInput(event.target.value)}
       placeholder="Type value to add"
       className="h-10 flex-1 px-3 border-[3px] border-black rounded-lg bg-white text-xs font-black focus:border-[#24D3FF] focus:outline-none"
      />
      <button
       type="button"
       onClick={() => {
        const value = customInput.trim()
        if (!value) return
        setAdded((prev) => [...prev, value])
        setCustomInput("")
       }}
       className="h-10 px-4 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black uppercase tracking-[0.11em] inline-flex items-center gap-1">
       <Plus size={12} /> Add
      </button>
     </div>
     {added.length > 0 ? (
      <TagPills items={added.slice(-6)} compact />
     ) : null}
    </div>
   ) : null}
  </div>
 )
}

const SliderCluster: React.FC<{ includeValues?: boolean }> = ({ includeValues = true }) => {
 const [a, setA] = useState(72)
 const [b, setB] = useState(58)
 const [c, setC] = useState(41)
 return (
  <div className="space-y-2">
   {[
    ["Brightness", a, setA, "#24D3FF"],
    ["Saturation", b, setB, "#FF33AA"],
    ["Contrast", c, setC, "#CCFF00"],
   ].map(([label, value, setter, tone]) => (
    <div key={String(label)}>
     <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.11em]">
      <span>{String(label)}</span>
      {includeValues ? <span style={{ color: String(tone) }}>{Number(value)}</span> : null}
     </div>
     <input
      type="range"
      min={0}
      max={100}
      value={Number(value)}
      onChange={(event) =>
       (setter as React.Dispatch<React.SetStateAction<number>>)(Number(event.target.value))
      }
      className="w-full"
     />
    </div>
   ))}
  </div>
 )
}

const ToggleCheckRadioBlock: React.FC = () => {
 const [toggles, setToggles] = useState([true, false, true, false])
 const [checks, setChecks] = useState([true, false, true, false])
 const [radio, setRadio] = useState("growth")

 return (
  <div className="grid grid-cols-3 gap-2">
   <div className={LIGHT_CARD}>
    <div className={CAPTION}>Toggles</div>
    <div className="space-y-2">
     {["Publish", "Auto Thumbnails", "Dark Analytics", "Alerts"].map((label, index) => (
      <button
       key={label}
       type="button"
       onClick={() =>
        setToggles((prev) => prev.map((value, i) => (i === index ? !value : value)))
       }
       className="w-full h-8 border-[2px] border-black rounded-lg bg-white text-[10px] font-black uppercase flex items-center justify-between px-2">
       <span>{label}</span>
       <span>{toggles[index] ? "ON" : "OFF"}</span>
      </button>
     ))}
    </div>
   </div>

   <div className={LIGHT_CARD}>
    <div className={CAPTION}>Checkboxes</div>
    <div className="space-y-2">
     {["Auto SEO", "Enable Hooks", "Smart Schedule", "Beta"].map((label, index) => (
      <label key={label} className="h-8 border-[2px] border-black rounded-lg bg-white text-[10px] font-black uppercase px-2 inline-flex items-center gap-2 w-full">
       <input
        type="checkbox"
        checked={checks[index]}
        onChange={() =>
         setChecks((prev) => prev.map((value, i) => (i === index ? !value : value)))
        }
       />
       <span className={checks[index] ? "line-through opacity-65" : ""}>{label}</span>
      </label>
     ))}
    </div>
   </div>

   <div className={LIGHT_CARD}>
    <div className={CAPTION}>Radio</div>
    <div className="space-y-2">
     {["growth", "monetize", "engagement", "analysis"].map((value) => (
      <label key={value} className="h-8 border-[2px] border-black rounded-lg bg-white text-[10px] font-black uppercase px-2 inline-flex items-center gap-2 w-full">
       <input
        type="radio"
        checked={radio === value}
        onChange={() => setRadio(value)}
       />
       <span>{value}</span>
      </label>
     ))}
    </div>
   </div>
  </div>
 )
}

const SidebarNav: React.FC = () => (
 <div className="space-y-2">
  {["Dashboard", "Studio", "Projects", "Analytics", "Calendar", "Shorts"].map(
   (label, index) => (
    <button
     key={label}
     className="w-full h-10 px-3 border-[3px] border-black rounded-xl text-left text-[10px] font-black uppercase tracking-[0.11em]"
     style={{
      background: ["#FF7497", "#FFB158", "#CCFF00", "#24D3FF", "#FFE357", "#5BFF3E"][index],
     }}>
     {label}
    </button>
   ),
  )}
 </div>
)

const CollapsibleTree: React.FC = () => {
 const [openA, setOpenA] = useState(true)
 const [openB, setOpenB] = useState(false)
 return (
  <div className="space-y-2">
   <button
    onClick={() => setOpenA((value) => !value)}
    className="w-full h-9 px-3 border-[3px] border-black rounded-lg bg-white text-left text-[10px] font-black uppercase">
    Root A {openA ? "−" : "+"}
   </button>
   {openA ? (
    <div className="pl-4 space-y-1">
     <div className="h-8 px-3 border-[2px] border-black rounded-lg bg-[#f9f9f9] text-[10px] font-black uppercase flex items-center">
      Leaf A1
     </div>
     <div className="h-8 px-3 border-[2px] border-black rounded-lg bg-[#f9f9f9] text-[10px] font-black uppercase flex items-center">
      Leaf A2
     </div>
    </div>
   ) : null}
   <button
    onClick={() => setOpenB((value) => !value)}
    className="w-full h-9 px-3 border-[3px] border-black rounded-lg bg-white text-left text-[10px] font-black uppercase">
    Root B {openB ? "−" : "+"}
   </button>
   {openB ? (
    <div className="pl-4">
     <div className="h-8 px-3 border-[2px] border-black rounded-lg bg-[#f9f9f9] text-[10px] font-black uppercase flex items-center">
      Leaf B1
     </div>
    </div>
   ) : null}
  </div>
 )
}

const VideoCardsLite: React.FC = () => (
 <div className="space-y-2">
  {[
   "Sample Bird's Eye View",
   "The Road to the Campaign",
  ].map((title, index) => (
   <div key={title} className="border-[3px] border-black rounded-xl overflow-hidden bg-white">
    <div className="h-8 px-3 border-b-[3px] border-black bg-[#24D3FF] text-[10px] font-black uppercase tracking-[0.12em] flex items-center">
     Video Card {index + 1}
    </div>
    <div className="p-2 text-[10px] font-black uppercase tracking-[0.08em]">{title}</div>
   </div>
  ))}
  <div className="flex flex-wrap gap-2">
   {[
    ["Live", "#FF3399"],
    ["Scheduled", "#FFE357"],
    ["Draft", "#e5e7eb"],
   ].map(([label, bg]) => (
    <span
     key={String(label)}
     className="h-7 px-3 border-[3px] border-black rounded-lg text-[10px] font-black uppercase inline-flex items-center"
     style={{ background: String(bg) }}>
     {String(label)}
    </span>
   ))}
  </div>
 </div>
)

const LoadingStates: React.FC = () => {
 const [toasts, setToasts] = useState<string[]>([])
 const addToast = (label: string) => setToasts((prev) => [...prev, label])
 return (
  <div className="space-y-2">
   <div className="h-7 rounded-full border-[2px] border-black overflow-hidden bg-white">
    <div className="h-full w-2/3 bg-[#FF33AA] animate-pulse" />
   </div>
   <div className="grid grid-cols-3 gap-2">
    {["#24D3FF", "#CCFF00", "#FFE357"].map((color) => (
     <div key={color} className="h-10 border-[3px] border-black rounded-full bg-white flex items-center justify-center">
      <div
       className="h-5 w-5 border-[3px] border-black rounded-full animate-spin"
       style={{
        borderTopColor: color,
        borderRightColor: color,
        borderBottomColor: "transparent",
        borderLeftColor: "transparent",
       }}
      />
     </div>
    ))}
   </div>
   <div className="flex gap-2">
    <button
     type="button"
     onClick={() => addToast("Notification generated")}
     className="h-9 px-3 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black uppercase tracking-[0.1em]">
     Notify
    </button>
    <ModalLauncher label="Open Modal" title="Dialog Action" message="Modal and notification interaction preserved." />
   </div>
   <div className="space-y-1">
    {toasts.map((toast, index) => (
     <div key={`${toast}-${index}`} className="h-8 px-2 border-[2px] border-black rounded-lg bg-[#f3f4f6] text-[10px] font-black uppercase flex items-center justify-between">
      <span>{toast}</span>
      <button type="button" onClick={() => setToasts((prev) => prev.filter((_, i) => i !== index))}>
       <X size={12} />
      </button>
     </div>
    ))}
   </div>
  </div>
 )
}

const ButtonSystem: React.FC = () => (
 <div className="space-y-2">
  <div className="flex flex-wrap gap-2">
   {[
    ["PINK", "#FF33AA", "#fff"],
    ["LIME", "#CCFF00", "#000"],
    ["CYAN", "#24D3FF", "#000"],
    ["YELLOW", "#FFE357", "#000"],
    ["ORANGE", "#FFB158", "#000"],
    ["BLACK", "#111111", "#CCFF00"],
   ].map(([label, bg, color]) => (
    <button
     key={String(label)}
     className="h-9 px-3 border-[3px] border-black rounded-xl text-[10px] font-black uppercase tracking-[0.1em]"
     style={{ background: String(bg), color: String(color) }}>
     {String(label)}
    </button>
   ))}
  </div>
  <button className="w-full h-11 border-[4px] border-black rounded-xl bg-white text-[11px] font-black uppercase tracking-[0.11em] inline-flex items-center justify-center gap-2">
   <Zap size={14} />
   Large Action
  </button>
  <div className="flex flex-wrap gap-2">
   <button className="h-9 w-9 border-[3px] border-black rounded-lg bg-[#24D3FF] text-[10px] font-black">C</button>
   <button className="h-9 w-9 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black">L</button>
   <button className="h-9 px-3 border-[3px] border-black rounded-lg bg-[#FF33AA] text-white text-[10px] font-black uppercase">Tiny</button>
   <button className="h-9 px-3 border-[3px] border-black rounded-lg bg-[#d1d5db] text-[10px] font-black uppercase text-black/40">Disabled</button>
  </div>
 </div>
)

const PaletteGrid: React.FC = () => {
 const [colors, setColors] = useState(["#FF33AA", "#CCFF00", "#24D3FF", "#FFE357", "#FFB158"])
 return (
  <div className="grid grid-cols-5 gap-2">
   {colors.map((color, index) => (
    <label key={`${color}-${index}`} className="h-14 border-[3px] border-black rounded-xl overflow-hidden cursor-pointer" style={{ background: color }}>
     <input
      type="color"
      value={color}
      onChange={(event) =>
       setColors((prev) => prev.map((item, i) => (i === index ? event.target.value : item)))
      }
      className="opacity-0 w-full h-full cursor-pointer"
     />
    </label>
   ))}
  </div>
 )
}

const MetricsMeters: React.FC = () => (
 <div className="grid grid-cols-3 gap-2">
  {[
   ["Download", 66, "#FF33AA"],
   ["Upload", 42, "#CCFF00"],
   ["Storage", 83, "#24D3FF"],
  ].map(([label, value, tone]) => (
   <div key={String(label)} className="border-[3px] border-black rounded-xl p-2 bg-white">
    <div className="text-[9px] font-black uppercase tracking-[0.1em]">{String(label)}</div>
    <div className="h-2 rounded-full border border-black mt-1 overflow-hidden bg-[#f3f4f6]">
     <div className="h-full" style={{ width: `${Number(value)}%`, background: String(tone) }} />
    </div>
   </div>
  ))}
 </div>
)

const StatusSignalCards: React.FC<{ labels: string[]; tone?: string }> = ({
 labels,
 tone = "#CCFF00",
}) => (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
  {labels.map((label) => (
   <div key={label} className="h-10 border-[3px] border-black rounded-xl bg-white flex items-center justify-between px-3">
    <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
    <span className="h-3 w-3 rounded-full border-[2px] border-black" style={{ backgroundColor: tone }} />
   </div>
  ))}
 </div>
)

const HistogramBars: React.FC<{ values?: number[]; color?: string }> = ({
 values = [12, 24, 42, 33, 18, 9],
 color = "#24D3FF",
}) => (
 <div className="border-[3px] border-black rounded-xl bg-white p-2">
  <div className="h-28 flex items-end gap-1">
   {values.map((value, index) => (
    <div key={`${value}-${index}`} className="flex-1 border-[2px] border-black rounded-t-md" style={{ height: `${Math.max(12, value * 2)}px`, backgroundColor: color }} />
   ))}
  </div>
 </div>
)

const DistributionBars: React.FC = () => (
 <div className="space-y-2">
  {[
   ["Longform", 62, "#24D3FF"],
   ["Shorts", 31, "#CCFF00"],
   ["Unknown", 7, "#FF7497"],
  ].map(([label, value, tone]) => (
   <div key={String(label)} className="space-y-1">
    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.1em]">
     <span>{String(label)}</span>
     <span>{String(value)}%</span>
    </div>
    <div className="h-3 border-[2px] border-black rounded-full bg-white overflow-hidden">
     <div className="h-full" style={{ width: `${Number(value)}%`, backgroundColor: String(tone) }} />
    </div>
   </div>
  ))}
 </div>
)

const StrategyChatPanel: React.FC = () => {
 const [messages, setMessages] = useState<string[]>([
  "Hook angle A tests best against creator-education topics.",
 ])
 const [draft, setDraft] = useState("")
 return (
  <div className="space-y-2">
   <div className="h-28 overflow-auto border-[3px] border-black rounded-xl bg-white p-2 space-y-1">
    {messages.map((message, index) => (
     <div key={`${message}-${index}`} className="text-[10px] font-black uppercase tracking-[0.08em] border-[2px] border-black rounded-lg p-1 bg-[#f9fafb]">
      {message}
     </div>
    ))}
   </div>
   <div className="flex gap-2">
    <input
     value={draft}
     onChange={(event) => setDraft(event.target.value)}
     placeholder="Type strategy prompt..."
     className="h-10 flex-1 border-[3px] border-black rounded-lg px-2 text-[10px] font-black uppercase"
    />
    <button
     type="button"
     onClick={() => {
      const next = draft.trim()
      if (!next) return
      setMessages((prev) => [next, ...prev].slice(0, 6))
      setDraft("")
     }}
     className="h-10 px-3 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black uppercase">
     Add
    </button>
   </div>
  </div>
 )
}

const DailyStatsBox: React.FC = () => (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
  {[
   ["Views", "407.7K"],
   ["Watch Hrs", "286"],
   ["Subs +", "54"],
   ["Revenue", "$9.44"],
  ].map(([label, value]) => (
   <div key={String(label)} className="border-[3px] border-black rounded-xl p-2 bg-white">
    <div className="text-[9px] font-black uppercase tracking-[0.1em] opacity-60">{String(label)}</div>
    <div className="text-xl font-[1000] leading-none mt-1">{String(value)}</div>
   </div>
  ))}
 </div>
)

const KpiSixPack: React.FC = () => (
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
  {[
   ["Views", "10.1K"],
   ["Watch", "24.7"],
   ["Subs", "2"],
   ["Revenue", "$0.23"],
   ["CTR", "0.14"],
   ["AVP", "52"],
  ].map(([label, value]) => (
   <div key={String(label)} className="h-16 border-[3px] border-black rounded-xl p-2 bg-white">
    <div className="text-[9px] font-black uppercase tracking-[0.1em] opacity-60">{String(label)}</div>
    <div className="text-xl font-[1000] leading-none mt-1">{String(value)}</div>
   </div>
  ))}
 </div>
)

const VaultModule: React.FC = () => (
 <div className="border-[3px] border-black rounded-xl bg-white overflow-hidden">
  <div className="h-9 px-3 border-b-[3px] border-black bg-[#111] text-[#CCFF00] flex items-center text-[10px] font-black uppercase tracking-[0.12em]">
   Vault Module
  </div>
  <div className="p-3 text-[10px] font-black uppercase tracking-[0.1em]">Toolbox baseline vault preserved.</div>
 </div>
)

const CheckerAvatarsSwatches: React.FC = () => (
 <div className="space-y-2">
  <div className="grid grid-cols-4 gap-2">
   {["A", "B", "C", "D"].map((value, index) => (
    <div
     key={value}
     className="h-12 w-12 border-[3px] border-black rounded-full flex items-center justify-center font-black"
     style={{ background: ["#CCFF00", "#24D3FF", "#FFB158", "#FF33AA"][index] }}>
     {value}
    </div>
   ))}
  </div>
  <PaletteGrid />
 </div>
)

const AccordionDividerMarquee: React.FC = () => {
 const [openA, setOpenA] = useState(true)
 const [openB, setOpenB] = useState(false)
 return (
  <div className="space-y-2">
   <button onClick={() => setOpenA((value) => !value)} className="w-full h-9 px-3 border-[3px] border-black rounded-lg bg-white text-left text-[10px] font-black uppercase">
    What is this {openA ? "−" : "+"}
   </button>
   {openA ? <div className="text-[10px] font-black uppercase opacity-60">Context block for component behavior.</div> : null}
   <button onClick={() => setOpenB((value) => !value)} className="w-full h-9 px-3 border-[3px] border-black rounded-lg bg-white text-left text-[10px] font-black uppercase">
    How does it work {openB ? "−" : "+"}
   </button>
   {[1, 2, 3].map((divider) => (
    <div key={divider} className="h-1 bg-black/20" />
   ))}
   <div className="h-8 border-[2px] border-black rounded-lg bg-[#f3f4f6] text-[10px] font-black uppercase flex items-center px-2 overflow-hidden whitespace-nowrap">
    <span className="animate-[pulse_2s_ease-in-out_infinite]">Marquee • Marquee • Marquee • Marquee</span>
   </div>
  </div>
 )
}

const StepperTimeline: React.FC = () => (
 <div className="space-y-2">
  <div className={CARD}>
   <div className={CAPTION}>Horizontal Stepper</div>
   <div className="grid grid-cols-4 gap-2">
    {[1, 2, 3, 4].map((step) => (
     <div key={step} className="h-8 border-[2px] border-black rounded-lg bg-white text-[10px] font-black inline-flex items-center justify-center">
      {step}
     </div>
    ))}
   </div>
  </div>
  <div className={CARD}>
   <div className={CAPTION}>Timeline</div>
   <div className="grid grid-cols-5 gap-2">
    {["A", "B", "C", "D", "E"].map((step) => (
     <div key={step} className="h-7 border-[2px] border-black rounded-lg bg-white text-[10px] font-black inline-flex items-center justify-center">
      {step}
     </div>
    ))}
   </div>
  </div>
 </div>
)

const PaginationStrip: React.FC = () => (
 <div className="flex flex-wrap gap-2">
  {["◀", "1", "2", "3", "4", "5", "…", "12"].map((label, index) => (
   <button
    key={`${label}-${index}`}
    className={`h-9 min-w-[36px] px-2 border-[3px] border-black rounded-xl text-[10px] font-black ${label === "3" ? "bg-[#FF33AA] text-white" : "bg-white"}`}>
    {label}
   </button>
  ))}
 </div>
)

const RingsAndLoaders: React.FC = () => (
 <div className="space-y-2">
  <div className="grid grid-cols-3 gap-2">
   {["#FF33AA", "#24D3FF", "#CCFF00"].map((tone) => (
    <div key={tone} className="h-16 border-[3px] border-black rounded-xl bg-white flex items-center justify-center">
     <div
      className="h-9 w-9 rounded-full border-[4px] border-transparent"
      style={{ borderTopColor: tone, borderLeftColor: tone }}
     />
    </div>
   ))}
  </div>
  <div className="grid grid-cols-3 gap-2">
   {[72, 56, 33].map((value, index) => (
    <div key={value} className="h-14 border-[3px] border-black rounded-xl bg-white p-2">
     <div className="h-full rounded-full border-[2px] border-black overflow-hidden">
      <div
       className="h-full"
       style={{
        width: `${value}%`,
        backgroundColor: ["#FF33AA", "#24D3FF", "#CCFF00"][index],
       }}
      />
     </div>
    </div>
   ))}
  </div>
 </div>
)

const ComplexControlsRig: React.FC = () => (
 <div className="space-y-2">
  <SourceHeader title="Complex Controls" subtitle="functions/actions/hoverovers" tone="#24D3FF" />
  <div className="grid grid-cols-2 gap-2">
   <button className="h-10 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black uppercase">Toggle Matrix</button>
   <button className="h-10 border-[3px] border-black rounded-lg bg-[#FFB158] text-[10px] font-black uppercase">Route Action</button>
  </div>
  <HoverInfoButton label="Hover Me" tooltip="Hook retention hover behavior preserved." tone="#FFE357" />
 </div>
)

const TactileHardwareRig: React.FC = () => (
 <div className="space-y-2">
  <SourceHeader title="Tactile Hardware" subtitle="full toolbox transfer" tone="#FFE357" />
  <div className="grid grid-cols-3 gap-2">
   {["Dial", "Switch", "Pulse"].map((item) => (
    <div key={item} className="h-16 border-[3px] border-black rounded-xl bg-white flex items-center justify-center text-[10px] font-black uppercase">
     {item}
    </div>
   ))}
  </div>
 </div>
)

const ConsoleDashboardRig: React.FC = () => (
 <div className="space-y-2">
  <div className={CARD}>
   <div className={CAPTION}>4 Unit Matrix</div>
   <div className="grid grid-cols-2 gap-2 bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:18px_18px] p-2 rounded-lg">
    {["A", "B", "C", "D"].map((value) => (
     <div key={value} className="h-14 border-[3px] border-black rounded-xl bg-[#f3f4f6] flex items-center justify-center text-[10px] font-black uppercase">
      {value}
     </div>
    ))}
   </div>
  </div>
  <div className={CARD}>
   <div className={CAPTION}>2 Unit Media Strip</div>
   <div className="grid grid-cols-2 gap-2">
    {[1, 2].map((item) => (
     <div key={item} className="h-12 border-[3px] border-black rounded-xl bg-[#FFB158]" />
    ))}
   </div>
  </div>
 </div>
)

const UstubeAnalyticsRig: React.FC = () => (
 <div className="space-y-2">
  <SourceHeader title="Analytics Toolbox" subtitle="algorithm architect + keyword research + strategy chat" tone="#FFB158" />
  <div className="grid grid-cols-2 gap-2">
   {["Analytics Toolbox", "Algorithm Architect", "Keyword Research", "Strategy Chat"].map((item) => (
    <div key={item} className="h-14 border-[3px] border-black rounded-xl bg-white flex items-center px-2 text-[10px] font-black uppercase">
     {item}
    </div>
   ))}
  </div>
 </div>
)

const HookRetentionRig: React.FC = () => {
 const [value, setValue] = useState(64)
 return (
  <div className="space-y-2">
   <div className="h-10 border-[3px] border-black rounded-xl bg-white px-3 flex items-center justify-between">
    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Hook Retention</span>
    <span className="text-[10px] font-black">{value}%</span>
   </div>
   <input
    type="range"
    min={0}
    max={100}
    value={value}
    onChange={(event) => setValue(Number(event.target.value))}
    className="w-full"
   />
   <div className="h-3 border-[2px] border-black rounded-full bg-white overflow-hidden">
    <div className="h-full bg-[#FF7497]" style={{ width: `${value}%` }} />
   </div>
  </div>
 )
}

const VideoManagerLite: React.FC = () => (
 <div className="space-y-2">
  <div className="h-10 border-[3px] border-black rounded-xl bg-[#24D3FF] flex items-center px-3 text-[10px] font-black uppercase tracking-[0.1em]">
   Video Manager
  </div>
  <div className="space-y-1">
   {["Sample Bird's-Eye View", "The Road to the Campaign", "History Channel"].map((title) => (
    <div key={title} className="h-9 border-[2px] border-black rounded-lg bg-white px-2 flex items-center justify-between">
     <span className="text-[9px] font-black uppercase tracking-[0.08em] truncate">{title}</span>
     <Edit size={12} />
    </div>
   ))}
  </div>
 </div>
)

const ContentCalendarRig: React.FC = () => (
 <div className={CARD}>
  <div className={CAPTION}>Content Calendar</div>
  <div className="grid grid-cols-7 gap-1">
   {Array.from({ length: 28 }).map((_, index) => (
    <div key={index} className="h-8 border-[2px] border-black rounded-md bg-white" />
   ))}
  </div>
 </div>
)

const ChannelGoalProgress: React.FC = () => (
 <div className="grid grid-cols-2 gap-2">
  {[62, 48].map((value, index) => (
   <div key={value} className="border-[3px] border-black rounded-xl p-2 bg-white">
    <div className="text-[9px] font-black uppercase tracking-[0.11em] mb-1">Goal {index + 1}</div>
    <div className="h-3 rounded-full border-[2px] border-black overflow-hidden bg-[#f3f4f6]">
     <div className="h-full" style={{ width: `${value}%`, background: ["#24D3FF", "#CCFF00"][index] }} />
    </div>
   </div>
  ))}
 </div>
)

const DialogNotificationRig: React.FC = () => (
 <div className="space-y-2">
  <div className="flex flex-wrap gap-2">
   <ModalLauncher label="Open Modal" title="Dialog + Notifications" message="Open modal button preserved." />
   <HoverInfoButton label="Hover Tip" tooltip="Hover-for-tip button popup preserved." tone="#24D3FF" />
  </div>
  <LoadingStates />
 </div>
)

const PublisherUpload: React.FC = () => (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
  <div className={CARD}>
   <div className={CAPTION}>Video Upload</div>
   <div className="h-36 border-[3px] border-black rounded-xl bg-[#f3f4f6] flex items-center justify-center flex-col gap-2">
    <Upload size={24} />
    <div className="text-[10px] font-black uppercase">Upload Video</div>
   </div>
  </div>
  <div className={CARD}>
   <div className={CAPTION}>Video Script</div>
   <textarea className="w-full h-36 border-[3px] border-black rounded-xl p-2 text-xs font-bold resize-none" placeholder="Paste your script..." />
  </div>
 </div>
)

const SourceMappedGrid: React.FC<{ modules: SourceComponentModule[] }> = ({ modules }) => (
 <div className="space-y-2">
  {modules.map((module) => (
   <div key={module.id} className="border-[3px] border-black rounded-xl bg-white p-2">
    <div className="text-[9px] font-black uppercase tracking-[0.12em] opacity-60 mb-2">{module.title}</div>
    {module.render}
   </div>
  ))}
 </div>
)

const makeModule = (
 config: Omit<SourceComponentModule, "destination"> & { destination?: string },
): SourceComponentModule => ({
 ...config,
 destination: config.destination || `${config.source} · ${config.category}`,
})

const buildCollection = (contracts: SourceComponentModule[]): SourceModuleCollection => {
 const byCategory = (category: SourceCategory) =>
  contracts.filter((module) => module.category === category)

 return {
  controls: <SourceMappedGrid modules={byCategory("Controls")} />,
  inputs: <SourceMappedGrid modules={byCategory("Inputs")} />,
  navigation: <SourceMappedGrid modules={byCategory("Navigation")} />,
  feedback: <SourceMappedGrid modules={byCategory("Feedback/Status")} />,
  cardsMedia: <SourceMappedGrid modules={byCategory("Cards/Media")} />,
  dialogs: <SourceMappedGrid modules={byCategory("Dialogs/Popups")} />,
  trees: <SourceMappedGrid modules={byCategory("Trees/Structure")} />,
  contracts,
 }
}

const sectionCEContracts = (): SourceComponentModule[] => [
 makeModule({
  id: "ce_analytics_protocol",
  source: "sectionCE",
  category: "Controls",
  title: "Section C · Analytics Protocol",
  interactions: ["click"],
  render: renderCard("sectionCE", "Analytics Protocol", <TagPills items={["analytics protocol", "signal filters", "quality gate"]} compact />),
 }),
 makeModule({
  id: "ce_viral_passing",
  source: "sectionCE",
  category: "Controls",
  title: "Section C · Viral Passing",
  interactions: ["click"],
  render: renderCard("sectionCE", "Viral Passing", <TagPills items={["momentum", "distribution", "velocity"]} compact />),
 }),
 makeModule({
  id: "ce_audience_matrix",
  source: "sectionCE",
  category: "Feedback/Status",
  title: "Section C · Audience Matrix",
  interactions: ["display"],
  render: renderCard("sectionCE", "Audience Matrix", <KpiSixPack />),
 }),
 makeModule({
  id: "ce_retention_pulse",
  source: "sectionCE",
  category: "Feedback/Status",
  title: "Section C · Retention Pulse",
  interactions: ["display"],
  render: renderCard("sectionCE", "Retention Pulse", <MetricsMeters />),
 }),
 makeModule({
  id: "ce_thumbnail_studio",
  source: "sectionCE",
  category: "Inputs",
  title: "Section C · Thumbnail Studio",
  interactions: ["display"],
  render: renderCard(
   "sectionCE",
   "Thumbnail Studio",
   <div className="space-y-2">
    <FocusFields />
    <PaletteGrid />
   </div>,
  ),
 }),
 makeModule({
  id: "ce_storyboard_planner",
  source: "sectionCE",
  category: "Navigation",
  title: "Section C · Storyboard Planner",
  interactions: ["display"],
  render: renderCard("sectionCE", "Storyboard Planner", <TagPills items={["frame 1", "frame 2", "frame 3", "cta"]} compact />),
 }),
 makeModule({
  id: "ce_asset_vault",
  source: "sectionCE",
  category: "Cards/Media",
  title: "Section C · Asset Vault",
  interactions: ["display"],
  render: renderCard("sectionCE", "Asset Vault", <VaultModule />),
 }),
 makeModule({
  id: "ce_media_analyzer",
  source: "sectionCE",
  category: "Cards/Media",
  title: "Section C · Media Analyzer",
  interactions: ["display"],
  render: renderCard(
   "sectionCE",
   "Media Analyzer",
   <div className="space-y-2">
    <HistogramBars values={[10, 18, 22, 30, 21, 16]} color="#24D3FF" />
    <StatusSignalCards labels={["Auto optimize", "Hook score", "Retention pulse"]} tone="#24D3FF" />
   </div>,
  ),
 }),
 makeModule({
  id: "ce_user_feedback",
  source: "sectionCE",
  category: "Feedback/Status",
  title: "Section C · User Feedback",
  interactions: ["display"],
  render: renderCard("sectionCE", "User Feedback", <LoadingStates />),
 }),
 makeModule({
  id: "ce_hook_architect",
  source: "sectionCE",
  category: "Controls",
  title: "Section C · Hook Architect",
  interactions: ["click", "hover"],
  render: renderCard("sectionCE", "Hook Architect", <HoverInfoButton label="Hook Prompt" tooltip="Hover popup from Section C Hook Architect." tone="#FFE357" />),
 }),
 makeModule({
  id: "ce_box02_graphic",
  source: "sectionCE",
  category: "Controls",
  title: "Section E Box 02 · Graphic",
  interactions: ["click"],
  render: renderCard("sectionCE", "Graphic / Minimalist / Cinematic", <ButtonSystem />),
 }),
 makeModule({
  id: "ce_box02_minimalist",
  source: "sectionCE",
  category: "Controls",
  title: "Section E Box 02 · Minimalist",
  interactions: ["click"],
  render: renderCard("sectionCE", "Minimalist", <TagPills items={["minimalist"]} compact />),
 }),
 makeModule({
  id: "ce_box02_cinematic",
  source: "sectionCE",
  category: "Controls",
  title: "Section E Box 02 · Cinematic",
  interactions: ["click"],
  render: renderCard("sectionCE", "Cinematic", <TagPills items={["cinematic"]} compact />),
 }),
 makeModule({
  id: "ce_box04_toggles",
  source: "sectionCE",
  category: "Controls",
  title: "Section E Box 04 · Toggles",
  interactions: ["toggle"],
  render: renderCard("sectionCE", "Box 04 Toggles", <ToggleCheckRadioBlock />),
 }),
 makeModule({
  id: "ce_box04_checkboxes",
  source: "sectionCE",
  category: "Controls",
  title: "Section E Box 04 · Checkboxes",
  interactions: ["check", "strike-through"],
  render: renderCard("sectionCE", "Box 04 Checkboxes", <StrikeTaskList items={["Auto optimize SEO", "Enable AI hooks", "Smart scheduling", "Beta features"]} />),
 }),
 makeModule({
  id: "ce_box04_radios",
  source: "sectionCE",
  category: "Controls",
  title: "Section E Box 04 · Radios",
  interactions: ["radio"],
  render: renderCard("sectionCE", "Box 04 Radios", <ToggleCheckRadioBlock />),
 }),
 makeModule({
  id: "ce_box05_channel_url",
  source: "sectionCE",
  category: "Inputs",
  title: "Section E Box 05 · Channel URL",
  interactions: ["focus"],
  render: renderCard("sectionCE", "Channel URL", <FocusFields includeChannelUrl />),
 }),
 makeModule({
  id: "ce_box05_category",
  source: "sectionCE",
  category: "Inputs",
  title: "Section E Box 05 · Category Dropdown",
  interactions: ["select"],
  render: renderCard("sectionCE", "Category", <FocusFields />),
 }),
 makeModule({
  id: "ce_box05_daily_stats",
  source: "sectionCE",
  category: "Inputs",
  title: "Section E Box 05 · Daily Stats",
  interactions: ["display"],
  render: renderCard("sectionCE", "Daily Stats", <DailyStatsBox />),
 }),
 makeModule({
  id: "ce_box09_kpi_cards",
  source: "sectionCE",
  category: "Feedback/Status",
  title: "Section E Box 09 · Six KPI Cards",
  interactions: ["display"],
  render: renderCard("sectionCE", "KPI Six Pack", <KpiSixPack />),
 }),
 makeModule({
  id: "ce_box13_sidebar_nav",
  source: "sectionCE",
  category: "Navigation",
  title: "Section E Box 13 · Sidebar Navigation",
  interactions: ["click", "route-select"],
  render: renderCard("sectionCE", "Sidebar Nav", <SidebarNav />),
 }),
 makeModule({
  id: "ce_box14_collapsible_tree",
  source: "sectionCE",
  category: "Trees/Structure",
  title: "Section E Box 14 · Collapsible Tree",
  interactions: ["expand", "collapse"],
  render: renderCard("sectionCE", "Collapsible Tree", <CollapsibleTree />),
 }),
 makeModule({
  id: "ce_box17_sync_tooltip",
  source: "sectionCE",
  category: "Dialogs/Popups",
  title: "Section E Box 17 · Sync Tooltip",
  interactions: ["hover"],
  render: renderCard("sectionCE", "Sync Tooltip", <HoverInfoButton label="Sync Tooltip" tooltip="Hover tooltip pop-up preserved." tone="#24D3FF" />),
 }),
 makeModule({
  id: "ce_box18_modal_dialog",
  source: "sectionCE",
  category: "Dialogs/Popups",
  title: "Section E Box 18 · Modal Dialog Button",
  interactions: ["open-modal", "close-modal"],
  render: renderCard("sectionCE", "Modal Dialog", <ModalLauncher label="Open Modal" title="Motor Dialog" />),
 }),
 makeModule({
  id: "ce_box22_video_cards",
  source: "sectionCE",
  category: "Cards/Media",
  title: "Section E Box 22 · First Two Video Cards",
  interactions: ["display"],
  render: renderCard("sectionCE", "Video Cards", <VideoCardsLite />),
 }),
 makeModule({
  id: "ce_box22_status_pills",
  source: "sectionCE",
  category: "Cards/Media",
  title: "Section E Box 22 · Live/Scheduled/Draft Pills",
  interactions: ["display"],
  render: renderCard("sectionCE", "Status Pills", <TagPills items={["Live", "Scheduled", "Draft"]} compact />),
 }),
 makeModule({
  id: "ce_vault_module",
  source: "sectionCE",
  category: "Trees/Structure",
  title: "Toolbox Baseline · Vault Module",
  interactions: ["display"],
  render: renderCard("sectionCE", "Vault", <VaultModule />),
 }),
]

const setOneContracts = (): SourceComponentModule[] => [
 makeModule({
  id: "set1_checker_avatars_swatches",
  source: "toolboxSet",
  category: "Cards/Media",
  title: "Display/Misc · Checker + Avatars + Swatches",
  interactions: ["color-select"],
  render: renderCard("toolboxSet", "Checker + Avatars + Swatches", <CheckerAvatarsSwatches />),
 }),
 makeModule({
  id: "set1_tags_chips_separators",
  source: "toolboxSet",
  category: "Cards/Media",
  title: "Display/Misc · Tags + Chips + Separators",
  interactions: ["display"],
  render: renderCard("toolboxSet", "Tags/Chips/Separators", <TagPills items={["tag", "chip", "separator", "alpha", "beta"]} />),
 }),
 makeModule({
  id: "set1_jdmkrs_overlap",
  source: "toolboxSet",
  category: "Cards/Media",
  title: "Cards/Variance · JDMKRS Overlap Circles",
  interactions: ["display"],
  render: renderCard(
   "toolboxSet",
   "JDMKRS",
   <div className="flex -space-x-2">{["#24D3FF", "#CCFF00", "#FF7497"].map((color, index) => (
    <span key={index} className="h-12 w-12 border-[3px] border-black rounded-full" style={{ background: color }} />
   ))}</div>,
  ),
 }),
 makeModule({
  id: "set1_accordions",
  source: "toolboxSet",
  category: "Dialogs/Popups",
  title: "Accordion/Menu · What is this + How does it work",
  interactions: ["expand", "collapse"],
  render: renderCard("toolboxSet", "Accordions", <AccordionDividerMarquee />),
 }),
 makeModule({
  id: "set1_dividers_marquee",
  source: "toolboxSet",
  category: "Dialogs/Popups",
  title: "Accordion/Menu · Dividers + Marquee",
  interactions: ["display", "animate"],
  render: renderCard("toolboxSet", "Dividers + Marquee", <AccordionDividerMarquee />),
 }),
 makeModule({
  id: "set1_horizontal_stepper",
  source: "toolboxSet",
  category: "Navigation",
  title: "Stepper/Timeline · Horizontal Stepper",
  interactions: ["display"],
  render: renderCard("toolboxSet", "Horizontal Stepper", <StepperTimeline />),
 }),
 makeModule({
  id: "set1_timeline",
  source: "toolboxSet",
  category: "Navigation",
  title: "Stepper/Timeline · Timeline",
  interactions: ["display"],
  render: renderCard("toolboxSet", "Timeline", <StepperTimeline />),
 }),
 makeModule({
  id: "set1_pagination",
  source: "toolboxSet",
  category: "Navigation",
  title: "Navigational Components · Pagination",
  interactions: ["click"],
  render: renderCard("toolboxSet", "Pagination", <PaginationStrip />),
 }),
 makeModule({
  id: "set1_download_upload_storage_meters",
  source: "toolboxSet",
  category: "Feedback/Status",
  title: "Feedback/Status · Download/Upload/Storage Meters",
  interactions: ["display"],
  render: renderCard("toolboxSet", "Download/Upload/Storage", <MetricsMeters />),
 }),
 makeModule({
  id: "set1_low_mid_high_meters",
  source: "toolboxSet",
  category: "Feedback/Status",
  title: "Feedback/Status · Low/Mid/High Meters",
  interactions: ["display"],
  render: renderCard("toolboxSet", "Low/Mid/High", <MetricsMeters />),
 }),
 makeModule({
  id: "set1_small_big_slider",
  source: "toolboxSet",
  category: "Feedback/Status",
  title: "Feedback/Status · Small + Big Slider",
  interactions: ["slider"],
  render: renderCard("toolboxSet", "Small + Big Slider", <SliderCluster />),
 }),
 makeModule({
  id: "set1_loading_circles",
  source: "toolboxSet",
  category: "Feedback/Status",
  title: "Feedback/Status · Loading Circles",
  interactions: ["animate"],
  render: renderCard("toolboxSet", "Loading Circles", <RingsAndLoaders />),
 }),
 makeModule({
  id: "set1_progress_rings",
  source: "toolboxSet",
  category: "Feedback/Status",
  title: "Feedback/Status · Progress Rings",
  interactions: ["display"],
  render: renderCard("toolboxSet", "Progress Rings", <RingsAndLoaders />),
 }),
 makeModule({
  id: "set1_top_toggle",
  source: "toolboxSet",
  category: "Controls",
  title: "Toggles · Top Toggle",
  interactions: ["toggle"],
  render: renderCard("toolboxSet", "Top Toggle", <ToggleCheckRadioBlock />),
 }),
 makeModule({
  id: "set1_color_picker_stack",
  source: "toolboxSet",
  category: "Controls",
  title: "Toggles · Color Picker Stack",
  interactions: ["color-select"],
  render: renderCard("toolboxSet", "Color Picker Stack", <PaletteGrid />),
 }),
 makeModule({
  id: "set1_multiline",
  source: "toolboxSet",
  category: "Inputs",
  title: "Text Fields · Multiline",
  interactions: ["focus", "resize"],
  render: renderCard("toolboxSet", "Multiline", <FocusFields />),
 }),
 makeModule({
  id: "set1_editable_text",
  source: "toolboxSet",
  category: "Inputs",
  title: "Text Fields · Editable Text",
  interactions: ["focus", "edit", "focus-outline-blue"],
  render: renderCard("toolboxSet", "Editable Text", <FocusFields />),
 }),
 makeModule({
  id: "set1_single_buttons",
  source: "toolboxSet",
  category: "Controls",
  title: "Buttons & Actions · Single Button Collection",
  interactions: ["click", "hover"],
  render: renderCard("toolboxSet", "Single Buttons", <ButtonSystem />),
 }),
]

const shimContracts = (): SourceComponentModule[] => [
 makeModule({
  id: "shim_pink_loading_bar",
  source: "shim",
  category: "Feedback/Status",
  title: "Data Visualization · Pink Loading Bar",
  interactions: ["animated-loading"],
  render: renderCard("shim", "Pink Loading Bar", <LoadingStates />),
 }),
 makeModule({
  id: "shim_live_status",
  source: "shim",
  category: "Feedback/Status",
  title: "Data Visualization · Live Status",
  interactions: ["status"],
  render: renderCard("shim", "Live Status", <StatusSignalCards labels={["Live status", "Sync ready"]} tone="#24D3FF" />),
 }),
 makeModule({
  id: "shim_system_operational",
  source: "shim",
  category: "Feedback/Status",
  title: "Data Visualization · System Operational",
  interactions: ["status"],
  render: renderCard("shim", "System Operational", <StatusSignalCards labels={["System operational", "No incidents"]} tone="#CCFF00" />),
 }),
 makeModule({
  id: "shim_complex_controls",
  source: "shim",
  category: "Controls",
  title: "Complete Complex Controls Toolbox",
  interactions: ["click", "hover", "toggle"],
  render: renderCard("shim", "Complex Controls", <ComplexControlsRig />),
 }),
 makeModule({
  id: "shim_hook_retention",
  source: "shim",
  category: "Inputs",
  title: "Hook Retention Box",
  interactions: ["focus", "hover"],
  render: renderCard("shim", "Hook Retention", <HookRetentionRig />),
 }),
 makeModule({
  id: "shim_hover_me",
  source: "shim",
  category: "Dialogs/Popups",
  title: "Hover Me Box",
  interactions: ["hover"],
  render: renderCard("shim", "Hover Me", <HoverInfoButton label="Hover Me" tooltip="Hover function preserved." tone="#24D3FF" />),
 }),
 makeModule({
  id: "shim_tactile_hardware",
  source: "shim",
  category: "Trees/Structure",
  title: "Tactile Hardware Toolbox",
  interactions: ["display"],
  render: renderCard("shim", "Tactile Hardware", <TactileHardwareRig />),
 }),
 makeModule({
  id: "shim_console_matrix",
  source: "shim",
  category: "Cards/Media",
  title: "Console Dashboards · 4-Unit Matrix",
  interactions: ["display"],
  render: renderCard("shim", "4-Unit Matrix", <ConsoleDashboardRig />),
 }),
 makeModule({
  id: "shim_console_media_strip",
  source: "shim",
  category: "Cards/Media",
  title: "Console Dashboards · 2-Unit Media Strip",
  interactions: ["display"],
  render: renderCard("shim", "2-Unit Media Strip", <ConsoleDashboardRig />),
 }),
]

const ustubeContracts = (): SourceComponentModule[] => [
 makeModule({
  id: "ustube_analytics_toolbox",
  source: "ustube",
  category: "Controls",
  title: "UStube Analytics Toolbox",
  interactions: ["display"],
  render: renderCard("ustube", "Analytics Toolbox", <UstubeAnalyticsRig />),
 }),
 makeModule({
  id: "ustube_algorithm_architect",
  source: "ustube",
  category: "Controls",
  title: "Algorithm Architect Toolbox",
  interactions: ["display"],
  render: renderCard(
   "ustube",
   "Algorithm Architect",
   <div className="space-y-2">
    <StatusSignalCards labels={["Ranking model", "Retention model"]} tone="#FFB158" />
    <SliderCluster includeValues />
   </div>,
  ),
 }),
 makeModule({
  id: "ustube_keyword_research",
  source: "ustube",
  category: "Controls",
  title: "Keyword Research Toolbox",
  interactions: ["display"],
  render: renderCard("ustube", "Keyword Research", <TagPills items={["creator growth", "audience retention", "thumbnail hooks", "storytelling", "upload strategy"]} compact />),
 }),
 makeModule({
  id: "ustube_strategy_chat",
  source: "ustube",
  category: "Controls",
  title: "Strategy Chat Toolbox",
  interactions: ["display"],
  render: renderCard("ustube", "Strategy Chat", <StrategyChatPanel />),
 }),
 makeModule({
  id: "ustube_impressions_trend",
  source: "ustube",
  category: "Cards/Media",
  title: "Impressions Trend",
  interactions: ["display"],
  render: renderCard("ustube", "Impressions Trend", <MetricsMeters />),
 }),
 makeModule({
  id: "ustube_views_histogram",
  source: "ustube",
  category: "Cards/Media",
  title: "Views Histogram",
  interactions: ["display"],
  render: renderCard("ustube", "Views Histogram", <HistogramBars values={[8, 14, 28, 34, 22, 16, 11]} color="#24D3FF" />),
 }),
 makeModule({
  id: "ustube_revenue_distribution",
  source: "ustube",
  category: "Cards/Media",
  title: "Revenue Distribution",
  interactions: ["display"],
  render: renderCard("ustube", "Revenue Distribution", <DistributionBars />),
 }),
 makeModule({
  id: "ustube_performance_bin",
  source: "ustube",
  category: "Cards/Media",
  title: "Performance Bin",
  interactions: ["display"],
  render: renderCard("ustube", "Performance Bin", <StatusSignalCards labels={["Core videos", "Risk videos", "Watchlist"]} tone="#FFE357" />),
 }),
 makeModule({
  id: "ustube_ability_vectors",
  source: "ustube",
  category: "Cards/Media",
  title: "Ability Vectors",
  interactions: ["display"],
  render: renderCard("ustube", "Ability Vectors", <HistogramBars values={[16, 21, 19, 27, 23]} color="#FF7497" />),
 }),
 makeModule({
  id: "ustube_hook_effectiveness",
  source: "ustube",
  category: "Controls",
  title: "Hook Effectiveness Box",
  interactions: ["display", "hover"],
  render: renderCard("ustube", "Hook Effectiveness", <HoverInfoButton label="Hook Effectiveness" tooltip="Hover feedback preserved from source." tone="#FFE357" />),
 }),
 makeModule({
  id: "ustube_inputs_four",
  source: "ustube",
  category: "Inputs",
  title: "Input Fields · Four Inputs",
  interactions: ["focus"],
  render: renderCard("ustube", "Input Fields", <FocusFields />),
 }),
 makeModule({
  id: "ustube_resizable_description",
  source: "ustube",
  category: "Inputs",
  title: "Input Fields · Resizable Description",
  interactions: ["resize", "focus"],
  render: renderCard("ustube", "Resizable Description", <FocusFields />),
 }),
 makeModule({
  id: "ustube_add_input_button",
  source: "ustube",
  category: "Inputs",
  title: "Input Fields · Add Button",
  interactions: ["click-add"],
  render: renderCard("ustube", "Add Input", <FocusFields includeAddButton />),
 }),
 makeModule({
  id: "ustube_sliders_three",
  source: "ustube",
  category: "Inputs",
  title: "Sliders · Three",
  interactions: ["slider", "live-value"],
  render: renderCard("ustube", "Sliders", <SliderCluster includeValues />),
 }),
 makeModule({
  id: "ustube_toggles_two",
  source: "ustube",
  category: "Inputs",
  title: "Toggles · Two",
  interactions: ["toggle"],
  render: renderCard("ustube", "Two Toggles", <ToggleCheckRadioBlock />),
 }),
 makeModule({
  id: "ustube_button_small_cyan",
  source: "ustube",
  category: "Controls",
  title: "Button System · Small Cyan",
  interactions: ["click"],
  render: renderCard("ustube", "Small Cyan", <button className="h-9 w-9 border-[3px] border-black rounded-lg bg-[#24D3FF]" />),
 }),
 makeModule({
  id: "ustube_button_small_lime",
  source: "ustube",
  category: "Controls",
  title: "Button System · Small Lime",
  interactions: ["click"],
  render: renderCard("ustube", "Small Lime", <button className="h-9 w-9 border-[3px] border-black rounded-lg bg-[#CCFF00]" />),
 }),
 makeModule({
  id: "ustube_hover_tip_button",
  source: "ustube",
  category: "Dialogs/Popups",
  title: "Button System · Hover Tip",
  interactions: ["hover"],
  render: renderCard("ustube", "Hover Tip", <HoverInfoButton label="Hover for Tip" tooltip="Hover pop-up preserved from source button." tone="#24D3FF" />),
 }),
 makeModule({
  id: "ustube_tasks_with_strike",
  source: "ustube",
  category: "Trees/Structure",
  title: "Tasks Box · Checkboxes with strike-through",
  interactions: ["check", "strike-through"],
  render: renderCard("ustube", "Tasks", <StrikeTaskList />),
 }),
 makeModule({
  id: "ustube_channel_goals_progress",
  source: "ustube",
  category: "Trees/Structure",
  title: "Channel Goals · Progress Bars",
  interactions: ["display"],
  render: renderCard("ustube", "Channel Goals", <ChannelGoalProgress />),
 }),
 makeModule({
  id: "ustube_video_manager_box",
  source: "ustube",
  category: "Navigation",
  title: "Video Manager Box",
  interactions: ["display"],
  render: renderCard("ustube", "Video Manager Box", <VideoManagerLite />),
 }),
 makeModule({
  id: "ustube_content_calendar_box",
  source: "ustube",
  category: "Navigation",
  title: "Content Calendar Box",
  interactions: ["display"],
  render: renderCard("ustube", "Content Calendar", <ContentCalendarRig />),
 }),
 makeModule({
  id: "ustube_loading_states",
  source: "ustube",
  category: "Feedback/Status",
  title: "Loading States · Bars/Circles/Dots",
  interactions: ["animated-loading"],
  render: renderCard("ustube", "Loading States", <LoadingStates />),
 }),
 makeModule({
  id: "ustube_dialog_notifications",
  source: "ustube",
  category: "Dialogs/Popups",
  title: "Dialog + Notifications",
  interactions: ["open-modal", "emit-notification"],
  render: renderCard("ustube", "Dialog + Notifications", <DialogNotificationRig />),
 }),
]

const useSectionCEModules = (): SourceModuleCollection =>
 buildCollection(sectionCEContracts())

const useToolboxSetModules = (): SourceModuleCollection =>
 buildCollection(setOneContracts())

const useShimModules = (): SourceModuleCollection => buildCollection(shimContracts())

const useUstubeModules = (): SourceModuleCollection =>
 buildCollection(ustubeContracts())

export const SourceModuleRegistry = {
 sectionCE: useSectionCEModules,
 toolboxSet: useToolboxSetModules,
 shim: useShimModules,
 ustube: useUstubeModules,
}

export const SourceUtilityModules = {
 ButtonSystem,
 FocusFields,
 SliderCluster,
 StrikeTaskList,
 LoadingStates,
 SidebarNav,
 CollapsibleTree,
 VideoCardsLite,
 MetricsMeters,
 HoverInfoButton,
 ModalLauncher,
 PublisherUpload,
 PaletteGrid,
 TagPills,
 DailyStatsBox,
 KpiSixPack,
 VaultModule,
 CheckerAvatarsSwatches,
 StepperTimeline,
 ComplexControlsRig,
 TactileHardwareRig,
 ConsoleDashboardRig,
 UstubeAnalyticsRig,
 ContentCalendarRig,
 DialogNotificationRig,
 ChannelGoalProgress,
 ToggleCheckRadioBlock,
 PaginationStrip,
 RingsAndLoaders,
}

export const SourceHeaderIcons = {
 sectionCE: <FolderTree size={20} strokeWidth={2.6} className="text-black" />,
 toolboxSet: <Image size={20} strokeWidth={2.6} className="text-black" />,
 shim: <Zap size={20} strokeWidth={2.6} className="text-black" />,
 ustube: <Video size={20} strokeWidth={2.6} className="text-black" />,
 controls: <Sparkles size={20} strokeWidth={2.6} className="text-black" />,
 inputs: <Save size={20} strokeWidth={2.6} className="text-black" />,
 feedback: <Bell size={20} strokeWidth={2.6} className="text-black" />,
 dialogs: <AlertCircle size={20} strokeWidth={2.6} className="text-black" />,
 palette: <Palette size={20} strokeWidth={2.6} className="text-black" />,
 calendar: <Calendar size={20} strokeWidth={2.6} className="text-black" />,
 upload: <Upload size={20} strokeWidth={2.6} className="text-black" />,
 file: <FileVideo size={20} strokeWidth={2.6} className="text-black" />,
 layers: <Layers size={20} strokeWidth={2.6} className="text-black" />,
 plus: <Plus size={20} strokeWidth={2.6} className="text-black" />,
 minus: <Minus size={20} strokeWidth={2.6} className="text-black" />,
 check: <Check size={20} strokeWidth={2.6} className="text-black" />,
 x: <X size={20} strokeWidth={2.6} className="text-black" />,
}

export const useAllSourceModules = () => {
 const sectionCE = SourceModuleRegistry.sectionCE()
 const toolboxSet = SourceModuleRegistry.toolboxSet()
 const shim = SourceModuleRegistry.shim()
 const ustube = SourceModuleRegistry.ustube()

 const allContracts = [
  ...sectionCE.contracts,
  ...toolboxSet.contracts,
  ...shim.contracts,
  ...ustube.contracts,
 ]

 return useMemo(
  () => ({ sectionCE, toolboxSet, shim, ustube, allContracts }),
  [sectionCE, toolboxSet, shim, ustube, allContracts],
 )
}
