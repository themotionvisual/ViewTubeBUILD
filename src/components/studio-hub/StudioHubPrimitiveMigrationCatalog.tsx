import React from "react"
import { Check, ChevronDown, ChevronRight, Lightbulb, Menu, Minus, MoreHorizontal, Plus, Search, Settings2, SlidersHorizontal, X } from "lucide-react"
import { type StudioHubComponentLevel } from "./StudioHubCompletePrimitiveCatalog"
import {
  SubToolboxBadge,
  SubToolboxButton,
  SubToolboxButtonGroup,
  SubToolboxCheckControl,
  SubToolboxIconButton,
  SubToolboxInput,
  SubToolboxMenu,
  SubToolboxProgressBar,
  SubToolboxProgressValue,
  SubToolboxRadioControl,
  SubToolboxRangeSlider,
  SubToolboxRemovableTag,
  SubToolboxSegmentedToggle,
  SubToolboxSelectableTag,
  SubToolboxSettingsSwitch,
  SubToolboxSlider,
  SubToolboxSplitField,
  SubToolboxStatCard,
  SubToolboxStatusBadge,
  SubToolboxStepper,
  SubToolboxTag,
  SubToolboxTagEditor,
  SubToolboxTextArea,
  SubToolboxToggleSwitch,
  SubToolboxTooltip,
} from "../subtoolbox/SubToolboxPrimitives"
import { SubToolboxKpiCard, SubToolboxSplitButton, SubToolboxSplitDropdown } from "../subtoolbox/SubToolboxSplitPrimitives"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import "./studio-hub-complete-primitive-catalog.css"

const LEVELS: StudioHubComponentLevel[] = ["l0", "l1", "l2"]

export const STUDIO_HUB_MIGRATED_FAMILIES = [
  "Primary Button",
  "Secondary Button",
  "Neutral Button",
  "Destructive Button",
  "Square Icon Button",
  "Split Left Button",
  "Head Tail Action",
  "Split Menu",
  "Dropdown",
  "Select Menu",
  "Context Menu",
  "Text Input",
  "Textarea",
  "Split Search",
  "Number Field",
  "Input Action",
  "Stepper",
  "Slider",
  "Range Slider",
  "Toggle",
  "Settings Switch",
  "Checkbox",
  "Radio",
  "Segmented Choice",
  "Button Group",
  "Tag",
  "Removable Tag",
  "Selectable Tag",
  "Tag Editor",
  "Badge",
  "Status Badge",
  "Progress Bar",
  "Progress Value",
  "KPI",
  "Stat Card",
  "Tooltip",
] as const

const pair = (index: number) => ({
  a: VT_SPECTRUM_PALETTE_06[index % 12],
  b: VT_SPECTRUM_PALETTE_06[(index + 6) % 12],
})

const DemoShell: React.FC<{ level: StudioHubComponentLevel; children: React.ReactNode }> = ({ level, children }) => (
  <div className={`vt-catalog-demo is-${level}`} data-level={level}>{children}</div>
)

const PrimitiveMigrationControl: React.FC<{
  name: string
  level: StudioHubComponentLevel
  paletteIndex: number
}> = ({ name, level, paletteIndex }) => {
  const levelOffset = level === "l0" ? 0 : level === "l1" ? 2 : 4
  const colors = pair(paletteIndex + levelOffset)
  const style = { "--pair-a": colors.a, "--pair-b": colors.b } as React.CSSProperties
  const [stepperValue, setStepperValue] = React.useState(5)
  const [toggleOn, setToggleOn] = React.useState(true)
  const [settingsOn, setSettingsOn] = React.useState(true)
  const [checkboxOn, setCheckboxOn] = React.useState(true)
  const [radioOn, setRadioOn] = React.useState(true)
  const [segmentChoice, setSegmentChoice] = React.useState("A")
  const [groupChoice, setGroupChoice] = React.useState("ONE")
  const [menuChoice, setMenuChoice] = React.useState("OPTION 1")
  const [sliderValue, setSliderValue] = React.useState(62)
  const [rangeLow, setRangeLow] = React.useState(22)
  const [rangeHigh, setRangeHigh] = React.useState(76)
  const [selectableTagOn, setSelectableTagOn] = React.useState(false)
  const [editorTags, setEditorTags] = React.useState(["NAPOLEON", "CAVALRY"])

  // Wave 02: these families are now rendered by production primitives + shared
  // CSS. All remaining families deliberately fall back to the frozen catalog
  // renderer until visual parity is certified.
  if (name === "Primary Button" || name === "Secondary Button" || name === "Neutral Button" || name === "Destructive Button") {
    return <SubToolboxButton level={level} style={style}>{name.replace(" Button", "")}</SubToolboxButton>
  }
  if (name === "Square Icon Button") {
    return <SubToolboxIconButton level={level} style={style} icon={<Settings2 />} ariaLabel="Settings" />
  }
  if (name === "Text Input") {
    return <SubToolboxInput level={level} style={style} type="text" defaultValue="TEXT INPUT" />
  }
  if (name === "Textarea") {
    return <SubToolboxTextArea level={level} style={style} defaultValue="DESCRIPTION" />
  }
  if (name === "Stepper") {
    return <SubToolboxStepper level={level} style={style} value={stepperValue} decreaseIcon={<Minus />} increaseIcon={<Plus />} onDecrease={() => setStepperValue((value) => value - 1)} onIncrease={() => setStepperValue((value) => value + 1)} />
  }
  if (name === "Toggle") {
    return <SubToolboxToggleSwitch level={level} style={style} pressed={toggleOn} aria-label="Toggle" onClick={() => setToggleOn((value) => !value)} />
  }
  if (name === "Checkbox") {
    return <SubToolboxCheckControl level={level} style={style} checked={checkboxOn} aria-label="Checkbox" onClick={() => setCheckboxOn((value) => !value)} />
  }
  if (name === "Radio") {
    return <SubToolboxRadioControl level={level} style={style} checked={radioOn} aria-label="Radio" onClick={() => setRadioOn((value) => !value)} />
  }
  if (name === "Segmented Choice") {
    return <SubToolboxSegmentedToggle level={level} style={{ ...style, ["--vt-segment-count" as string]: 3 }} options={[{ value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} value={segmentChoice} onValueChange={setSegmentChoice} />
  }
  if (name === "Tag") {
    return <SubToolboxTag level={level} style={style}>NAPOLEON</SubToolboxTag>
  }
  if (name === "Badge") {
    return <SubToolboxBadge level={level} style={style}>BADGE</SubToolboxBadge>
  }
  if (name === "Status Badge") {
    return <SubToolboxStatusBadge level={level} style={style}>READY</SubToolboxStatusBadge>
  }
  if (name === "Split Left Button" || name === "Head Tail Action") {
    return <SubToolboxSplitButton level={level} style={style} icon={name === "Head Tail Action" ? <ChevronRight /> : <Settings2 />} railColor={colors.a} labelColor={colors.b}>{name === "Head Tail Action" ? "Action" : "Settings"}</SubToolboxSplitButton>
  }
  if (name === "Split Menu") {
    return <SubToolboxSplitDropdown level={level} value={menuChoice} options={["OPTION 1","OPTION 2","OPTION 3"].map((option) => ({ value: option, label: option, icon: <Menu /> }))} onChange={setMenuChoice} icon={<Menu />} railLabel="SET" ariaLabel="Split menu" railColor={colors.a} labelColor={colors.b} />
  }
  if (name === "Dropdown" || name === "Select Menu" || name === "Context Menu") {
    return <SubToolboxMenu level={level} style={style} variant={name === "Context Menu" ? "context" : name === "Select Menu" ? "select" : "dropdown"} value={menuChoice} options={["OPTION 1","OPTION 2","OPTION 3"].map((option) => ({ value: option, label: option }))} onValueChange={setMenuChoice} triggerLabel={name === "Dropdown" ? "MENU" : menuChoice} triggerIcon={<MoreHorizontal />} chevronIcon={<ChevronDown />} ariaLabel={name} />
  }
  if (name === "Split Search") {
    return <SubToolboxSplitField level={level} style={style} icon={<Search />} inputProps={{ "aria-label": "Search", placeholder: "SEARCH" }} />
  }
  if (name === "Number Field") {
    return <SubToolboxInput level={level} style={style} type="number" defaultValue="25" />
  }
  if (name === "Input Action") {
    return <SubToolboxSplitField level={level} style={style} icon={<Plus />} inputProps={{ "aria-label": "Add item", placeholder: "ADD ITEM" }} />
  }
  if (name === "Slider") {
    return <SubToolboxSlider level={level} style={style} value={sliderValue} onValueChange={setSliderValue} railIcon={<span>S</span>} onReset={() => setSliderValue(62)} />
  }
  if (name === "Range Slider") {
    return <SubToolboxRangeSlider level={level} style={style} low={rangeLow} high={rangeHigh} onLowChange={setRangeLow} onHighChange={setRangeHigh} railIcon={<SlidersHorizontal />} onReset={() => { setRangeLow(22); setRangeHigh(76) }} />
  }
  if (name === "Settings Switch") {
    return <SubToolboxSettingsSwitch level={level} style={style} pressed={settingsOn} aria-label="Settings switch" onClick={() => setSettingsOn((value) => !value)} />
  }
  if (name === "Button Group") {
    return <SubToolboxButtonGroup level={level} style={style} items={[{ value: "ONE", label: "ONE" }, { value: "TWO", label: "TWO" }]} value={groupChoice} onValueChange={setGroupChoice} />
  }
  if (name === "Removable Tag") {
    return <SubToolboxRemovableTag level={level} style={style} removeIcon={<X />}>NAPOLEON</SubToolboxRemovableTag>
  }
  if (name === "Selectable Tag") {
    return <SubToolboxSelectableTag level={level} style={style} selected={selectableTagOn} selectedIcon={<Check />} unselectedIcon={<Plus />} onClick={() => setSelectableTagOn((value) => !value)}>{selectableTagOn ? "SELECTED" : "SELECT"}</SubToolboxSelectableTag>
  }
  if (name === "Tag Editor") {
    return <SubToolboxTagEditor level={level} style={style} tags={editorTags} onTagsChange={setEditorTags} addIcon={<Plus />} saveIcon={<Check />} removeIcon={<X />} />
  }
  if (name === "Progress Bar") {
    return <SubToolboxProgressBar level={level} style={style} value={68} />
  }
  if (name === "Progress Value") {
    return <SubToolboxProgressValue level={level} style={style} value={68} />
  }
  if (name === "KPI") {
    return <SubToolboxKpiCard level={level} style={style} label="VIEWS" value="12.4K" accentColor={colors.a} railColor={colors.b} />
  }
  if (name === "Stat Card") {
    return <SubToolboxStatCard level={level} style={style} label="WATCH TIME" value="4,820H" delta="+12.4%" />
  }
  if (name === "Tooltip") {
    return <SubToolboxTooltip level={level} forceOpen content="TOOLTIP" style={style} />
  }

  return null
}

export interface StudioHubPrimitiveMigrationCatalogProps {
  paletteIndex?: number
}

export const StudioHubPrimitiveMigrationCatalog: React.FC<StudioHubPrimitiveMigrationCatalogProps> = ({
  paletteIndex = 7,
}) => (
  <section
    className="vt-complete-catalog"
    aria-labelledby="studio-hub-primitive-migration-catalog-title"
    data-palette-index={paletteIndex}
    data-vt-catalog-track="primitive-migration"
  >
    <header className="vt-complete-catalog-heading">
      <div>
        <Lightbulb />
        <div>
          <h2 id="studio-hub-primitive-migration-catalog-title">Complete Component + Primitive Catalog</h2>
          <p>Only production primitives are rendered here. Unmigrated hardcoded families stay exclusively in the baseline toolbox.</p>
        </div>
      </div>
      <strong>{STUDIO_HUB_MIGRATED_FAMILIES.length} PRIMITIVE FAMILIES · {STUDIO_HUB_MIGRATED_FAMILIES.length * LEVELS.length} EXAMPLES</strong>
    </header>

    <div className="vt-complete-catalog-grid">
      {STUDIO_HUB_MIGRATED_FAMILIES.map((name, index) => (
        <article
          className="vt-catalog-family"
          key={name}
          data-vt-family={name}
          data-vt-migration-state="primitive"
        >
          <h3><span>{String(index + 1).padStart(2, "0")}</span>{name}</h3>
          <div className="vt-catalog-levels">
            {LEVELS.map((level) => (
              <DemoShell level={level} key={level}>
                <PrimitiveMigrationControl
                  name={name}
                  level={level}
                  paletteIndex={paletteIndex}
                />
              </DemoShell>
            ))}
          </div>
        </article>
      ))}
    </div>
  </section>
)

export default StudioHubPrimitiveMigrationCatalog
