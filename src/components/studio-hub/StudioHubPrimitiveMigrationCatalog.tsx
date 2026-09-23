import React from "react"
import { Check, ChevronDown, ChevronRight, FileText, Image, Lightbulb, Menu, Minus, MoreHorizontal, Music, Plus, Search, Settings2, SlidersHorizontal, Upload, X } from "lucide-react"
import { SubToolbox } from "../Toolbox"
import type { ToolboxControlLevel } from "../subtoolbox/tokens"
import {
  SubToolboxAlert,
  SubToolboxAspectRatioFrame,
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
  SubToolboxToolbar,
  SubToolboxTagEditor,
  SubToolboxTextArea,
  SubToolboxTopTitleDropdown,
  SubToolboxToast,
  SubToolboxToggleSwitch,
  SubToolboxTooltip,
  SubToolboxTree,
  SubToolboxVaultAsset,
  ToolboxHeaderCollapseButton,
  ToolboxHeaderHelpButton,
  ToolboxHeaderIconRail,
  ToolboxHeaderTitle,
  ToolboxHeaderToggle,
} from "../subtoolbox/SubToolboxPrimitives"
import { SubToolboxKpiCard, SubToolboxSplitButton, SubToolboxSplitDropdown } from "../subtoolbox/SubToolboxSplitPrimitives"
import "./studio-hub-primitive-migration-catalog.css"

type StudioHubComponentLevel = ToolboxControlLevel

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
  "Top Title Dropdown",
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
  "Disabled Button",
  "Disabled Split Button",
  "Two Color Data Stats",
  "Monochrome Data Stats",
  "Tiny Data Stats",
  "Tooltip Dark",
  "Tooltip Color",
  "Dashboard Pill Tags",
  "Aspect Ratio Frame",
  "Toolbar",
  "Toolbox Header Icon Rail",
  "SubToolbox Header Icon Rail",
  "Toolbox Header Title",
  "SubToolbox Header Title",
  "Toolbox Header Help",
  "SubToolbox Header Help",
  "Toolbox Header Collapse",
  "SubToolbox Header Collapse",
  "Toolbox Header Toggle",
  "SubToolbox Header Toggle",
] as const

const DemoShell: React.FC<{ level: StudioHubComponentLevel; children: React.ReactNode }> = ({ level, children }) => (
  <div className={`vt-catalog-demo is-${level}`} data-level={level}>{children}</div>
)

const PrimitiveMigrationControl: React.FC<{
  name: string
  level: StudioHubComponentLevel
}> = ({ name, level }) => {
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
  const [searchQuery, setSearchQuery] = React.useState("NAPOLEON")
  const [actionDraft, setActionDraft] = React.useState("NEW ITEM")
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
  const [headerMode, setHeaderMode] = React.useState("A")

  // Primitive track rule: only production primitives + shared CSS render here.
  // Unmigrated hardcoded families remain exclusively in the frozen baseline.
  if (name === "Primary Button" || name === "Secondary Button" || name === "Neutral Button" || name === "Destructive Button") {
    return <SubToolboxButton level={level}>{name.replace(" Button", "")}</SubToolboxButton>
  }
  if (name === "Square Icon Button") {
    return <SubToolboxIconButton level={level} icon={<Settings2 />} ariaLabel="Settings" />
  }
  if (name === "Text Input") {
    return <SubToolboxInput level={level} type="text" defaultValue="TEXT INPUT" />
  }
  if (name === "Textarea") {
    return <SubToolboxTextArea level={level} defaultValue="DESCRIPTION" />
  }
  if (name === "Stepper") {
    return <SubToolboxStepper level={level} value={stepperValue} decreaseIcon={<Minus />} increaseIcon={<Plus />} onDecrease={() => setStepperValue((value) => value - 1)} onIncrease={() => setStepperValue((value) => value + 1)} />
  }
  if (name === "Toggle") {
    return <SubToolboxToggleSwitch level={level} pressed={toggleOn} aria-label="Toggle" onClick={() => setToggleOn((value) => !value)} />
  }
  if (name === "Checkbox") {
    return <SubToolboxCheckControl level={level} checked={checkboxOn} aria-label="Checkbox" onClick={() => setCheckboxOn((value) => !value)} />
  }
  if (name === "Radio") {
    return <SubToolboxRadioControl level={level} checked={radioOn} aria-label="Radio" onClick={() => setRadioOn((value) => !value)} />
  }
  if (name === "Segmented Choice") {
    return <SubToolboxSegmentedToggle level={level} style={{ ["--vt-segment-count" as string]: 3 } as React.CSSProperties} options={[{ value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} value={segmentChoice} onValueChange={setSegmentChoice} />
  }
  if (name === "Tag") {
    return <SubToolboxTag level={level}>NAPOLEON</SubToolboxTag>
  }
  if (name === "Badge") {
    return <SubToolboxBadge level={level}>BADGE</SubToolboxBadge>
  }
  if (name === "Status Badge") {
    return <SubToolboxStatusBadge level={level}>READY</SubToolboxStatusBadge>
  }
  if (name === "Split Left Button" || name === "Head Tail Action") {
    return <SubToolboxSplitButton level={level} icon={name === "Head Tail Action" ? <ChevronRight /> : <Settings2 />}>{name === "Head Tail Action" ? "Action" : "Settings"}</SubToolboxSplitButton>
  }
  if (name === "Split Menu") {
    return <SubToolboxSplitDropdown
      level={level}
      value={menuChoice}
      options={[
        { value: "OPTION 1", label: "OPTION 1", icon: <Menu /> },
        { value: "OPTION 2", label: "OPTION 2", icon: <Settings2 /> },
        { value: "OPTION 3", label: "OPTION 3", icon: <SlidersHorizontal /> },
      ]}
      onChange={setMenuChoice}
      icon={<Menu />}
      chevron={<ChevronDown />}
      ariaLabel="Split menu"
    />
  }
  if (name === "Dropdown" || name === "Select Menu" || name === "Context Menu") {
    return <SubToolboxMenu level={level} variant={name === "Context Menu" ? "context" : name === "Select Menu" ? "select" : "dropdown"} value={menuChoice} options={["OPTION 1","OPTION 2","OPTION 3"].map((option) => ({ value: option, label: option }))} onValueChange={setMenuChoice} triggerLabel={name === "Dropdown" ? "MENU" : menuChoice} triggerIcon={<MoreHorizontal />} chevronIcon={<ChevronDown />} ariaLabel={name} />
  }
  if (name === "Top Title Dropdown") {
    return <SubToolboxTopTitleDropdown
      level={level}
      label="PRIVACY"
      value={menuChoice}
      options={["PUBLIC","UNLISTED","PRIVATE"].map((option) => ({ value: option, label: option }))}
      onValueChange={setMenuChoice}
      ariaLabel="Publishing control dropdown"
     
    />
  }
  if (name === "Split Search") {
    return <SubToolboxSplitField level={level} variant="search" icon={<Search />} actionIcon={<X />} actionLabel="Clear search" onAction={() => setSearchQuery("")} inputProps={{ "aria-label": "Search", placeholder: "SEARCH", value: searchQuery, onChange: (event) => setSearchQuery(event.target.value) }} />
  }
  if (name === "Number Field") {
    return <SubToolboxInput level={level} type="number" defaultValue="25" />
  }
  if (name === "Input Action") {
    return <SubToolboxSplitField level={level} variant="action" actionIcon={<Plus />} actionLabel="Add item" onAction={() => setActionDraft("")} inputProps={{ "aria-label": "Add item", placeholder: "ADD ITEM", value: actionDraft, onChange: (event) => setActionDraft(event.target.value) }} />
  }
  if (name === "Slider") {
    return <SubToolboxSlider level={level} value={sliderValue} onValueChange={setSliderValue} railIcon={<span>S</span>} onReset={() => setSliderValue(62)} />
  }
  if (name === "Range Slider") {
    return <SubToolboxRangeSlider level={level} low={rangeLow} high={rangeHigh} onLowChange={setRangeLow} onHighChange={setRangeHigh} railIcon={<SlidersHorizontal />} onReset={() => { setRangeLow(22); setRangeHigh(76) }} />
  }
  if (name === "Settings Switch") {
    return <SubToolboxSettingsSwitch level={level} pressed={settingsOn} aria-label="Settings switch" onClick={() => setSettingsOn((value) => !value)} />
  }
  if (name === "Button Group") {
    return <SubToolboxButtonGroup level={level} items={[{ value: "ONE", label: "ONE" }, { value: "TWO", label: "TWO" }]} value={groupChoice} onValueChange={setGroupChoice} />
  }
  if (name === "Removable Tag") {
    return <SubToolboxRemovableTag level={level} removeIcon={<X />}>NAPOLEON</SubToolboxRemovableTag>
  }
  if (name === "Selectable Tag") {
    return <SubToolboxSelectableTag level={level} selected={selectableTagOn} selectedIcon={<Check />} unselectedIcon={<Plus />} onClick={() => setSelectableTagOn((value) => !value)}>{selectableTagOn ? "SELECTED" : "SELECT"}</SubToolboxSelectableTag>
  }
  if (name === "Tag Editor") {
    return <SubToolboxTagEditor level={level} tags={editorTags} onTagsChange={setEditorTags} addIcon={<Plus />} saveIcon={<Check />} removeIcon={<X />} />
  }
  if (name === "Progress Bar") {
    return <SubToolboxProgressBar level={level} value={68} />
  }
  if (name === "Progress Value") {
    return <SubToolboxProgressValue level={level} value={68} label="SYNC" />
  }
  if (name === "KPI") {
    return <SubToolboxKpiCard level={level} label="VIEWS" value="12.4K" />
  }
  if (name === "Stat Card") {
    return <SubToolboxStatCard level={level} label="WATCH TIME" value="4,820H" delta="+12.4%" />
  }
  if (name === "Tooltip") {
    return <SubToolboxTooltip level={level} content="TOOLTIP" />
  }
  if (name === "Knob Dial") {
    return <SubToolboxKnob level={level} value={knobValue} onValueChange={setKnobValue} label="VALUE" />
  }
  if (name === "Alphabetical Spectrum Tags") {
    return <SubToolboxAlphabeticalSpectrumTags level={level} />
  }
  if (name === "Field Label") {
    return <SubToolboxFieldLabel level={level}>VIDEO TITLE</SubToolboxFieldLabel>
  }
  if (name === "Surface") {
    return <SubToolboxSurface level={level} tone="accent"><strong>SURFACE</strong></SubToolboxSurface>
  }
  if (name === "State Panel") {
    return <SubToolboxStatePanel level={level} state="ready" message="Ready to generate." />
  }
  if (name === "Output Card") {
    return <SubToolboxOutputCard level={level} title="DESCRIPTION" badge="READY">Reusable generated output.</SubToolboxOutputCard>
  }
  if (name === "Metric") {
    return <SubToolboxMetric level={level} label="VIEWS" value="12.4K" />
  }
  if (name === "Link Button") {
    return <SubToolboxLinkButton level={level} href="#toolbox-ui-library-primitive" icon={<ChevronRight />}>OPEN</SubToolboxLinkButton>
  }
  if (name === "Data Table") {
    const rows = [{ metric: "Views", value: "12.4K" }, { metric: "CTR", value: "5.8%" }]
    return <SubToolboxDataTable level={level} columns={[{ key: "metric", label: "METRIC" }, { key: "value", label: "VALUE", align: "right" }]} rows={rows} />
  }
  if (name === "Color Picker") {
    return <SubToolboxColorPicker level={level} value={colorValue} onValueChange={setColorValue} label="ACCENT" />
  }
  if (name === "Media Card") {
    return <SubToolboxMediaCard level={level} title="AUSTERLITZ" meta="16:9 · READY" preview={<div style={{ width: "100%", height: "100%", background: "var(--pair-a)" }} />} selected={mediaSelected} onClick={() => setMediaSelected((value) => !value)} />
  }
  if (name === "Selectable List Row") {
    return <SubToolboxSelectableListRow level={level} title="DRAFT 01" detail="UPDATED NOW" leading={<span>01</span>} trailing={<ChevronRight />} selected={rowSelected} onClick={() => setRowSelected((value) => !value)} />
  }
  if (name === "Reorderable Row") {
    const first = reorderItems[0] ?? "HOOK"
    return <SubToolboxReorderRow level={level} title={first} detail="SECTION 01" disableUp onMoveDown={() => setReorderItems((items) => items.length > 1 ? [items[1], items[0], ...items.slice(2)] : items)} onRemove={() => setReorderItems((items) => items.slice(1))} />
  }
  if (name === "Tabs") {
    return <SubToolboxTabs level={level} style={{ ["--vt-tab-count" as string]: 3 } as React.CSSProperties} items={[{ value: "A", label: "EDIT" }, { value: "B", label: "PREVIEW" }, { value: "C", label: "DATA" }]} value={tabValue} onValueChange={setTabValue} />
  }
  if (name === "Alert") {
    return <SubToolboxAlert level={level} tone="success" icon={<Check />} title="READY" detail="Primitive connected" />
  }
  if (name === "Step Indicator") {
    return <SubToolboxStepIndicator level={level} style={{ ["--vt-step-count" as string]: 3 } as React.CSSProperties} steps={[{ label: "SCRIPT", state: "complete" }, { label: "VISUALS", state: "active" }, { label: "EXPORT", state: "upcoming" }]} />
  }
  if (name === "Dialog") {
    return <SubToolboxDialog level={level} open={dialogOpen} onOpenChange={setDialogOpen} title="CONFIRM">Dialog content uses the same level DNA.</SubToolboxDialog>
  }
  if (name === "Drawer") {
    return <SubToolboxDrawer level={level} open={drawerOpen} onOpenChange={setDrawerOpen} title="DETAILS">Drawer content.</SubToolboxDrawer>
  }
  if (name === "Calendar") {
    return <SubToolboxCalendar level={level} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
  }
  if (name === "Loader") {
    return <SubToolboxLoader level={level} variant="spinner" label="LOADING" />
  }
  if (name === "Skeleton") {
    return <SubToolboxSkeleton level={level} lines={3} />
  }
  if (name === "Toast") {
    return toastVisible
      ? <SubToolboxToast level={level} tone="success" title="SAVED" detail="Changes are ready." onDismiss={() => setToastVisible(false)} />
      : <SubToolboxButton level={level} onClick={() => setToastVisible(true)}>SHOW TOAST</SubToolboxButton>
  }
  if (name === "Popover") {
    return <SubToolboxPopover level={level} trigger="OPTIONS" title="OPTIONS"><strong>Popover content</strong></SubToolboxPopover>
  }
  if (name === "Disclosure") {
    return <SubToolboxDisclosure level={level} title="ADVANCED" icon={<Plus />}>Disclosure content.</SubToolboxDisclosure>
  }
  if (name === "Divider") {
    return <SubToolboxDivider level={level} />
  }
  if (name === "Pagination") {
    return <SubToolboxPagination level={level} page={page} pages={3} onPageChange={setPage} />
  }
  if (name === "Controller Switch") {
    return <SubToolboxControllerSwitch level={level} pressed={controllerOn} onClick={() => setControllerOn((value) => !value)} />
  }
  if (name === "LED Light") {
    return <SubToolboxLed level={level} active label="ACTIVE" />
  }
  if (name === "Icon Rail Control") {
    return <SubToolboxIconRailControl level={level} icon={<SlidersHorizontal />} label="CONTROL" />
  }
  if (name === "Hover Card") {
    return <SubToolboxHoverCard level={level} trigger="HOVER" content={<><strong>DETAILS</strong><div>Reusable hover information.</div></>} />
  }
  if (name === "Meter") {
    return <SubToolboxMeter level={level} value={73} label="QUALITY" />
  }
  if (name === "Avatar") {
    return <SubToolboxAvatar level={level} name="VIEW TUBE" meta="CREATOR" />
  }
  if (name === "Name Value List") {
    return <SubToolboxNameValueList level={level} items={[{ name: "Views", value: "12.4K" }, { name: "CTR", value: "5.8%" }]} />
  }
  if (name === "Breadcrumb") {
    return <SubToolboxBreadcrumb level={level} items={[{ label: "Studio" }, { label: "Video" }, { label: "Package" }]} />
  }
  if (name === "Carousel") {
    return <SubToolboxCarousel level={level} index={carouselIndex} onIndexChange={setCarouselIndex} items={["FRAME 01","FRAME 02","FRAME 03"].map((item) => <span key={item}>{item}</span>)} />
  }
  if (name === "Command Palette") {
    return <SubToolboxCommandPalette level={level} items={[{ id: "script", label: "SCRIPT ARCHITECT", keywords: "write outline" }, { id: "thumb", label: "THUMBNAIL STUDIO", keywords: "image packaging" }, { id: "publish", label: "VIDEO PUBLISHER", keywords: "upload metadata" }]} />
  }


  if (name === "Metric Strip") {
    return <SubToolboxMetricStrip level={level} items={[{ label: "VIEWS", value: "12K" }, { label: "CTR", value: "5.8%" }, { label: "AVP", value: "72%" }]} />
  }
  if (name === "Horizontal Scrollbar") {
    return <SubToolboxScrollbar level={level} orientation="horizontal" value={scrollPos} onValueChange={setScrollPos} />
  }
  if (name === "Vertical Scrollbar") {
    return <SubToolboxScrollbar level={level} orientation="vertical" value={scrollPos} onValueChange={setScrollPos} decrementIcon="↑" incrementIcon="↓" />
  }
  if (name === "Data Stats Module") {
    return <SubToolboxDataStats level={level} label="TOTAL VIEWS" value="128,442" delta="+12.4%" variant="standard" />
  }
  if (name === "Upload Frame") {
    return <SubToolboxFileTarget level={level} label="DROP OR CHOOSE FILE" icon={<Upload />} minHeight={level === "l0" ? 176 : level === "l1" ? 144 : 112} />
  }
  if (name.startsWith("Vault ")) {
    const kind = name.includes("Landscape") ? "landscape" : name.includes("Portrait") ? "portrait" : name.includes("Audio") ? "audio" : "document"
    const Icon = kind === "audio" ? Music : kind === "document" ? FileText : Image
    return <SubToolboxVaultAsset level={level} kind={kind} title={name.replace("Vault ","")} icon={<Icon />} tags="ASSET" notes="NOTES" selected={vaultSelected} onSelectedChange={setVaultSelected} removeIcon={<X />} />
  }
  if (name === "Tree View") {
    return <SubToolboxTree level={level} defaultOpenIds={["root"]} nodes={[{ id: "root", label: "PROJECT", children: [{ id: "script", label: "SCRIPT" }, { id: "assets", label: "ASSETS", children: [{ id: "thumb", label: "THUMBNAIL" }, { id: "audio", label: "AUDIO" }] }] }]} />
  }
  if (name === "Disabled Button") {
    return <SubToolboxButton level={level} disabled>DISABLED</SubToolboxButton>
  }
  if (name === "Disabled Split Button") {
    return <SubToolboxSplitButton level={level} icon={<Settings2 />} disabled>DISABLED</SubToolboxSplitButton>
  }
  if (name === "Two Color Data Stats") {
    return <SubToolboxDataStats level={level} label="VIEWS" value="128K" delta="+12%" variant="two-color" />
  }
  if (name === "Monochrome Data Stats") {
    return <SubToolboxDataStats level={level} label="WATCH TIME" value="4.8K" delta="+8%" variant="monochrome" />
  }
  if (name === "Tiny Data Stats") {
    return <SubToolboxDataStats level={level} label="CTR" value="5.8%" variant="tiny" />
  }
  if (name === "Tooltip Dark") {
    return <SubToolboxTooltip level={level} variant="dark" content="TOOLTIP" />
  }
  if (name === "Tooltip Color") {
    return <SubToolboxTooltip level={level} variant="color" content="TOOLTIP" />
  }
  if (name === "Dashboard Pill Tags") {
    return <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}><SubToolboxTag level={level} variant="dashboard-pill">READY</SubToolboxTag><SubToolboxTag level={level} variant="dashboard-pill">VIDEO</SubToolboxTag></div>
  }
  if (name === "Aspect Ratio Frame") {
    return <SubToolboxAspectRatioFrame level={level} ratio="16:9" label="16:9"><Image /></SubToolboxAspectRatioFrame>
  }
  if (name === "Toolbar") {
    return <SubToolboxToolbar level={level} leading={<strong>TOOLS</strong>} trailing={<SubToolboxIconButton level={level} icon={<Settings2 />} ariaLabel="Toolbar settings" />}><SubToolboxButton level={level}>EDIT</SubToolboxButton><SubToolboxButton level={level}>SAVE</SubToolboxButton></SubToolboxToolbar>
  }
  if (name === "Toolbox Header Icon Rail") {
    return <div style={{ height: 80, display: "flex" }}><ToolboxHeaderIconRail level="toolbox" backgroundColor="var(--pair-b)"><Settings2 /></ToolboxHeaderIconRail></div>
  }
  if (name === "SubToolbox Header Icon Rail") {
    return <div style={{ height: 56, display: "flex" }}><ToolboxHeaderIconRail level="subtoolbox" backgroundColor="var(--pair-b)"><Settings2 /></ToolboxHeaderIconRail></div>
  }
  if (name === "Toolbox Header Title") {
    return <ToolboxHeaderTitle level="toolbox">VIDEO MANAGER</ToolboxHeaderTitle>
  }
  if (name === "SubToolbox Header Title") {
    return <ToolboxHeaderTitle level="subtoolbox">VIDEO DETAILS</ToolboxHeaderTitle>
  }
  if (name === "Toolbox Header Help") {
    return <div style={{ height: 80 }}><ToolboxHeaderHelpButton level="toolbox" aria-label="Toolbox help" /></div>
  }
  if (name === "SubToolbox Header Help") {
    return <div style={{ height: 56 }}><ToolboxHeaderHelpButton level="subtoolbox" aria-label="Subtoolbox help" /></div>
  }
  if (name === "Toolbox Header Collapse") {
    return <div style={{ height: 80 }}><ToolboxHeaderCollapseButton level="toolbox" open icon={<X />} aria-label="Collapse toolbox" /></div>
  }
  if (name === "SubToolbox Header Collapse") {
    return <div style={{ height: 56 }}><ToolboxHeaderCollapseButton level="subtoolbox" open icon={<X />} aria-label="Collapse subtoolbox" /></div>
  }
  if (name === "Toolbox Header Toggle") {
    return <ToolboxHeaderToggle value={headerMode} onValueChange={setHeaderMode} options={[{ value: "A", label: "ON" }, { value: "B", label: "OFF" }]} />
  }
  if (name === "SubToolbox Header Toggle") {
    return <ToolboxHeaderToggle level="subtoolbox" value={headerMode} onValueChange={setHeaderMode} options={[{ value: "A", label: "A" }, { value: "B", label: "B" }]} />
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
    className="vt-primitive-migration-catalog"
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
        <div
          className="vt-primitive-migration-family"
          key={name}
          data-vt-family={name}
          data-vt-migration-state="primitive"
        >
          <SubToolbox
            title={`${String(index + 1).padStart(2, "0")} ${name}`}
            icon={<Settings2 />}
            paletteIndex={paletteIndex + index}
            collapsible
            isOpenInitial
            overflowVisible
            contentClassName="p-3"
          >
            <div className="vt-catalog-levels">
              {LEVELS.map((level) => (
                <DemoShell level={level} key={level}>
                  <PrimitiveMigrationControl name={name} level={level} />
                </DemoShell>
              ))}
            </div>
          </SubToolbox>
        </div>
      ))}
    </div>
  </section>
)

export default StudioHubPrimitiveMigrationCatalog
