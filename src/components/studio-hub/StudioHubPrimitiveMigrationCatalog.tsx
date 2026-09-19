import React from "react"
import { Check, ChevronDown, ChevronRight, FileText, Image, Lightbulb, Menu, Minus, MoreHorizontal, Music, Plus, Search, Settings2, SlidersHorizontal, Upload, X } from "lucide-react"
import { type StudioHubComponentLevel } from "./StudioHubCompletePrimitiveCatalog"
import {
  SubToolboxAlert,
  SubToolboxAlphabeticalSpectrumTags,
  SubToolboxAvatar,
  SubToolboxBreadcrumb,
  SubToolboxCarousel,
  SubToolboxCommandPalette,
  SubToolboxBadge,
  SubToolboxButton,
  SubToolboxButtonGroup,
  SubToolboxCheckControl,
  SubToolboxColorPicker,
  SubToolboxDataStats,
  SubToolboxDataTable,
  SubToolboxDialog,
  SubToolboxDisclosure,
  SubToolboxDivider,
  SubToolboxDrawer,
  SubToolboxFieldLabel,
  SubToolboxFileTarget,
  SubToolboxIconButton,
  SubToolboxInput,
  SubToolboxKnob,
  SubToolboxLinkButton,
  SubToolboxLoader,
  SubToolboxMediaCard,
  SubToolboxMenu,
  SubToolboxMeter,
  SubToolboxMetric,
  SubToolboxMetricStrip,
  SubToolboxCalendar,
  SubToolboxHoverCard,
  SubToolboxOutputCard,
  SubToolboxPagination,
  SubToolboxPopover,
  SubToolboxProgressBar,
  SubToolboxProgressValue,
  SubToolboxRadioControl,
  SubToolboxRangeSlider,
  SubToolboxRemovableTag,
  SubToolboxReorderRow,
  SubToolboxSegmentedToggle,
  SubToolboxScrollbar,
  SubToolboxSelectableListRow,
  SubToolboxSelectableTag,
  SubToolboxSkeleton,
  SubToolboxSettingsSwitch,
  SubToolboxSlider,
  SubToolboxControllerSwitch,
  SubToolboxSplitField,
  SubToolboxStatePanel,
  SubToolboxStatCard,
  SubToolboxStatusBadge,
  SubToolboxStepIndicator,
  SubToolboxIconRailControl,
  SubToolboxLed,
  SubToolboxNameValueList,
  SubToolboxStepper,
  SubToolboxSurface,
  SubToolboxTabs,
  SubToolboxTag,
  SubToolboxTagEditor,
  SubToolboxTextArea,
  SubToolboxToast,
  SubToolboxToggleSwitch,
  SubToolboxTooltip,
  SubToolboxTree,
  SubToolboxVaultAsset,
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
  "Knob Dial",
  "Alphabetical Spectrum Tags",
  "Field Label",
  "Surface",
  "State Panel",
  "Output Card",
  "Metric",
  "Link Button",
  "Data Table",
  "Color Picker",
  "Media Card",
  "Selectable List Row",
  "Reorderable Row",
  "Tabs",
  "Alert",
  "Step Indicator",
  "Dialog",
  "Drawer",
  "Calendar",
  "Loader",
  "Skeleton",
  "Toast",
  "Popover",
  "Disclosure",
  "Divider",
  "Pagination",
  "Controller Switch",
  "LED Light",
  "Icon Rail Control",
  "Hover Card",
  "Meter",
  "Avatar",
  "Name Value List",
  "Breadcrumb",
  "Carousel",
  "Command Palette",
  "Metric Strip",
  "Horizontal Scrollbar",
  "Vertical Scrollbar",
  "Data Stats Module",
  "Upload Frame",
  "Vault Landscape Asset",
  "Vault Portrait Asset",
  "Vault Audio Asset",
  "Vault Document Asset",
  "Tree View",
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
  const [knobValue, setKnobValue] = React.useState(72)
  const [colorValue, setColorValue] = React.useState("#36E0F6")
  const [mediaSelected, setMediaSelected] = React.useState(true)
  const [rowSelected, setRowSelected] = React.useState(false)
  const [tabValue, setTabValue] = React.useState("A")
  const [reorderItems, setReorderItems] = React.useState(["HOOK", "PROOF", "CTA"])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedDay, setSelectedDay] = React.useState(19)
  const [toastVisible, setToastVisible] = React.useState(true)
  const [page, setPage] = React.useState(2)
  const [controllerOn, setControllerOn] = React.useState(true)
  const [carouselIndex, setCarouselIndex] = React.useState(0)
  const [scrollPos, setScrollPos] = React.useState(30)
  const [vaultSelected, setVaultSelected] = React.useState(true)

  // Primitive track rule: only production primitives + shared CSS render here.
  // Unmigrated hardcoded families remain exclusively in the frozen baseline.
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
    return <SubToolboxTooltip level={level} content="TOOLTIP" style={style} />
  }
  if (name === "Knob Dial") {
    return <SubToolboxKnob level={level} style={style} value={knobValue} onValueChange={setKnobValue} label="VALUE" />
  }
  if (name === "Alphabetical Spectrum Tags") {
    return <SubToolboxAlphabeticalSpectrumTags level={level} />
  }
  if (name === "Field Label") {
    return <SubToolboxFieldLabel level={level} style={style}>VIDEO TITLE</SubToolboxFieldLabel>
  }
  if (name === "Surface") {
    return <SubToolboxSurface level={level} style={style} tone="accent"><strong>SURFACE</strong></SubToolboxSurface>
  }
  if (name === "State Panel") {
    return <SubToolboxStatePanel level={level} style={style} state="ready" message="Ready to generate." />
  }
  if (name === "Output Card") {
    return <SubToolboxOutputCard level={level} style={style} title="DESCRIPTION" accentColor={colors.a} badge="READY">Reusable generated output.</SubToolboxOutputCard>
  }
  if (name === "Metric") {
    return <SubToolboxMetric level={level} style={style} label="VIEWS" value="12.4K" accentColor={colors.a} />
  }
  if (name === "Link Button") {
    return <SubToolboxLinkButton level={level} style={style} href="#toolbox-ui-library-primitive" icon={<ChevronRight />}>OPEN</SubToolboxLinkButton>
  }
  if (name === "Data Table") {
    const rows = [{ metric: "Views", value: "12.4K" }, { metric: "CTR", value: "5.8%" }]
    return <SubToolboxDataTable level={level} style={style} columns={[{ key: "metric", label: "METRIC" }, { key: "value", label: "VALUE", align: "right" }]} rows={rows} />
  }
  if (name === "Color Picker") {
    return <SubToolboxColorPicker level={level} style={style} value={colorValue} onValueChange={setColorValue} label="ACCENT" />
  }
  if (name === "Media Card") {
    return <SubToolboxMediaCard level={level} style={style} title="AUSTERLITZ" meta="16:9 · READY" preview={<div style={{ width: "100%", height: "100%", background: colors.a }} />} selected={mediaSelected} onClick={() => setMediaSelected((value) => !value)} />
  }
  if (name === "Selectable List Row") {
    return <SubToolboxSelectableListRow level={level} style={style} title="DRAFT 01" detail="UPDATED NOW" leading={<span>01</span>} trailing={<ChevronRight />} selected={rowSelected} onClick={() => setRowSelected((value) => !value)} />
  }
  if (name === "Reorderable Row") {
    const first = reorderItems[0] ?? "HOOK"
    return <SubToolboxReorderRow level={level} style={style} title={first} detail="SECTION 01" disableUp onMoveDown={() => setReorderItems((items) => items.length > 1 ? [items[1], items[0], ...items.slice(2)] : items)} onRemove={() => setReorderItems((items) => items.slice(1))} />
  }
  if (name === "Tabs") {
    return <SubToolboxTabs level={level} style={{ ...style, ["--vt-tab-count" as string]: 3 }} items={[{ value: "A", label: "EDIT" }, { value: "B", label: "PREVIEW" }, { value: "C", label: "DATA" }]} value={tabValue} onValueChange={setTabValue} />
  }
  if (name === "Alert") {
    return <SubToolboxAlert level={level} style={style} tone="success" icon={<Check />} title="READY" detail="Primitive connected" />
  }
  if (name === "Step Indicator") {
    return <SubToolboxStepIndicator level={level} style={{ ...style, ["--vt-step-count" as string]: 3 }} steps={[{ label: "SCRIPT", state: "complete" }, { label: "VISUALS", state: "active" }, { label: "EXPORT", state: "upcoming" }]} />
  }
  if (name === "Dialog") {
    return <SubToolboxDialog level={level} style={style} open={dialogOpen} onOpenChange={setDialogOpen} title="CONFIRM">Dialog content uses the same level DNA.</SubToolboxDialog>
  }
  if (name === "Drawer") {
    return <SubToolboxDrawer level={level} style={style} open={drawerOpen} onOpenChange={setDrawerOpen} title="DETAILS">Drawer content.</SubToolboxDrawer>
  }
  if (name === "Calendar") {
    return <SubToolboxCalendar level={level} style={style} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
  }
  if (name === "Loader") {
    return <SubToolboxLoader level={level} style={style} variant="spinner" label="LOADING" />
  }
  if (name === "Skeleton") {
    return <SubToolboxSkeleton level={level} style={style} lines={3} />
  }
  if (name === "Toast") {
    return toastVisible
      ? <SubToolboxToast level={level} style={style} tone="success" title="SAVED" detail="Changes are ready." onDismiss={() => setToastVisible(false)} />
      : <SubToolboxButton level={level} style={style} onClick={() => setToastVisible(true)}>SHOW TOAST</SubToolboxButton>
  }
  if (name === "Popover") {
    return <SubToolboxPopover level={level} style={style} trigger="OPTIONS" title="OPTIONS"><strong>Popover content</strong></SubToolboxPopover>
  }
  if (name === "Disclosure") {
    return <SubToolboxDisclosure level={level} style={style} title="ADVANCED" icon={<Plus />}>Disclosure content.</SubToolboxDisclosure>
  }
  if (name === "Divider") {
    return <SubToolboxDivider level={level} style={style} />
  }
  if (name === "Pagination") {
    return <SubToolboxPagination level={level} style={style} page={page} pages={3} onPageChange={setPage} />
  }
  if (name === "Controller Switch") {
    return <SubToolboxControllerSwitch level={level} style={style} pressed={controllerOn} onClick={() => setControllerOn((value) => !value)} />
  }
  if (name === "LED Light") {
    return <SubToolboxLed level={level} style={style} active label="ACTIVE" />
  }
  if (name === "Icon Rail Control") {
    return <SubToolboxIconRailControl level={level} style={style} icon={<SlidersHorizontal />} label="CONTROL" />
  }
  if (name === "Hover Card") {
    return <SubToolboxHoverCard level={level} style={style} trigger="HOVER" content={<><strong>DETAILS</strong><div>Reusable hover information.</div></>} />
  }
  if (name === "Meter") {
    return <SubToolboxMeter level={level} style={style} value={73} label="QUALITY" />
  }
  if (name === "Avatar") {
    return <SubToolboxAvatar level={level} style={style} name="VIEW TUBE" meta="CREATOR" />
  }
  if (name === "Name Value List") {
    return <SubToolboxNameValueList level={level} style={style} items={[{ name: "Views", value: "12.4K" }, { name: "CTR", value: "5.8%" }]} />
  }
  if (name === "Breadcrumb") {
    return <SubToolboxBreadcrumb level={level} style={style} items={[{ label: "Studio" }, { label: "Video" }, { label: "Package" }]} />
  }
  if (name === "Carousel") {
    return <SubToolboxCarousel level={level} style={style} index={carouselIndex} onIndexChange={setCarouselIndex} items={["FRAME 01","FRAME 02","FRAME 03"].map((item) => <span key={item}>{item}</span>)} />
  }
  if (name === "Command Palette") {
    return <SubToolboxCommandPalette level={level} style={style} items={[{ id: "script", label: "SCRIPT ARCHITECT", keywords: "write outline" }, { id: "thumb", label: "THUMBNAIL STUDIO", keywords: "image packaging" }, { id: "publish", label: "VIDEO PUBLISHER", keywords: "upload metadata" }]} />
  }
  if (name === "Metric Strip") {
    return <SubToolboxMetricStrip level={level} style={style} items={[{ label: "VIEWS", value: "12K" }, { label: "CTR", value: "5.8%" }, { label: "AVP", value: "72%" }]} />
  }
  if (name === "Horizontal Scrollbar") {
    return <SubToolboxScrollbar level={level} style={style} orientation="horizontal" value={scrollPos} onValueChange={setScrollPos} />
  }
  if (name === "Vertical Scrollbar") {
    return <SubToolboxScrollbar level={level} style={style} orientation="vertical" value={scrollPos} onValueChange={setScrollPos} decrementIcon="↑" incrementIcon="↓" />
  }
  if (name === "Data Stats Module") {
    return <SubToolboxDataStats level={level} style={style} label="TOTAL VIEWS" value="128,442" delta="+12.4%" variant="standard" />
  }
  if (name === "Upload Frame") {
    return <SubToolboxFileTarget level={level} style={style} label="DROP OR CHOOSE FILE" icon={<Upload />} minHeight={level === "l0" ? 176 : level === "l1" ? 144 : 112} />
  }
  if (name.startsWith("Vault ")) {
    const kind = name.includes("Landscape") ? "landscape" : name.includes("Portrait") ? "portrait" : name.includes("Audio") ? "audio" : "document"
    const Icon = kind === "audio" ? Music : kind === "document" ? FileText : Image
    return <SubToolboxVaultAsset level={level} style={style} kind={kind} title={name.replace("Vault ","")} icon={<Icon />} tags="ASSET" notes="NOTES" selected={vaultSelected} onSelectedChange={setVaultSelected} removeIcon={<X />} />
  }
  if (name === "Tree View") {
    return <SubToolboxTree level={level} style={style} defaultOpenIds={["root"]} nodes={[{ id: "root", label: "PROJECT", children: [{ id: "script", label: "SCRIPT" }, { id: "assets", label: "ASSETS", children: [{ id: "thumb", label: "THUMBNAIL" }, { id: "audio", label: "AUDIO" }] }] }]} />
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
