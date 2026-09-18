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
  WIDGET_BADGE_SPECTRUM,
} from "../WidgetPrimitives"
import { getDashboardWidgetPaletteColors } from "../../../styles/toolboxPalette"

type ReferenceCategory =
  | "all"
  | "controls"
  | "video"
  | "progress"
  | "tags"
  | "media"
  | "navigation"
  | "matrix"
  | "states"

const CONTROL_HEIGHTS: WidgetControlHeight[] = [18, 24, 32, 38]
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
  const previewWidget = useMemo(
    () => ({ ...widget, ...getDashboardWidgetPaletteColors(paletteIndex) }),
    [paletteIndex, widget],
  )

  const headerContent = (
    <div className="widget-reference-header-controls">
    <WidgetHeaderToggle
      label="Reference category"
      value={activeCategory}
      items={[
        { id: "all", label: "ALL" },
        { id: "controls", label: "CONTROLS" },
        { id: "matrix", label: "MATRIX" },
        { id: "video", label: "VIDEO" },
        { id: "progress", label: "BARS" },
        { id: "tags", label: "TAGS" },
        { id: "media", label: "MEDIA" },
        { id: "navigation", label: "NAV" },
        { id: "states", label: "STATES" },
      ]}
      onChange={(value) => setActiveCategory(value as ReferenceCategory)}
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
        {(activeCategory === "all" || activeCategory === "controls") && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("1. Standard Controls", "Default / Primary / Secondary")}
            <p className="text-[10px] font-bold uppercase opacity-60">
              Every component family uses the same three monochromatic color styles at 18 / 24 / 32 / 38px. Canonical type scale: 18px → 8px, 24px → 14px, 32px → 18px, 38px → 22px, all at weight 1000. 18px controls stay filled, borderless and shadowless; larger controls use a 2px stroke.
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

        {(activeCategory === "all" || activeCategory === "video") && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("2. Video Select", "Video Manager-derived dropdown")}
            <p className="text-[10px] font-bold uppercase opacity-60">
              Both split-icon treatments are available: white icon on the colored bay, or widget-colored icon on a light bay.
            </p>
            {(["white-on-color", "color-on-light"] as WidgetSplitIconStyle[]).map((iconStyle) => (
              <div className="widget-reference-family" key={iconStyle}>
                {familyHeading("Video Selector", iconStyle === "white-on-color" ? "White icon / colored bay" : "Colored icon / light bay")}
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

        {(activeCategory === "all" || activeCategory === "progress") && (
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

        {(activeCategory === "all" || activeCategory === "matrix") && (
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
          </WidgetSection>
        )}

        {(activeCategory === "all" || activeCategory === "tags") && (
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

        {(activeCategory === "all" || activeCategory === "media") && (
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

        {(activeCategory === "all" || activeCategory === "navigation") && (
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

        {(activeCategory === "all" || activeCategory === "states") && (
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
        <span className="text-[9px] font-black uppercase opacity-60">UI Reference Library v3.3 · 12 palettes + spectrum tags</span>
        <WidgetLeftSplitButton height={32} tone="primary" iconStyle="white-on-color" icon={<Check />}>
          Standard Compliant
        </WidgetLeftSplitButton>
      </WidgetFooter>
    </WidgetShell>
  )
}
