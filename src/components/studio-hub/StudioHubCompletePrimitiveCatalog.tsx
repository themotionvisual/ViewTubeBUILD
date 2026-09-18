import React, { useState } from "react"
import {
  Check, ChevronDown, ChevronLeft, ChevronRight, Circle, FileText, Image, Lightbulb,
  Menu, Minus, MoreHorizontal, Music, Plus, Search, Settings2, SlidersHorizontal,
  Upload, Video, X,
} from "lucide-react"
import {
  SubToolboxBadge, SubToolboxButton, SubToolboxFileTarget, SubToolboxInput,
  SubToolboxTag, SubToolboxTextArea,
} from "../subtoolbox/SubToolboxPrimitives"
import {
  SubToolboxKpiCard, SubToolboxSplitButton, SubToolboxSplitDropdown,
} from "../subtoolbox/SubToolboxSplitPrimitives"
import { CONTROL_SIZE_FOR_LEVEL } from "../subtoolbox/tokens"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import "./studio-hub-complete-primitive-catalog.css"

type Level = "l0" | "l1" | "l2"
const LEVELS: Level[] = ["l0", "l1", "l2"]

export const STUDIO_HUB_COMPONENT_FAMILIES = [
  "Primary Button", "Secondary Button", "Neutral Button", "Destructive Button",
  "Square Icon Button", "Split Left Button", "Head Tail Action", "Split Menu",
  "Dropdown", "Select Menu", "Context Menu", "Text Input", "Textarea", "Split Search",
  "Number Field", "Input Action", "Stepper", "Slider", "Range Slider", "Toggle",
  "Settings Switch", "Checkbox", "Radio", "Segmented Choice", "Button Group", "Tag",
  "Removable Tag", "Selectable Tag", "Tag Editor", "Badge", "Status Badge", "Progress Bar",
  "Progress Value", "KPI", "Stat Card", "Metric Strip", "Tooltip", "Popover", "Disclosure",
  "Divider", "Horizontal Scrollbar", "Vertical Scrollbar", "Data Stats Module", "Disabled Button",
  "Disabled Split Button", "Upload Frame", "Pagination", "Vault Landscape Asset",
  "Vault Portrait Asset", "Vault Audio Asset", "Vault Document Asset", "Knob Dial",
  "Controller Switch", "LED Light", "Alphabetical Spectrum Tags", "Icon Rail Control",
] as const

const pair = (index: number) => ({
  a: VT_SPECTRUM_PALETTE_06[index % 12],
  b: VT_SPECTRUM_PALETTE_06[(index + 6) % 12],
})

const DemoShell: React.FC<{ level: Level; children: React.ReactNode }> = ({ level, children }) => (
  <div className={`vt-catalog-demo is-${level}`} data-level={level}>{children}</div>
)

const GenericControl: React.FC<{ name: string; level: Level; index: number; paletteIndex: number }> = ({ name, level, index, paletteIndex }) => {
  const levelOffset = level === "l0" ? 0 : level === "l1" ? 2 : 4
  const colors = pair(paletteIndex + levelOffset)
  const [value, setValue] = useState(5)
  const [toggleOn, setToggleOn] = useState(true)
  const [switchOn, setSwitchOn] = useState(true)
  const [sliderValue, setSliderValue] = useState(62)
  const [rangeLow, setRangeLow] = useState(22)
  const [rangeHigh, setRangeHigh] = useState(76)
  const [scrollPos, setScrollPos] = useState(18)
  const [page, setPage] = useState(2)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [disclosureOpen, setDisclosureOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [menuChoice, setMenuChoice] = useState("OPTION 1")
  const style = { "--pair-a": colors.a, "--pair-b": colors.b } as React.CSSProperties
  const icon = <Settings2 aria-hidden="true" />

  if (name === "Primary Button" || name === "Secondary Button" || name === "Neutral Button" || name === "Destructive Button")
    return <button className={`vt-catalog-button is-${level}`} style={style}>{name.replace(" Button", "")}</button>
  if (name === "Square Icon Button") return <button aria-label="Settings" className={`vt-catalog-icon-button is-${level}`} style={style}>{icon}</button>
  if (name === "Split Left Button" || name === "Head Tail Action") return <SubToolboxSplitButton icon={name === "Head Tail Action" ? <ChevronRight /> : icon} railColor={colors.a} labelColor={colors.b}>{name === "Head Tail Action" ? "Action" : "Settings"}</SubToolboxSplitButton>
  if (name === "Split Menu" || name === "Dropdown" || name === "Select Menu" || name === "Context Menu") {
    const key = `${name}-${level}-${index}`
    const split = name === "Split Menu"
    const context = name === "Context Menu"
    return <div className={`vt-catalog-menu ${split ? "is-split" : ""} ${context ? "is-context" : ""} is-${level}`} style={style}>
      <button type="button" className="menu-trigger" aria-haspopup="menu" aria-expanded={menuOpen === key} onClick={() => setMenuOpen(menuOpen === key ? null : key)}>
        {split ? <span className="menu-rail"><Menu /></span> : null}
        {context ? <MoreHorizontal /> : <span className="menu-label"><b>{name === "Dropdown" ? "MENU" : menuChoice}</b><ChevronDown /></span>}
      </button>
      {menuOpen === key ? <div className="menu-panel" role="menu">
        {["OPTION 1","OPTION 2","OPTION 3"].map(option => <button type="button" role="menuitem" key={option} className={menuChoice === option ? "is-selected" : ""} onClick={() => { setMenuChoice(option); setMenuOpen(null) }}>{option}</button>)}
      </div> : null}
    </div>
  }
  if (name === "Text Input" || name === "Number Field") return <SubToolboxInput className={`vt-catalog-field is-${level}`} style={style} type={name === "Number Field" ? "number" : "text"} defaultValue={name === "Number Field" ? "25" : "TEXT INPUT"} />
  if (name === "Textarea") return <SubToolboxTextArea className={`vt-catalog-field vt-catalog-textarea is-${level}`} style={style} defaultValue="DESCRIPTION" />
  if (name === "Split Search") return <div className={`vt-catalog-split-field is-${level}`} style={style}><span><Search /></span><input aria-label="Search" placeholder="SEARCH" /></div>
  if (name === "Input Action") return <div className={`vt-catalog-split-field is-${level}`} style={style}><span><Plus /></span><input aria-label="Add item" placeholder="ADD ITEM" /></div>
  if (name === "Stepper") return <div className={`vt-catalog-stepper is-${level}`} style={style}><button type="button" aria-label="Decrease" onClick={() => setValue(v => v - 1)}><Minus /></button><strong>{value}</strong><button type="button" aria-label="Increase" onClick={() => setValue(v => v + 1)}><Plus /></button></div>
  if (name === "Slider") return <div className={`vt-catalog-slider is-${level}`} style={style}><button type="button" className="rail" aria-label="Reset slider" onClick={() => setSliderValue(62)}><ChevronRight/></button><div className="slider-center"><input aria-label="Slider value" type="range" min="0" max="100" value={sliderValue} onChange={e => setSliderValue(Number(e.target.value))}/></div><output>{sliderValue}</output></div>
  if (name === "Range Slider") return <div className={`vt-catalog-range is-${level}`} style={style}><button type="button" className="rail" aria-label="Reset range" onClick={() => { setRangeLow(22); setRangeHigh(76) }}><SlidersHorizontal/></button><div className="range-center"><div className="range-track"><span className="range-fill" style={{left:`${rangeLow}%`,right:`${100-rangeHigh}%`}}/></div><input aria-label="Range minimum" type="range" min="0" max="100" value={rangeLow} onChange={e => setRangeLow(Math.min(Number(e.target.value), rangeHigh - 1))}/><input aria-label="Range maximum" type="range" min="0" max="100" value={rangeHigh} onChange={e => setRangeHigh(Math.max(Number(e.target.value), rangeLow + 1))}/></div><output>{rangeLow}–{rangeHigh}</output></div>
  if (name === "Toggle") return <button type="button" className={`vt-catalog-toggle is-${level} ${toggleOn ? "is-on" : ""}`} style={style} aria-pressed={toggleOn} aria-label="Toggle" onClick={() => setToggleOn(v => !v)}><span /></button>
  if (name === "Settings Switch") return <button type="button" className={`vt-catalog-switch is-${level} ${switchOn ? "is-on" : ""}`} style={style} aria-pressed={switchOn} onClick={() => setSwitchOn(v => !v)}><span /></button>
  if (name === "Checkbox") return <button type="button" className={`vt-catalog-checkbox is-${level}`} style={style} aria-label="Checkbox" aria-pressed="true"><span /></button>
  if (name === "Radio") return <button type="button" className={`vt-catalog-radio is-${level}`} style={style} aria-label="Radio" aria-pressed="true"><span /></button>
  if (name === "Segmented Choice") return <div className={`vt-catalog-segmented is-${level}`} style={style}><button>A</button><button>B</button><button>C</button></div>
  if (name === "Button Group") return <div className="vt-catalog-button-group"><SubToolboxButton size={CONTROL_SIZE_FOR_LEVEL[level]}>One</SubToolboxButton><SubToolboxButton size={CONTROL_SIZE_FOR_LEVEL[level]}>Two</SubToolboxButton></div>
  if (name === "Tag") return <SubToolboxTag>Napoleon</SubToolboxTag>
  if (name === "Removable Tag") return <span className={`vt-spectrum-tag is-${level}`} style={style}>Napoleon <button aria-label="Remove"><X /></button></span>
  if (name === "Selectable Tag") return <SubToolboxTag selected><Check /> Selected</SubToolboxTag>
  if (name === "Tag Editor") return <div className="vt-catalog-tag-editor"><span className={`vt-spectrum-tag is-${level}`} style={style}>History <button><X /></button></span><button className="add"><Plus /></button></div>
  if (name === "Badge") return <SubToolboxBadge>Badge</SubToolboxBadge>
  if (name === "Status Badge") return <span className={`vt-status-badge is-${level}`} style={style}><i/>Ready</span>
  if (name === "Progress Bar" || name === "Progress Value") return <div className={`vt-catalog-progress is-${level}`} style={style}><span style={{width:"68%"}} />{name === "Progress Value" ? <b>68%</b> : null}</div>
  if (name === "KPI") return <SubToolboxKpiCard label="Views" value="12.4K" accentColor={colors.a} />
  if (name === "Stat Card" || name === "Data Stats Module") return <div className={`vt-catalog-stat is-${level}`} style={style}><small>{name === "Data Stats Module" ? "TOTAL VIEWS" : "WATCH TIME"}</small><strong>{name === "Data Stats Module" ? "128,442" : "4,820H"}</strong><span>+12.4%</span></div>
  if (name === "Metric Strip") return <div className={`vt-catalog-metric-strip is-${level}`} style={style}><b>VIEWS 12K</b><b>CTR 5.8%</b><b>AVP 72%</b></div>
  if (name === "Tooltip") return <div className={`vt-catalog-tooltip-demo is-${level}`} style={style}><button type="button" aria-describedby={`tip-${level}-${index}`}>?</button><div role="tooltip" id={`tip-${level}-${index}`} className="vt-catalog-tooltip">TOOLTIP</div></div>
  if (name === "Popover") return <div className={`vt-catalog-popover-demo is-${level}`} style={style}><button type="button" className="popover-trigger" aria-expanded={popoverOpen} onClick={() => setPopoverOpen(v => !v)}><Menu/><span>OPTIONS</span></button>{popoverOpen ? <div className="vt-catalog-popover" role="dialog" aria-label="Options"><header><Menu/><b>OPTIONS</b><button type="button" aria-label="Close" onClick={() => setPopoverOpen(false)}><X/></button></header><p>POPOVER CONTENT</p></div> : null}</div>
  if (name === "Disclosure") return <div className={`vt-catalog-disclosure is-${level} ${disclosureOpen ? "is-open" : ""}`} style={style}><button type="button" className="disclosure-head" aria-expanded={disclosureOpen} onClick={() => setDisclosureOpen(v => !v)}><Plus/><b>ADVANCED</b><ChevronRight className="chevron"/></button>{disclosureOpen ? <p>DISCLOSURE CONTENT</p> : null}</div>
  if (name === "Divider") return <hr className={`vt-catalog-divider is-${level}`} style={style}/>
  if (name === "Horizontal Scrollbar") return <div className={`vt-catalog-hscroll is-${level}`} style={style}><button type="button" aria-label="Scroll left" onClick={() => setScrollPos(v => Math.max(0,v-10))}><ChevronLeft/></button><span><i style={{left:`${scrollPos}%`}}/></span><button type="button" aria-label="Scroll right" onClick={() => setScrollPos(v => Math.min(58,v+10))}><ChevronRight/></button></div>
  if (name === "Vertical Scrollbar") return <div className={`vt-catalog-vscroll is-${level}`} style={style}><button type="button" aria-label="Scroll up" onClick={() => setScrollPos(v => Math.max(0,v-10))}><ChevronDown className="up"/></button><span><i style={{top:`${scrollPos}%`}}/></span><button type="button" aria-label="Scroll down" onClick={() => setScrollPos(v => Math.min(58,v+10))}><ChevronDown/></button></div>
  if (name === "Disabled Button") return <button disabled className={`vt-catalog-button is-${level} is-disabled`}>Disabled</button>
  if (name === "Disabled Split Button") return <button disabled className={`vt-catalog-disabled-split is-${level}`}><span>{icon}</span><b>Disabled</b></button>
  if (name === "Upload Frame") return <div className={`vt-catalog-upload-authority is-${level}`} style={style}><SubToolboxFileTarget label="Drop or choose file" icon={<Upload />} minHeight={level === "l0" ? 176 : level === "l1" ? 144 : 112} /></div>
  if (name === "Pagination") return <div className={`vt-catalog-pagination is-${level}`} style={style}><button type="button" aria-label="Previous page" onClick={() => setPage(v => Math.max(1,v-1))}><ChevronLeft/></button>{[1,2,3].map(p => <button type="button" key={p} className={page===p ? "is-on" : ""} aria-current={page===p ? "page" : undefined} onClick={() => setPage(p)}>{p}</button>)}<button type="button" aria-label="Next page" onClick={() => setPage(v => Math.min(3,v+1))}><ChevronRight/></button></div>
  if (name.startsWith("Vault ")) {
    const Icon = name.includes("Landscape") || name.includes("Portrait") ? Image : name.includes("Audio") ? Music : FileText
    return <div className={`vt-catalog-asset is-${level} ${name.includes("Portrait") ? "is-portrait" : ""}`} style={style}><header><Icon/><b>{name.replace("Vault ","")}</b></header><div className="preview"><Icon/></div><footer><span>ASSET</span><button><X/></button></footer></div>
  }
  if (name === "Knob Dial") return <div className={`vt-catalog-knob is-${level}`} style={style}><span><i/></span><b>72</b></div>
  if (name === "Controller Switch") return <button className={`vt-catalog-controller-switch is-${level}`} style={style}><span/><b>ON</b></button>
  if (name === "LED Light") return <div className={`vt-catalog-led is-${level}`} style={style}><i/><b>ACTIVE</b></div>
  if (name === "Alphabetical Spectrum Tags") return <div className="vt-catalog-spectrum-row">{["A","F","K","P","U","Z"].map((letter, i) => <span key={letter} className={`vt-alpha-tag is-${level}`} style={{"--alpha":VT_SPECTRUM_PALETTE_06[(i*2)%12]} as React.CSSProperties}>{letter} · TAG</span>)}</div>
  if (name === "Icon Rail Control") return <div className={`vt-catalog-icon-rail is-${level}`} style={style}><span><SlidersHorizontal/></span><b>Control</b></div>
  return <Circle />
}

export interface StudioHubCompletePrimitiveCatalogProps { paletteIndex?: number }

export const StudioHubCompletePrimitiveCatalog: React.FC<StudioHubCompletePrimitiveCatalogProps> = ({ paletteIndex = 7 }) => (
  <section className="vt-complete-catalog" aria-labelledby="studio-hub-complete-catalog-title" data-palette-index={paletteIndex}>
    <header className="vt-complete-catalog-heading">
      <div><Lightbulb/><div><h2 id="studio-hub-complete-catalog-title">Complete Component + Primitive Catalog</h2><p>Every reusable Studio Hub family rendered at L0, L1 and L2. Compact is retired.</p></div></div>
      <strong>{STUDIO_HUB_COMPONENT_FAMILIES.length} FAMILIES · {STUDIO_HUB_COMPONENT_FAMILIES.length * LEVELS.length} EXAMPLES</strong>
    </header>
    <div className="vt-complete-catalog-grid">
      {STUDIO_HUB_COMPONENT_FAMILIES.map((name, index) => (
        <article className="vt-catalog-family" key={name}>
          <h3><span>{String(index + 1).padStart(2,"0")}</span>{name}</h3>
          <div className="vt-catalog-levels">
            {LEVELS.map(level => <DemoShell level={level} key={level}><GenericControl name={name} level={level} index={index} paletteIndex={paletteIndex}/></DemoShell>)}
          </div>
        </article>
      ))}
    </div>
  </section>
)

export default StudioHubCompletePrimitiveCatalog
