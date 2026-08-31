import React, { useState } from "react"
import {
 AlertTriangle,
 Check,
 ChevronRight,
 FileVideo2,
 ImagePlus,
 Info,
 Layers,
 Plus,
 RotateCcw,
 Save,
 Sparkles,
 Trash2,
 UploadCloud,
 X,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
 WidgetActionButton,
 WidgetChoice,
 WidgetDisclosure,
 WidgetDivider,
 WidgetDropzone,
 WidgetField,
 WidgetFooter,
 WidgetHeaderStepper,
 WidgetHeaderToggle,
 WidgetMediaUploadAction,
 WidgetMediaUploadFrame,
 WidgetMetric,
 WidgetScrollArea,
 WidgetSection,
 WidgetSelect,
 WidgetSplitButton,
 WidgetStatePanel,
 WidgetStepTabs,
 WidgetSwitch,
 WidgetTag,
 WidgetTooltip,
 WidgetWorkflowMain,
} from "../WidgetPrimitives"

type ReferenceCategory = "all" | "buttons" | "inputs" | "media" | "navigation" | "layout" | "metrics_states"

export default function UIReferenceLibraryWidget({ widget, ...common }: any) {
 const [activeCategory, setActiveCategory] = useState<ReferenceCategory>("all")
 const [headerToggleValue, setHeaderToggleValue] = useState("draft-1")
 const [stepperValue, setStepperValue] = useState("Step 1 of 4")
 const [stepTabValue, setStepTabValue] = useState("meta")
 const [selectValue, setSelectValue] = useState("public")
 const [switchValue, setSwitchValue] = useState(true)
 const [checkboxValue, setCheckboxValue] = useState(true)
 const [radioValue, setRadioValue] = useState("b")
 const [textInputValue, setTextInputValue] = useState("Sample Title Input")
 const [descInputValue, setDescInputValue] = useState("Uniform multiline description content for widget cards.")
 const [tags, setTags] = useState(["viewtube", "analytics", "neo-brutalist"])
 const [newTag, setNewTag] = useState("")
 const [statePanelStatus, setStatePanelStatus] = useState<"loading" | "ready" | "empty" | "blocked" | "stale" | "error">("ready")
 const [hasThumbnail, setHasThumbnail] = useState(false)
 const [showInlineError, setShowInlineError] = useState(true)

 const addTag = () => {
  if (newTag.trim() && !tags.includes(newTag.trim())) {
   setTags([...tags, newTag.trim()])
   setNewTag("")
  }
 }

 const headerContent = (
  <div className="flex items-center gap-1.5">
   <WidgetHeaderToggle
    label="Category Filter"
    value={activeCategory}
    items={[
     { id: "all", label: "ALL" },
     { id: "buttons", label: "BUTTONS" },
     { id: "inputs", label: "INPUTS" },
     { id: "media", label: "MEDIA" },
     { id: "navigation", label: "NAV" },
     { id: "metrics_states", label: "STATES" },
    ]}
    onChange={(val) => setActiveCategory(val as ReferenceCategory)}
   />
  </div>
 )

 return (
  <WidgetShell
   widget={widget}
   headerContent={headerContent}
   icon={<Layers size={22} />}
   {...common}
  >
   <WidgetScrollArea
    ariaLabel="ViewTube Widget Component Reference Library"
    contentClassName="flex min-h-full flex-col gap-4 p-3 bg-[#f8f9fa]"
   >
    {/* ── SECTION 1: BUTTONS & ACTIONS ── */}
    {(activeCategory === "all" || activeCategory === "buttons") && (
     <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
      <header className="flex items-center justify-between border-b pb-2 border-black/15">
       <strong className="text-xs font-black uppercase tracking-wider">1. Buttons & Split Actions</strong>
       <span className="text-[10px] font-mono text-black/50 uppercase">WidgetPrimitives.tsx</span>
      </header>

      <div className="flex flex-col gap-2">
       <span className="text-[11px] font-bold uppercase text-black/70">Standard Buttons (.vt-button)</span>
       <div className="flex flex-wrap gap-2 items-center">
        <button type="button" className="vt-button">Default Button</button>
        <button type="button" className="vt-button primary">Primary Accent</button>
        <button type="button" className="vt-button secondary">Secondary Light</button>
        <button type="button" className="vt-button ghost">Ghost</button>
        <button type="button" className="vt-button is-icon-only" aria-label="Revert"><RotateCcw size={14} /></button>
        <button type="button" className="vt-button is-icon-only primary" aria-label="Add"><Plus size={14} /></button>
       </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-black/10">
       <span className="text-[11px] font-bold uppercase text-black/70">Widget Action Buttons (WidgetActionButton)</span>
       <div className="flex flex-wrap gap-2 items-center">
        <WidgetActionButton tone="neutral">Action Neutral</WidgetActionButton>
        <WidgetActionButton tone="primary">Action Primary</WidgetActionButton>
        <WidgetActionButton tone="danger">Action Danger</WidgetActionButton>
       </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-black/10">
       <span className="text-[11px] font-bold uppercase text-black/70">Split Buttons (WidgetSplitButton)</span>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <WidgetSplitButton tone="primary" icon={<Save size={14} />} width="full">
         Save Changes
        </WidgetSplitButton>
        <WidgetSplitButton tone="soft" icon={<UploadCloud size={14} />} width="full">
         Publish Video
        </WidgetSplitButton>
        <WidgetSplitButton tone="neutral" icon={<Sparkles size={14} />} width="full">
         AI Optimize
        </WidgetSplitButton>
       </div>
      </div>
     </WidgetSection>
    )}

    {/* ── SECTION 2: INPUTS, TEXTAREAS & SELECTS ── */}
    {(activeCategory === "all" || activeCategory === "inputs") && (
     <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
      <header className="flex items-center justify-between border-b pb-2 border-black/15">
       <strong className="text-xs font-black uppercase tracking-wider">2. Inputs, Textareas & Selects</strong>
       <span className="text-[10px] font-mono text-black/50 uppercase">Uniform Inputs</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
       {/* Single Line Input with Badge */}
       <div className="widget-uploader-input is-title">
        <input
         className="vt-input"
         placeholder="VIDEO TITLE"
         value={textInputValue}
         maxLength={100}
         onChange={(e) => setTextInputValue(e.target.value)}
        />
        <span className="widget-uploader-input-meta">
         <span>Title</span>
         <small>{textInputValue.length}/100</small>
        </span>
       </div>

       {/* Dropdown Select */}
       <WidgetSelect
        value={selectValue}
        onChange={setSelectValue}
        label="Visibility Option"
        placeholder="Select Visibility…"
        options={[
         { value: "public", label: "PUBLIC (Anyone can watch)" },
         { value: "unlisted", label: "UNLISTED (Direct link only)" },
         { value: "private", label: "PRIVATE (Only creator)" },
         { value: "scheduled", label: "SCHEDULED (Automated publish)" },
        ]}
       />
      </div>

      {/* Multiline Textarea with Badge */}
      <div className="widget-uploader-input is-description">
       <textarea
        className="vt-textarea widget-description-textarea"
        placeholder="DESCRIPTION"
        value={descInputValue}
        maxLength={5000}
        rows={3}
        onChange={(e) => setDescInputValue(e.target.value)}
       />
       <span className="widget-uploader-input-meta">
        <span>Description</span>
        <small>{descInputValue.length}/5000</small>
       </span>
      </div>

      {/* Tags Composer */}
      <div className="widget-tags-entry">
       <div className="widget-tags-composer" role="group" aria-label="Tags Composer">
        <div className="widget-tags-scroll">
         <div className="widget-tag-list">
          {tags.map((tag) => (
           <WidgetTag key={tag} onRemove={() => setTags(tags.filter((t) => t !== tag))}>{tag}</WidgetTag>
          ))}
         </div>
         <input
          className="widget-tags-composer-input"
          placeholder="Add tag and press enter…"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
         />
         <span className="widget-tags-character-count">{tags.join(", ").length}/500</span>
        </div>
       </div>
       <div className="widget-tags-composer-actions">
        <button type="button" className="vt-button" onClick={() => setDescInputValue("Default channel description template inserted.")}>
         Use Default Description
        </button>
        <button type="button" className="vt-button" onClick={() => setTags(["viewtube", "creator", "trending", "analytics"])}>
         Use Default Tags
        </button>
        <button type="button" className="vt-button primary" onClick={addTag} aria-label="Add Tag"><Plus size={14} /></button>
       </div>
      </div>

      {/* Choice Controls: Toggles, Checkboxes & Radios */}
      <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-black/10">
       <WidgetSwitch label="Automatic Chapters" checked={switchValue} onChange={setSwitchValue} />
       <WidgetChoice label="Allow Embedding" checked={checkboxValue} onChange={() => setCheckboxValue(!checkboxValue)} />
       <WidgetChoice type="radio" name="demo-radio" value="a" label="Option A" checked={radioValue === "a"} onChange={() => setRadioValue("a")} />
       <WidgetChoice type="radio" name="demo-radio" value="b" label="Option B" checked={radioValue === "b"} onChange={() => setRadioValue("b")} />
      </div>
     </WidgetSection>
    )}

    {/* ── SECTION 3: MEDIA UPLOADERS & DROPZONES ── */}
    {(activeCategory === "all" || activeCategory === "media") && (
     <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
      <header className="flex items-center justify-between border-b pb-2 border-black/15">
       <strong className="text-xs font-black uppercase tracking-wider">3. Media Uploaders & Dropzones</strong>
       <span className="text-[10px] font-mono text-black/50 uppercase">WidgetMediaUploadFrame</span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
       {/* Thumbnail Frame */}
       <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase text-black/70">Single-Dashed Media Upload Frame</span>
        <div className="h-[120px] w-full">
         <WidgetMediaUploadFrame
          icon={<ImagePlus size={24} />}
          title="THUMBNAIL"
          detail="Drop an image file here"
          hasValue={hasThumbnail}
          preview={hasThumbnail ? (
           <div className="w-full h-full bg-black/5 flex items-center justify-center font-bold text-xs uppercase">
            3D Animation Preview Image
           </div>
          ) : undefined}
          onBrowse={() => setHasThumbnail(!hasThumbnail)}
         />
        </div>
        <WidgetMediaUploadAction onClick={() => setHasThumbnail(!hasThumbnail)}>
         {hasThumbnail ? "REPLACE THUMBNAIL" : "UPLOAD THUMBNAIL"}
        </WidgetMediaUploadAction>
       </div>

       {/* Dropzone Component */}
       <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase text-black/70">WidgetDropzone Primitive</span>
        <WidgetDropzone
         icon={<UploadCloud size={24} />}
         title="SOURCE VIDEO FILE"
         detail="Drag & drop .MP4, .MOV, or click to browse"
         hasValue={false}
         onClick={() => {}}
        />
       </div>
      </div>
     </WidgetSection>
    )}

    {/* ── SECTION 4: HEADER CONTROLS, NAVIGATION & STEPPERS ── */}
    {(activeCategory === "all" || activeCategory === "navigation") && (
     <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
      <header className="flex items-center justify-between border-b pb-2 border-black/15">
       <strong className="text-xs font-black uppercase tracking-wider">4. Header Toggles, Steppers & Step Tabs</strong>
       <span className="text-[10px] font-mono text-black/50 uppercase">Navigation Primitives</span>
      </header>

      <div className="flex flex-col gap-3">
       <div>
        <span className="text-[11px] font-bold uppercase text-black/70 block mb-1">Header Segmented Toggle (WidgetHeaderToggle)</span>
        <WidgetHeaderToggle
         label="Project Drafts"
         value={headerToggleValue}
         items={[
          { id: "draft-1", label: "DRAFT 1" },
          { id: "draft-2", label: "DRAFT 2" },
          { id: "draft-3", label: "DRAFT 3" },
         ]}
         onChange={setHeaderToggleValue}
        />
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
         <span className="text-[11px] font-bold uppercase text-black/70 block mb-1">Header Stepper (WidgetHeaderStepper)</span>
         <WidgetHeaderStepper
          label="Workflow Step"
          value={stepperValue}
          onPrevious={() => setStepperValue("Step 1 of 4")}
          onNext={() => setStepperValue("Step 2 of 4")}
         />
        </div>

        <div>
         <span className="text-[11px] font-bold uppercase text-black/70 block mb-1">Step Tabs (WidgetStepTabs)</span>
         <WidgetStepTabs
          label="Publishing Stages"
          value={stepTabValue}
          items={[
           { id: "meta", label: "DETAILS" },
           { id: "options", label: "OPTIONS" },
           { id: "review", label: "VERIFY" },
          ]}
          onChange={setStepTabValue}
         />
        </div>
       </div>
      </div>
     </WidgetSection>
    )}

    {/* ── SECTION 5: METRICS, STATUS STATES & TOOLTIPS ── */}
    {(activeCategory === "all" || activeCategory === "metrics_states") && (
     <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
      <header className="flex items-center justify-between border-b pb-2 border-black/15">
       <strong className="text-xs font-black uppercase tracking-wider">5. Metrics, State Panels, Tooltips & Error Alerts</strong>
       <span className="text-[10px] font-mono text-black/50 uppercase">Feedback System</span>
      </header>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
       <WidgetMetric label="LIFETIME VIEWS" value="1.42M" detail="+14.2% this month" tone="#36E0F6" />
       <WidgetMetric label="CLICK-THROUGH" value="8.9%" detail="High benchmark" tone="#C0F240" />
       <WidgetMetric label="AVG DURATION" value="06:42" detail="62% retention" tone="#FF83EA" />
       <WidgetMetric label="EST. REVENUE" value="$4,820" detail="+8.5% YoY" tone="#FFB570" />
      </div>

      {/* Tooltip Variants */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-black/10 items-center">
       <span className="text-[11px] font-bold uppercase text-black/70">Tooltips:</span>
       <WidgetTooltip content="Standard spout indicator tooltip" variant="standard-spout">
        <button type="button" className="vt-button secondary text-[10px] h-6 px-2">Standard Spout</button>
       </WidgetTooltip>
       <WidgetTooltip content="Drawer tooltip for contextual help" variant="drawer">
        <button type="button" className="vt-button secondary text-[10px] h-6 px-2">Drawer</button>
       </WidgetTooltip>
       <WidgetTooltip content="Outline bubble tooltip" variant="top-center-outline">
        <button type="button" className="vt-button secondary text-[10px] h-6 px-2">Outline</button>
       </WidgetTooltip>
      </div>

      {/* Dismissible Error Alert */}
      {showInlineError && (
       <div className="widget-inline-error" role="alert">
        <span>Session token warning: Reconnect channel to sync fresh analytics.</span>
        <button type="button" className="widget-inline-error-dismiss" onClick={() => setShowInlineError(false)} aria-label="Dismiss error">
         <X size={12} strokeWidth={3} />
        </button>
       </div>
      )}

      {/* State Panels */}
      <div className="flex flex-col gap-2 pt-2 border-t border-black/10">
       <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase text-black/70">State Panel Simulator (WidgetStatePanel)</span>
        <div className="flex gap-1">
         {(["loading", "ready", "empty", "blocked", "error"] as const).map((st) => (
          <button
           key={st}
           type="button"
           className={`vt-button text-[9px] h-5 px-1.5 ${statePanelStatus === st ? "primary" : ""}`}
           onClick={() => setStatePanelStatus(st)}
          >
           {st.toUpperCase()}
          </button>
         ))}
        </div>
       </div>

       <WidgetStatePanel
        state={{
         status: statePanelStatus,
         message: statePanelStatus === "ready" ? "Data synchronized with YouTube Analytics API v2." : undefined,
         provenance: "Canonical Store (YT-SYNC)",
         updatedAt: "Just now",
         recoveryAction: statePanelStatus === "error" || statePanelStatus === "blocked" ? "Retry Connection" : undefined,
        }}
        onRecover={() => setStatePanelStatus("ready")}
       />
      </div>
     </WidgetSection>
    )}

    {/* ── SECTION 6: DISCLOSURES & SELECTION CARDS ── */}
    {activeCategory === "all" && (
     <WidgetSection surface="white" edge="inset" className="flex flex-col gap-3 p-3">
      <header className="flex items-center justify-between border-b pb-2 border-black/15">
       <strong className="text-xs font-black uppercase tracking-wider">6. Disclosures & Selection Cards</strong>
       <span className="text-[10px] font-mono text-black/50 uppercase">WidgetDisclosure</span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
       <WidgetDisclosure title="Audience & Age Restrictions">
        <div className="flex flex-col gap-2 p-2">
         <WidgetChoice type="radio" name="ref-kids" value="yes" label="Yes, made for kids" checked={false} onChange={() => {}} />
         <WidgetChoice type="radio" name="ref-kids" value="no" label="No, not made for kids" checked={true} onChange={() => {}} />
        </div>
       </WidgetDisclosure>

       <WidgetDisclosure title="Licensing & Distribution">
        <div className="flex flex-col gap-2 p-2">
         <WidgetChoice label="Standard YouTube License" checked={true} onChange={() => {}} />
         <WidgetChoice label="Allow Video Embedding" checked={true} onChange={() => {}} />
        </div>
       </WidgetDisclosure>
      </div>

      <article className="widget-selection-card">
       <div className="w-12 h-8 bg-black/10 rounded flex items-center justify-center">
        <FileVideo2 size={18} />
       </div>
       <div>
        <span>Active Published Video</span>
        <strong>How to Build Full-Stack AI Workflows in 2026</strong>
        <small>ID: vid_9942a · 42.8K views</small>
       </div>
      </article>
     </WidgetSection>
    )}
   </WidgetScrollArea>

   {/* Fixed Widget Footer Toolbar */}
   <WidgetFooter className="widget-toolbar widget-workflow-toolbar">
    <div className="flex items-center gap-2">
     <span className="text-[10px] font-mono font-black uppercase text-black/60">UI Reference Library v2.0</span>
    </div>
    <div className="flex items-center justify-end gap-2">
     <WidgetSplitButton tone="primary" icon={<Check size={14} />}>
      Standard Compliant
     </WidgetSplitButton>
    </div>
   </WidgetFooter>
  </WidgetShell>
 )
}
