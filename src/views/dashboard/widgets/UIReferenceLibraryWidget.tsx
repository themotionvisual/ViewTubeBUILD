import React, { useMemo, useState } from "react"
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BadgeCheck,
  Brain,
  Bookmark,
  Check,
  Circle,
  Flag,
  Flame,
  Gem,
  Heart,
  ImagePlus,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UploadCloud,
  Zap,
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
  WidgetCheckbox,
  WidgetIconBadge,
  WidgetIconButton,
  WidgetLeftSplitBadge,
  WidgetToast,
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
  WidgetSplitCounter,
  WidgetTextInput,
  WidgetToggleSwitch,
  WidgetTinySpectrumIcon,
  WIDGET_TINY_ICON_SET,
  WIDGET_METRIC_ICON_SET,
  WidgetAccentRailModule,
  WidgetIconTitleModule,
  WidgetRainbowPanel,
  WidgetRainbowDivider,
  WidgetModuleHeader,
  WidgetModuleFrame,
  WidgetVideoSelect,
  type WidgetControlHeight,
  type WidgetPrimitiveTone,
  type WidgetSplitIconStyle,
  WIDGET_BADGE_SPECTRUM,
  type WidgetBadgeSpectrumName,
} from "../WidgetPrimitives"
import { getDashboardWidgetPaletteColors } from "../../../styles/toolboxPalette"

type ReferenceCategory =
  | "controls"
  | "size"
  | "video"
  | "progress"
  | "tags"
  | "media"
  | "navigation"
  | "matrix"
  | "states"
  | "alerts"

const REFERENCE_CATEGORIES: ReadonlyArray<{ id: ReferenceCategory; label: string }> = [
  { id: "controls", label: "CONTROLS" },
  { id: "size", label: "SIZE" },
  { id: "matrix", label: "MATRIX" },
  { id: "video", label: "VIDEO" },
  { id: "progress", label: "BARS" },
  { id: "tags", label: "TAGS" },
  { id: "media", label: "MEDIA" },
  { id: "navigation", label: "NAV" },
  { id: "states", label: "STATES" },
  { id: "alerts", label: "ALERTS" },
]

const CONTROL_HEIGHTS: WidgetControlHeight[] = [18, 24, 32, 38]

/** One toast per semantic status, so the catalogue shows every glyph. */
const TOAST_SAMPLES: { status: "positive" | "warning" | "danger" | "neutral"; title: string; detail: string }[] = [
  { status: "positive", title: "Video published", detail: "Live on the channel a moment ago" },
  { status: "warning", title: "Deadline in 2 hours", detail: "Scheduled upload has no thumbnail yet" },
  { status: "danger", title: "Auth scope missing", detail: "Reconnect the channel to publish" },
  { status: "neutral", title: "Brain flagged 3 clusters", detail: "Open the sentiment map to reply" },
]

/** The twelve spectrum slots, each with a distinct glyph. */
const SPLIT_BADGE_SAMPLES: { spectrum: WidgetBadgeSpectrumName; label: string; icon: React.ReactNode }[] = [
  { spectrum: "rose", label: "Live", icon: <Circle strokeWidth={2.5} /> },
  { spectrum: "coral", label: "Flagged", icon: <Flag strokeWidth={2.5} /> },
  { spectrum: "orange", label: "1st place", icon: <Gem strokeWidth={2.5} /> },
  { spectrum: "yellow", label: "Hot", icon: <Flame strokeWidth={2.5} /> },
  { spectrum: "lime", label: "+184%", icon: <TrendingUp strokeWidth={2.5} /> },
  { spectrum: "green", label: "Verified", icon: <BadgeCheck strokeWidth={2.5} /> },
  { spectrum: "teal", label: "On target", icon: <Target strokeWidth={2.5} /> },
  { spectrum: "cyan", label: "Award", icon: <Award strokeWidth={2.5} /> },
  { spectrum: "royal", label: "Saved", icon: <Bookmark strokeWidth={2.5} /> },
  { spectrum: "purple", label: "Loved", icon: <Heart strokeWidth={2.5} /> },
  { spectrum: "magenta", label: "Featured", icon: <Star strokeWidth={2.5} /> },
  { spectrum: "pink", label: "Notified", icon: <Bell strokeWidth={2.5} /> },
]
const CONTROL_TONES: WidgetPrimitiveTone[] = ["default", "primary", "secondary"]
const REFERENCE_PALETTE_NAMES = [
  "ROSE", "CORAL", "ORANGE", "YELLOW", "LIME", "GREEN",
  "TEAL", "CYAN", "ROYAL", "PURPLE", "MAGENTA", "PINK",
] as const
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

const VIDEO_OPTIONS = [
  {
    value: "v1",
    label: "Napoleon's Last Great Victory",
    meta: "12:42 · 48,230 views",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
  {
    value: "v2",
    label: "Austerlitz: The Battle Explained",
    meta: "30:04 · 73,910 views",
    thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
  },
  {
    value: "v3",
    label: "The Emperor's Men",
    meta: "08:18 · 31,845 views",
    thumbnail: "https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg",
  },
]

/* Hoisted out of the component: both read only module constants, so defining
   them during render remounted every variant on each parent render. */
const SizeVariants = ({
  children,
  square = false,
}: {
  children: (height: WidgetControlHeight) => React.ReactNode
  square?: boolean
}) => (
  <div className={square ? "widget-reference-square-variants" : "widget-reference-variants"}>
    {CONTROL_HEIGHTS.map((height) => (
      <div className="widget-reference-variant" key={height}>
        <small>{height}px</small>
        {children(height)}
      </div>
    ))}
  </div>
)

const ToneRows = ({
  render,
  square = false,
}: {
  render: (tone: WidgetPrimitiveTone, height: WidgetControlHeight) => React.ReactNode
  square?: boolean
}) => (
  <div className="grid gap-2">
    {CONTROL_TONES.map((tone) => (
      <div key={tone} className="grid gap-1">
        <small className="text-[8px] font-black uppercase tracking-wider opacity-55">{tone}</small>
        <SizeVariants square={square}>{(height) => render(tone, height)}</SizeVariants>
      </div>
    ))}
  </div>
)

type UIReferenceLibraryWidgetProps = Omit<React.ComponentProps<typeof WidgetShell>, "children" | "headerContent" | "icon">

export default function UIReferenceLibraryWidget({ widget, ...common }: UIReferenceLibraryWidgetProps) {
  const [activeCategory, setActiveCategory] = useState<ReferenceCategory>("controls")
  const [paletteIndex, setPaletteIndex] = useState(7)
  const [selectValue, setSelectValue] = useState("public")
  const [selectedVideo, setSelectedVideo] = useState("v1")
  const [headerToggleValue, setHeaderToggleValue] = useState("draft-1")
  const [stepperValue, setStepperValue] = useState("Step 1 of 4")
  const [stepTabValue, setStepTabValue] = useState("meta")
  const [moduleWindow, setModuleWindow] = useState("28 DAYS")
  const [commentHeaderTab, setCommentHeaderTab] = useState<"unreplied" | "history">("unreplied")
  const [commentHeaderPage, setCommentHeaderPage] = useState(1)
  const [switchValue, setSwitchValue] = useState(true)
  const [checkboxValue, setCheckboxValue] = useState(true)
  const [radioValue, setRadioValue] = useState("b")
  const [textValue, setTextValue] = useState("")
  const [tags, setTags] = useState(["viewtube", "analytics", "creator"])
  const [hasThumbnail, setHasThumbnail] = useState(false)
  const [statePanelStatus, setStatePanelStatus] = useState<"loading" | "ready" | "empty" | "blocked" | "stale" | "error">("ready")
  const [matrixStepper, setMatrixStepper] = useState(10)
  const [matrixPage, setMatrixPage] = useState(2)
  const [matrixToggle, setMatrixToggle] = useState(true)
  const [matrixRadio, setMatrixRadio] = useState<WidgetPrimitiveTone>("primary")
  const [matrixCheck, setMatrixCheck] = useState(true)
  const [matrixSearch, setMatrixSearch] = useState("")
  const [sizeGridMode, setSizeGridMode] = useState(false)
  const previewWidget = useMemo(
    () => ({ ...widget, ...getDashboardWidgetPaletteColors(paletteIndex) }),
    [paletteIndex, widget],
  )

  const activeCategoryIndex = REFERENCE_CATEGORIES.findIndex((entry) => entry.id === activeCategory)
  const stepReferenceCategory = (direction: -1 | 1) => {
    const nextIndex = (activeCategoryIndex + direction + REFERENCE_CATEGORIES.length) % REFERENCE_CATEGORIES.length
    setActiveCategory(REFERENCE_CATEGORIES[nextIndex].id)
  }

  const headerContent = (
    <div className="widget-reference-header-controls">
      <WidgetHeaderStepper
        label="Reference section"
        value={REFERENCE_CATEGORIES[activeCategoryIndex]?.label ?? "CONTROLS"}
        onPrevious={() => stepReferenceCategory(-1)}
        onNext={() => stepReferenceCategory(1)}
      />
      <WidgetHeaderStepper
        label="Widget color palette"
        value={`${REFERENCE_PALETTE_NAMES[paletteIndex]} ${paletteIndex + 1}/12`}
        onPrevious={() => setPaletteIndex((current) => (current + 11) % 12)}
        onNext={() => setPaletteIndex((current) => (current + 1) % 12)}
      />
    </div>
  )

  const sectionHeading = (title: string, detail: string) => (
    <header
      className="flex items-center justify-between gap-2 border-b pb-2"
      style={{ borderColor: "color-mix(in srgb, var(--widget-color) 30%, transparent)" }}
    >
      <strong className="text-xs font-black uppercase tracking-wider">{title}</strong>
      <span className="text-[9px] font-black uppercase opacity-55">{detail}</span>
    </header>
  )

  const familyHeading = (title: string, detail: string) => (
    <div className="widget-reference-family-title">
      <span>{title}</span>
      <small>{detail}</small>
    </div>
  )

  const splitFamily = (iconStyle: WidgetSplitIconStyle, title: string, detail: string) => (
    <div className="widget-reference-family">
      {familyHeading(title, detail)}
      <ToneRows
        render={(tone, height) => (
          <WidgetLeftSplitButton
            height={height}
            tone={tone}
            iconStyle={iconStyle}
            icon={<Sparkles />}
            width="full"
          >
            Split Left
          </WidgetLeftSplitButton>
        )}
      />
    </div>
  )

  return (
    <WidgetShell widget={previewWidget} headerContent={headerContent} icon={<Layers size={22} />} {...common}>
      <WidgetScrollArea
        ariaLabel="ViewTube Widget Component Reference Library"
        contentClassName="flex min-h-full flex-col gap-3 p-3"
      >
        {activeCategory === "controls" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("1. Standard Controls", "Default / Primary / Secondary")}
            <p className="text-[10px] font-bold uppercase opacity-60">
              Every component family uses the same three monochromatic color styles at 18 / 24 / 32 / 38px. Canonical type scale: 18px → 8px, 24px → 16px, 32px → 21px, 38px → 26px, all at weight 1000. 18px controls stay filled, borderless and shadowless; larger controls use a 2px stroke.
            </p>

            <div className="widget-reference-family">
              {familyHeading("Buttons", "3 tones × 4 heights")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetSizedButton height={height} tone={tone}>
                    {tone === "default" ? "Button" : tone}
                  </WidgetSizedButton>
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Adaptive 24px Text Fit", "16px → 10px · preserves row geometry")}
              <div className="widget-reference-adaptive-grid">
                {["Educational", "Community", "Cyberpunk", "Vintage"].map((label) => (
                  <WidgetSizedButton key={label} height={24} tone="default" textFit="adaptive">
                    {label}
                  </WidgetSizedButton>
                ))}
              </div>
            </div>

            {splitFamily("white-on-color", "Split Left Buttons", "White icon / colored bay")}
            {splitFamily("color-on-light", "Split Left Buttons", "Colored icon / light bay")}

            <div className="widget-reference-family">
              {familyHeading("Text Inputs", "Community Post focus + 3 tones")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetTextInput
                    height={height}
                    tone={tone}
                    value={textValue}
                    placeholder="Sample title input"
                    onChange={(event) => setTextValue(event.currentTarget.value)}
                    aria-label={`${tone} ${height}px text input`}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Dropdown Menus", "Radix select + 3 tones")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetSizedSelect
                    height={height}
                    tone={tone}
                    value={selectValue}
                    onChange={setSelectValue}
                    label={`${tone} ${height}px dropdown`}
                    options={[
                      { value: "public", label: "PUBLIC" },
                      { value: "unlisted", label: "UNLISTED" },
                      { value: "private", label: "PRIVATE" },
                    ]}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Legacy / Utility Actions", "Existing primitives")}
              <div className="flex flex-wrap gap-2">
                <WidgetActionButton tone="neutral">Action Neutral</WidgetActionButton>
                <WidgetActionButton tone="primary">Action Primary</WidgetActionButton>
                <WidgetActionButton tone="danger">Action Danger</WidgetActionButton>
                <WidgetSplitButton tone="primary" icon={<Save size={14} />}>Legacy Split</WidgetSplitButton>
                <WidgetTooltip content="Reset control example">
                  <button type="button" className="vt-button is-icon-only" aria-label="Reset"><RotateCcw size={14} /></button>
                </WidgetTooltip>
              </div>
            </div>
          </WidgetSection>
        )}

        {activeCategory === "size" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("Size × Color Matrix", "18 → 24 → 32 → 38 · default / primary / secondary")}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 max-w-[56ch] text-[10px] font-bold uppercase opacity-60">
                Flow mode keeps every component only as wide as its own content. Grid mode equalizes component widths and fixes every row to three columns.
              </p>
              <WidgetToggleSwitch
                height={24}
                tone={sizeGridMode ? "primary" : "default"}
                checked={sizeGridMode}
                onChange={setSizeGridMode}
                label="Equal-width grid mode"
              />
            </div>
            <div className="widget-reference-size-matrix">
              {CONTROL_HEIGHTS.map((height) => (
                <div className="widget-reference-size-band" key={height}>
                  <div className="widget-reference-size-band-title">
                    <strong>{height}px</strong>
                    <span>All three color treatments before the next size</span>
                  </div>
                  {CONTROL_TONES.map((tone) => (
                    <div className="widget-reference-size-tone" key={tone}>
                      <small>{tone}</small>
                      <div className={`widget-reference-size-flow ${sizeGridMode ? "is-grid" : ""}`.trim()}>
                        <div className="widget-reference-size-cell"><WidgetSizedButton height={height} tone={tone}>Apply</WidgetSizedButton></div>
                        <div className="widget-reference-size-cell"><WidgetLeftSplitButton height={height} tone={tone} iconStyle="white-on-color" icon={<Sparkles />}>Create Asset</WidgetLeftSplitButton></div>
                        <div className="widget-reference-size-cell"><WidgetLeftSplitButton height={height} tone={tone} iconStyle="color-on-light" icon={<Save />}>Save Draft</WidgetLeftSplitButton></div>
                        <div className="widget-reference-size-cell"><WidgetTextInput height={height} tone={tone} placeholder="Video title" aria-label={`${height}px ${tone} input`} /></div>
                        <div className="widget-reference-size-cell"><WidgetSizedSelect height={height} tone={tone} value={selectValue} onChange={setSelectValue} label={`${height}px ${tone} visibility`} options={[{value:"public",label:"PUBLIC"},{value:"unlisted",label:"UNLISTED"},{value:"private",label:"PRIVATE"}]} /></div>
                        <div className="widget-reference-size-cell"><WidgetVideoSelect className="widget-reference-size-video" height={height} tone={tone} value={selectedVideo} onChange={setSelectedVideo} label={`${height}px ${tone} video`} options={VIDEO_OPTIONS} /></div>
                        <div className="widget-reference-size-cell"><WidgetProgressBar className="widget-reference-natural-progress" height={height} tone={tone} value={64} label="Progress" displayValue="64%" /></div>
                        <div className="widget-reference-size-cell"><WidgetIconButton height={height} tone={tone} label="Add item" icon={<Plus />} /></div>
                        <div className="widget-reference-size-cell"><WidgetIconBadge height={height} tone={tone} label="Saved" icon={<Star />} /></div>
                        <div className="widget-reference-size-cell"><WidgetStepper height={height} tone={tone} label={`${height}px ${tone} stepper`} value={matrixStepper} onChange={setMatrixStepper} min={0} max={99} /></div>
                        <div className="widget-reference-size-cell"><WidgetSplitCounter height={height} tone={tone} label={`${height}px ${tone} counter`} value={matrixStepper} onChange={setMatrixStepper} min={0} max={99} /></div>
                        <div className="widget-reference-size-cell"><WidgetPagination height={height} tone={tone} page={matrixPage} pageCount={3} onChange={setMatrixPage} /></div>
                        <div className="widget-reference-size-cell"><WidgetLeftSplitBadge height={height} tone={tone} icon={<Check />}>Ready</WidgetLeftSplitBadge></div>
                        <div className="widget-reference-size-cell"><WidgetSearchInput height={height} tone={tone} label={`${height}px ${tone} search`} placeholder="Search" /></div>
                        <div className="widget-reference-size-cell"><WidgetLiveBadge height={height} tone={tone}>Live</WidgetLiveBadge></div>
                        <div className="widget-reference-size-cell"><WidgetToggleSwitch height={height} tone={tone} label={`${height}px ${tone} toggle`} checked={matrixToggle} onChange={setMatrixToggle} /></div>
                        <div className="widget-reference-size-cell"><WidgetRadio height={height} tone={tone} label={`${height}px ${tone} radio`} checked={matrixRadio === tone} onChange={() => setMatrixRadio(tone)} /></div>
                        <div className="widget-reference-size-cell"><WidgetCheckbox height={height} tone={tone} label={`${height}px ${tone} checkbox`} checked={matrixCheck} onChange={setMatrixCheck} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </WidgetSection>
        )}

        {activeCategory === "video" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("2. Video Select", "Video Manager-derived dropdown")}
            <p className="text-[10px] font-bold uppercase opacity-60">
              The closed selector uses a split-left VIDEO / chevron bay. The selected title wraps naturally into two or three lines without ellipsis.
            </p>
            {(["white-on-color", "color-on-light"] as WidgetSplitIconStyle[]).map((iconStyle) => (
              <div className="widget-reference-family" key={iconStyle}>
                {familyHeading("Video Selector", iconStyle === "white-on-color" ? "White VIDEO/chevron on colored bay" : "Colored VIDEO/chevron on light bay")}
                <ToneRows
                  render={(tone, height) => (
                    <WidgetVideoSelect
                      height={height}
                      tone={tone}
                      iconStyle={iconStyle}
                      value={selectedVideo}
                      onChange={setSelectedVideo}
                      label={`${tone} select video ${height}px`}
                      options={VIDEO_OPTIONS}
                    />
                  )}
                />
              </div>
            ))}
          </WidgetSection>
        )}

        {activeCategory === "progress" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("3. Progress Bars", "Keyword Engine anatomy")}
            <div className="widget-reference-family">
              {familyHeading("Progress Bars", "3 tones × 4 heights")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetProgressBar
                    height={height}
                    tone={tone}
                    value={tone === "default" ? 82 : tone === "primary" ? 64 : 43}
                    label={tone === "default" ? "napoleon" : tone === "primary" ? "austerlitz" : "cavalry"}
                    displayValue={tone === "default" ? "82%" : tone === "primary" ? "64%" : "43%"}
                  />
                )}
              />
            </div>
          </WidgetSection>
        )}

        {activeCategory === "matrix" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("3b. Matrix Primitives", "v12 library · 3 tones × 4 heights")}

            <div className="widget-reference-family">
              {familyHeading("Square Icon Buttons", "1:1 · 3 tones × 4 heights")}
              <ToneRows square
                render={(tone, height) => (
                  <WidgetIconButton height={height} tone={tone} label="Add" icon={<Plus strokeWidth={2.5} />} />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Square Icon Badges", "Read-only twin")}
              <ToneRows square
                render={(tone, height) => (
                  <WidgetIconBadge height={height} tone={tone} label="Starred" icon={<Star strokeWidth={2.5} />} />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Steppers", "Clamped numeric control")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetStepper
                    height={height}
                    tone={tone}
                    label="Quantity"
                    value={matrixStepper}
                    onChange={setMatrixStepper}
                    min={0}
                    max={99}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Pagination", "Windowed page selector")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetPagination
                    height={height}
                    tone={tone}
                    page={matrixPage}
                    pageCount={3}
                    onChange={setMatrixPage}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Split-Left Badges", "1:1 icon bay + label")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetLeftSplitBadge height={height} tone={tone} icon={<Check strokeWidth={2.5} />}>
                    Ok
                  </WidgetLeftSplitBadge>
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Split-Left Search Bars", "Search bay + field")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetSearchInput
                    height={height}
                    tone={tone}
                    label="Search library"
                    placeholder="Search"
                    value={matrixSearch}
                    onChange={(event) => setMatrixSearch(event.currentTarget.value)}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Live Badges", "Pulsing status pill")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetLiveBadge height={height} tone={tone}>
                    Live
                  </WidgetLiveBadge>
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Spectrum Fill Badges", "12 unique fills · 18/24px · white text")}
              <div className="widget-reference-variants">
                {WIDGET_BADGE_SPECTRUM.map((name, index) => {
                  const height = index % 2 === 0 ? 18 : 24
                  return (
                    <div className="widget-reference-variant" key={name}>
                      <small>{name} · {height}px</small>
                      <WidgetSpectrumFillBadge spectrum={name} height={height}>
                        {name}
                      </WidgetSpectrumFillBadge>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Toggle Switches", "3 tones × 4 heights")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetToggleSwitch
                    height={height}
                    tone={tone}
                    label={`Toggle ${tone} ${height}`}
                    checked={matrixToggle}
                    onChange={setMatrixToggle}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Radio Buttons", "One group per tone")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetRadio
                    height={height}
                    tone={tone}
                    label={`Select ${tone}`}
                    checked={matrixRadio === tone}
                    onChange={() => setMatrixRadio(tone)}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Checkboxes", "3 tones × 4 heights")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetCheckbox
                    height={height}
                    tone={tone}
                    label={`Check ${tone} ${height}`}
                    checked={matrixCheck}
                    onChange={setMatrixCheck}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Split-Left Counters", "Square bay = two 2:1 chevron buttons")}
              <ToneRows
                render={(tone, height) => (
                  <WidgetSplitCounter
                    height={height}
                    tone={tone}
                    label="Split counter quantity"
                    value={matrixStepper}
                    onChange={setMatrixStepper}
                    min={0}
                    max={99}
                  />
                )}
              />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Daily Oracle Accent Rail", "Reusable edge-to-edge colored status/action module")}
              <div className="grid gap-2">
                <WidgetAccentRailModule
                  spectrum="rose"
                  title="Publish cadence needs attention"
                  detail="The color rail touches the outer module stroke."
                  action={<WidgetIconButton height={32} tone="secondary" label="Open upload" icon={<UploadCloud />} />}
                />
                <WidgetAccentRailModule
                  spectrum="cyan"
                  title="Audience signal found"
                  detail="Use the rail color for a meaningful category or status."
                  action={<WidgetIconButton height={32} tone="default" label="Open insight" icon={<ArrowRight />} />}
                />
              </div>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Icon + Title Modules", "About VIEWTUBE-style square icon bay + copy")}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <WidgetIconTitleModule spectrum="cyan" icon={<Brain />} title="Channel Brain" subtitle="Context, memory, and recommendations" />
                <WidgetIconTitleModule spectrum="royal" icon={<BarChart3 />} title="Analytics" subtitle="Canonical channel performance data" />
                <WidgetIconTitleModule spectrum="lime" icon={<Zap />} title="Quick Action" subtitle="One-tap creator workflow handoff" />
                <WidgetIconTitleModule spectrum="purple" icon={<Settings />} title="Control" subtitle="Preferences and system configuration" />
              </div>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Rainbow Surfaces", "Full-bleed gradient panel + divider line")}
              <WidgetRainbowPanel>
                <div className="grid gap-1">
                  <strong className="text-[12px] font-black uppercase">ViewTube Spectrum Surface</strong>
                  <span className="text-[9px] font-bold uppercase opacity-60">Gradient reaches every module edge; the divider spans left to right.</span>
                </div>
              </WidgetRainbowPanel>
              <WidgetRainbowDivider />
            </div>

            <div className="widget-reference-family">
              {familyHeading("Tiny Colored Icons", "62 reusable 18px icons")}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(WIDGET_TINY_ICON_SET) as Array<keyof typeof WIDGET_TINY_ICON_SET>).map((name, index) => {
                  const metricIcon = WIDGET_METRIC_ICON_SET.find((item) => item.name === name)
                  return (
                    <div key={name} className="grid justify-items-center gap-1">
                      <WidgetTinySpectrumIcon
                        name={name}
                        spectrum={metricIcon?.spectrum ?? WIDGET_BADGE_SPECTRUM[index % WIDGET_BADGE_SPECTRUM.length]}
                        label={metricIcon?.label ?? name}
                      />
                      <small className="text-[7px] font-black uppercase opacity-55">{metricIcon?.label ?? name}</small>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Canonical Metric Icons", "12 Data Visual metrics mapped to the 12 spectrum colors")}
              <div className="flex flex-wrap gap-3">
                {WIDGET_METRIC_ICON_SET.map((item) => (
                  <div key={item.metric} className="grid max-w-[74px] justify-items-center gap-1 text-center">
                    <WidgetTinySpectrumIcon name={item.name} spectrum={item.spectrum} label={item.label} height={24} />
                    <small className="text-[7px] font-black uppercase leading-[1.05] opacity-65">{item.label}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Widget Modules", "Navigation primitives manifested as real header controls")}
              <div className="grid gap-3">
                <WidgetModuleFrame
                  header={
                    <WidgetModuleHeader
                      icon={<BarChart3 />}
                      title="Channel Overview"
                      subtitle="Time window"
                      controls={
                        <WidgetHeaderStepper
                          label="Channel overview time window"
                          value={moduleWindow}
                          onPrevious={() => setModuleWindow("7 DAYS")}
                          onNext={() => setModuleWindow("28 DAYS")}
                        />
                      }
                    />
                  }
                >
                  <p className="text-[9px] font-bold uppercase opacity-65">The canonical header stepper becomes the time-window controller used by an analytics widget.</p>
                </WidgetModuleFrame>

                <WidgetModuleFrame
                  header={
                    <WidgetModuleHeader
                      icon={<Bell />}
                      title="Comment Responder"
                      subtitle="View + comment counter"
                      controls={
                        <span className="widget-module-header-nav-cluster">
                          <WidgetHeaderToggle
                            label="Comment responder view example"
                            value={commentHeaderTab}
                            items={[{ id: "unreplied", label: "NEW" }, { id: "history", label: "OLD" }]}
                            onChange={setCommentHeaderTab}
                          />
                          <WidgetHeaderStepper
                            label="Comment pagination example"
                            value={`${commentHeaderPage} / 12`}
                            canPrevious={commentHeaderPage > 1}
                            canNext={commentHeaderPage < 12}
                            onPrevious={() => setCommentHeaderPage((current) => Math.max(1, current - 1))}
                            onNext={() => setCommentHeaderPage((current) => Math.min(12, current + 1))}
                          />
                        </span>
                      }
                    />
                  }
                >
                  <p className="text-[9px] font-bold uppercase opacity-65">This mirrors the Comment Responder header: NEW/OLD mode plus the current comment counter.</p>
                </WidgetModuleFrame>

                <WidgetModuleFrame
                  header={
                    <WidgetModuleHeader
                      icon={<Layers />}
                      title="Publishing Workflow"
                      subtitle="Step navigation"
                      controls={
                        <WidgetStepTabs
                          label="Header publishing stages"
                          value={stepTabValue}
                          items={[
                            { id: "meta", label: "DETAILS" },
                            { id: "options", label: "OPTIONS" },
                            { id: "review", label: "VERIFY" },
                          ]}
                          onChange={setStepTabValue}
                        />
                      }
                    />
                  }
                >
                  <p className="text-[9px] font-bold uppercase opacity-65">Step tabs can live directly in a widget header when the module itself has sequential pages.</p>
                </WidgetModuleFrame>

                <WidgetModuleFrame
                  header={
                    <WidgetModuleHeader
                      icon={<Settings />}
                      title="Auto Chapters"
                      subtitle="Header switch"
                      controls={<WidgetSwitch label="Automatic Chapters" checked={switchValue} onChange={setSwitchValue} />}
                    />
                  }
                >
                  <p className="text-[9px] font-bold uppercase opacity-65">The navigation switch becomes a compact persistent header setting.</p>
                </WidgetModuleFrame>

                <WidgetModuleFrame
                  header={
                    <WidgetModuleHeader
                      icon={<Check />}
                      title="Embed Permission"
                      subtitle="Header checkbox"
                      controls={<WidgetChoice label="Allow Embedding" checked={checkboxValue} onChange={() => setCheckboxValue(!checkboxValue)} />}
                    />
                  }
                >
                  <p className="text-[9px] font-bold uppercase opacity-65">A canonical choice control can expose a persistent binary publishing option from the header.</p>
                </WidgetModuleFrame>

                <WidgetModuleFrame
                  header={
                    <WidgetModuleHeader
                      icon={<Sparkles />}
                      title="Reply Mode"
                      subtitle="Header radio group"
                      controls={
                        <span className="widget-module-header-nav-cluster is-choice-cluster">
                          <WidgetChoice type="radio" name="module-reply-mode" value="a" label="AI" checked={radioValue === "a"} onChange={() => setRadioValue("a")} />
                          <WidgetChoice type="radio" name="module-reply-mode" value="b" label="MANUAL" checked={radioValue === "b"} onChange={() => setRadioValue("b")} />
                        </span>
                      }
                    />
                  }
                >
                  <p className="text-[9px] font-bold uppercase opacity-65">Radio choices can become a compact header mode selector without adding another interior toolbar.</p>
                </WidgetModuleFrame>
              </div>
            </div>
          </WidgetSection>
        )}

        {activeCategory === "tags" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("4. Infinite Spectrum Tags", "A–Z receives 26 distinct continuous-spectrum hues")}
            <div className="widget-reference-family">
              {familyHeading("Canonical Spectrum", "12 explicit palette slots")}
              <div className="flex flex-wrap gap-1">
                {WIDGET_BADGE_SPECTRUM.map((tone, index) => (
                  <WidgetAlphabeticalTag key={tone} label={`${String.fromCharCode(65 + index)} ${tone}`} tone={tone} />
                ))}
              </div>
            </div>
            <div className="widget-reference-family">
              {familyHeading("Alphabetical Mapping", "Every A–Z tag receives a distinct continuous-spectrum hue")}
              <div className="flex flex-wrap gap-1">
                {ALPHABET.map((letter) => <WidgetAlphabeticalTag key={letter} label={letter} />)}
              </div>
            </div>
            <div className="widget-reference-family">
              {familyHeading("Badge Heights", "Radius and typography follow component height")}
              <div className="widget-reference-variants">
                {CONTROL_HEIGHTS.map((height, index) => (
                  <div className="widget-reference-variant" key={height}>
                    <small>{height}px</small>
                    <WidgetBadge height={height} tone={index * 3}>{height}px Badge</WidgetBadge>
                  </div>
                ))}
              </div>
            </div>
          </WidgetSection>
        )}

        {activeCategory === "alerts" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("10. Alerts + Split Badges", "Toasts and the 12-slot split-left set")}
            <div className="widget-reference-family">
              {familyHeading("Toasts", "Status carries a glyph as well as a hue")}
              <div className="flex flex-col gap-2">
                {TOAST_SAMPLES.map((sample) => (
                  <WidgetToast
                    key={sample.status}
                    status={sample.status}
                    title={sample.title}
                    detail={sample.detail}
                    onDismiss={() => undefined}
                  />
                ))}
              </div>
            </div>
            <div className="widget-reference-family">
              {familyHeading("Spectrum Toasts", "Same bar on any of the 12 slots")}
              <div className="flex flex-col gap-2">
                {WIDGET_BADGE_SPECTRUM.slice(0, 3).map((spectrum) => (
                  <WidgetToast
                    key={spectrum}
                    spectrum={spectrum}
                    title={`${spectrum} alert`}
                    detail="Non-semantic hue for catalogue and per-widget use"
                  />
                ))}
              </div>
            </div>
            <div className="widget-reference-family">
              {familyHeading("Split-Left Badges", "All 12 spectrum slots")}
              <div className="flex flex-wrap gap-2">
                {SPLIT_BADGE_SAMPLES.map((sample) => (
                  <WidgetLeftSplitBadge
                    key={sample.spectrum}
                    spectrum={sample.spectrum}
                    icon={sample.icon}
                  >
                    {sample.label}
                  </WidgetLeftSplitBadge>
                ))}
              </div>
            </div>
            <div className="widget-reference-family">
              {familyHeading("Split Badge Heights", "Icon bay tracks the control height")}
              <div className="widget-reference-variants">
                {CONTROL_HEIGHTS.map((height, index) => (
                  <div className="widget-reference-variant" key={height}>
                    <small>{height}px</small>
                    <WidgetLeftSplitBadge
                      height={height}
                      spectrum={WIDGET_BADGE_SPECTRUM[index * 3]}
                      icon={<Check strokeWidth={2.5} />}
                    >
                      {height}px
                    </WidgetLeftSplitBadge>
                  </div>
                ))}
              </div>
            </div>
          </WidgetSection>
        )}

        {activeCategory === "media" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("5. Media Uploaders", "Upload + dropzone primitives")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div className="flex flex-col gap-2">
                <div className="w-full">
                  <WidgetMediaUploadFrame
                    aspect="16:9"
                    icon={<ImagePlus />}
                    title="THUMBNAIL"
                    detail="Drop an image file here"
                    hasValue={hasThumbnail}
                    preview={hasThumbnail ? <div className="w-full h-full flex items-center justify-center font-black text-xs uppercase">Thumbnail Preview</div> : undefined}
                    onBrowse={() => setHasThumbnail(!hasThumbnail)}
                  />
                </div>
                <WidgetMediaUploadAction onClick={() => setHasThumbnail(!hasThumbnail)}>
                  {hasThumbnail ? "REPLACE THUMBNAIL" : "UPLOAD THUMBNAIL"}
                </WidgetMediaUploadAction>
              </div>
              <WidgetDropzone
                icon={<UploadCloud />}
                title="SOURCE VIDEO FILE"
                detail="Drag & drop .MP4, .MOV, or click to browse"
                onClick={() => {}}
              />
            </div>
          </WidgetSection>
        )}

        {activeCategory === "navigation" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("6. Navigation", "Toggles + steppers + tabs")}
            <WidgetHeaderToggle
              label="Project drafts"
              value={headerToggleValue}
              items={[
                { id: "draft-1", label: "DRAFT 1" },
                { id: "draft-2", label: "DRAFT 2" },
                { id: "draft-3", label: "DRAFT 3" },
              ]}
              onChange={setHeaderToggleValue}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <WidgetHeaderStepper
                label="Workflow step"
                value={stepperValue}
                onPrevious={() => setStepperValue("Step 1 of 4")}
                onNext={() => setStepperValue("Step 2 of 4")}
              />
              <WidgetStepTabs
                label="Publishing stages"
                value={stepTabValue}
                items={[
                  { id: "meta", label: "DETAILS" },
                  { id: "options", label: "OPTIONS" },
                  { id: "review", label: "VERIFY" },
                ]}
                onChange={setStepTabValue}
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <WidgetSwitch label="Automatic Chapters" checked={switchValue} onChange={setSwitchValue} />
              <WidgetChoice label="Allow Embedding" checked={checkboxValue} onChange={() => setCheckboxValue(!checkboxValue)} />
              <WidgetChoice type="radio" name="ref-radio" value="a" label="Option A" checked={radioValue === "a"} onChange={() => setRadioValue("a")} />
              <WidgetChoice type="radio" name="ref-radio" value="b" label="Option B" checked={radioValue === "b"} onChange={() => setRadioValue("b")} />
            </div>
          </WidgetSection>
        )}

        {activeCategory === "states" && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("7. Metrics + States", "Feedback system")}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <WidgetMetric label="LIFETIME VIEWS" value="1.42M" detail="+14.2%" tone="#34cdea" />
              <WidgetMetric label="CLICK-THROUGH" value="8.90%" detail="High" tone="#b9f536" />
              <WidgetMetric label="AVG DURATION" value="06:42" detail="62.5%" tone="#ea58e8" />
              <WidgetMetric label="REVENUE" value="$4,820" detail="+8.5%" tone="#ffad59" />
            </div>
            <div className="flex flex-wrap gap-1">
              {(["loading", "ready", "empty", "blocked", "stale", "error"] as const).map((status) => (
                <WidgetSizedButton
                  key={status}
                  height={24}
                  tone={statePanelStatus === status ? "primary" : "default"}
                  onClick={() => setStatePanelStatus(status)}
                >
                  {status}
                </WidgetSizedButton>
              ))}
            </div>
            <WidgetStatePanel
              state={{
                data: null,
                status: statePanelStatus,
                message: statePanelStatus === "ready" ? "Data synchronized with the canonical store." : undefined,
                provenance: "VT-SYNC",
                updatedAt: "Just now",
                recoveryAction: statePanelStatus === "error" || statePanelStatus === "blocked" ? "Retry Connection" : undefined,
              }}
              onRecover={() => setStatePanelStatus("ready")}
            />
            <WidgetDisclosure title="Tags">
              <div className="flex flex-wrap gap-1 p-2">
                {tags.map((tag) => (
                  <WidgetTag key={tag} onRemove={() => setTags((current) => current.filter((item) => item !== tag))}>{tag}</WidgetTag>
                ))}
                <WidgetSizedButton height={24} tone="secondary" onClick={() => setTags((current) => [...current, `tag-${current.length + 1}`])} aria-label="Add tag">
                  <Plus size={12} />
                </WidgetSizedButton>
              </div>
            </WidgetDisclosure>
          </WidgetSection>
        )}
      </WidgetScrollArea>

      <WidgetFooter className="widget-toolbar widget-workflow-toolbar">
        <span className="text-[9px] font-black uppercase opacity-60">UI Reference Library v3.5 · size/color matrix + 62 icon set</span>
        <WidgetLeftSplitButton height={32} tone="primary" iconStyle="white-on-color" icon={<Check />}>
          Standard Compliant
        </WidgetLeftSplitButton>
      </WidgetFooter>
    </WidgetShell>
  )
}
