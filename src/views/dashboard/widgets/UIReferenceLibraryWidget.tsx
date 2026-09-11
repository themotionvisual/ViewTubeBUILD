import React, { useState } from "react"
import {
  Check,
  ImagePlus,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  UploadCloud,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetActionButton,
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
  WidgetLeftSplitButton,
  WidgetProgressBar,
  WidgetSizedButton,
  WidgetSizedSelect,
  WidgetTextInput,
  WidgetVideoSelect,
  type WidgetControlHeight,
} from "../WidgetPrimitiveExtensions"

type ReferenceCategory =
  | "all"
  | "controls"
  | "video"
  | "progress"
  | "media"
  | "navigation"
  | "states"

const CONTROL_HEIGHTS: WidgetControlHeight[] = [18, 24, 32, 38]

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

export default function UIReferenceLibraryWidget({ widget, ...common }: any) {
  const [activeCategory, setActiveCategory] = useState<ReferenceCategory>("all")
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

  const headerContent = (
    <WidgetHeaderToggle
      label="Reference category"
      value={activeCategory}
      items={[
        { id: "all", label: "ALL" },
        { id: "controls", label: "CONTROLS" },
        { id: "video", label: "VIDEO" },
        { id: "progress", label: "BARS" },
        { id: "media", label: "MEDIA" },
        { id: "navigation", label: "NAV" },
        { id: "states", label: "STATES" },
      ]}
      onChange={(value) => setActiveCategory(value as ReferenceCategory)}
    />
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

  const SizeVariants = ({ children }: { children: (height: WidgetControlHeight) => React.ReactNode }) => (
    <div className="widget-reference-variants">
      {CONTROL_HEIGHTS.map((height) => (
        <div className="widget-reference-variant" key={height}>
          <small>{height}px</small>
          {children(height)}
        </div>
      ))}
    </div>
  )

  return (
    <WidgetShell widget={widget} headerContent={headerContent} icon={<Layers size={22} />} {...common}>
      <WidgetScrollArea
        ariaLabel="ViewTube Widget Component Reference Library"
        contentClassName="flex min-h-full flex-col gap-3 p-3"
      >
        {(activeCategory === "all" || activeCategory === "controls") && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("1. Standard Controls", "18 / 24 / 32 / 38 px")}
            <p className="text-[10px] font-bold uppercase opacity-60">
              Component families are grouped together for direct size comparison. 18px controls are filled, borderless and shadowless. 24px, 32px and 38px controls use a 2px stroke.
            </p>

            <div className="widget-reference-family">
              {familyHeading("Buttons", "Default")}
              <SizeVariants>
                {(height) => <WidgetSizedButton height={height}>Button</WidgetSizedButton>}
              </SizeVariants>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Buttons", "Primary")}
              <SizeVariants>
                {(height) => <WidgetSizedButton height={height} className="primary">Primary</WidgetSizedButton>}
              </SizeVariants>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Split Left Buttons", "Community Post anatomy")}
              <SizeVariants>
                {(height) => (
                  <WidgetLeftSplitButton
                    height={height}
                    icon={<Sparkles size={Math.max(10, height - 18)} />}
                    width="full"
                  >
                    Split Left
                  </WidgetLeftSplitButton>
                )}
              </SizeVariants>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Text Inputs", "Community Post input + focus style")}
              <SizeVariants>
                {(height) => (
                  <WidgetTextInput
                    height={height}
                    value={textValue}
                    onChange={(event) => setTextValue(event.currentTarget.value)}
                    aria-label={`${height}px text input`}
                  />
                )}
              </SizeVariants>
            </div>

            <div className="widget-reference-family">
              {familyHeading("Dropdown Menus", "Radix select")}
              <SizeVariants>
                {(height) => (
                  <WidgetSizedSelect
                    height={height}
                    value={selectValue}
                    onChange={setSelectValue}
                    label={`${height}px dropdown`}
                    options={[
                      { value: "public", label: "PUBLIC" },
                      { value: "unlisted", label: "UNLISTED" },
                      { value: "private", label: "PRIVATE" },
                    ]}
                  />
                )}
              </SizeVariants>
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
              Thumbnail-aware selector with a colored left icon bay, selected-video title, chevron, searchable menu and video rows.
            </p>
            <div className="widget-reference-family">
              {familyHeading("Video Selector", "All standard heights")}
              <SizeVariants>
                {(height) => (
                  <WidgetVideoSelect
                    height={height}
                    value={selectedVideo}
                    onChange={setSelectedVideo}
                    label={`Select video ${height}px`}
                    options={VIDEO_OPTIONS}
                  />
                )}
              </SizeVariants>
            </div>
          </WidgetSection>
        )}

        {(activeCategory === "all" || activeCategory === "progress") && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("3. Progress Bars", "Keyword Engine anatomy")}
            <p className="text-[10px] font-bold uppercase opacity-60">
              Fill and overlay-copy progress bars are grouped as one component family across all four control heights.
            </p>
            <div className="widget-reference-family">
              {familyHeading("Progress Bars", "18 / 24 / 32 / 38")}
              <SizeVariants>
                {(height) => (
                  <WidgetProgressBar
                    height={height}
                    value={height === 18 ? 82 : height === 24 ? 67 : height === 32 ? 51 : 39}
                    label={height === 18 ? "napoleon" : height === 24 ? "austerlitz" : height === 32 ? "cavalry" : "emperor"}
                    displayValue={height === 18 ? "82.40%" : height === 24 ? "67.25%" : height === 32 ? "51.80%" : "39.10%"}
                  />
                )}
              </SizeVariants>
            </div>
          </WidgetSection>
        )}

        {(activeCategory === "all" || activeCategory === "media") && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("4. Media Uploaders", "Upload + dropzone primitives")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div className="flex flex-col gap-2">
                <div className="h-[120px] w-full">
                  <WidgetMediaUploadFrame
                    icon={<ImagePlus size={24} />}
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
                icon={<UploadCloud size={24} />}
                title="SOURCE VIDEO FILE"
                detail="Drag & drop .MP4, .MOV, or click to browse"
                onClick={() => {}}
              />
            </div>
          </WidgetSection>
        )}

        {(activeCategory === "all" || activeCategory === "navigation") && (
          <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
            {sectionHeading("5. Navigation", "Toggles + steppers + tabs")}
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
            {sectionHeading("6. Metrics + States", "Feedback system")}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <WidgetMetric label="LIFETIME VIEWS" value="1.42M" detail="+14.2%" tone="#34cdea" />
              <WidgetMetric label="CLICK-THROUGH" value="8.90%" detail="High" tone="#b9f536" />
              <WidgetMetric label="AVG DURATION" value="06:42" detail="62.5%" tone="#ea58e8" />
              <WidgetMetric label="REVENUE" value="$4,820" detail="+8.5%" tone="#ffad59" />
            </div>
            <div className="flex flex-wrap gap-1">
              {(["loading", "ready", "empty", "blocked", "stale", "error"] as const).map((status) => (
                <WidgetSizedButton key={status} height={24} onClick={() => setStatePanelStatus(status)} className={statePanelStatus === status ? "primary" : ""}>
                  {status}
                </WidgetSizedButton>
              ))}
            </div>
            <WidgetStatePanel
              state={{
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
                <WidgetSizedButton height={24} onClick={() => setTags((current) => [...current, `tag-${current.length + 1}`])} aria-label="Add tag">
                  <Plus size={12} />
                </WidgetSizedButton>
              </div>
            </WidgetDisclosure>
          </WidgetSection>
        )}
      </WidgetScrollArea>

      <WidgetFooter className="widget-toolbar widget-workflow-toolbar">
        <span className="text-[9px] font-black uppercase opacity-60">UI Reference Library v3.1 · grouped by component family</span>
        <WidgetLeftSplitButton height={32} tone="primary" icon={<Check size={14} />}>
          Standard Compliant
        </WidgetLeftSplitButton>
      </WidgetFooter>
    </WidgetShell>
  )
}
