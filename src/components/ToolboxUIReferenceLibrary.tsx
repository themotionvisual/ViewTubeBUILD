import React, { useState } from "react"
import {
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  FileOutput,
  FormInput,
  Layers3,
  Menu,
  MousePointerClick,
  Settings,
  Sparkles,
  Upload,
  Video,
} from "lucide-react"
import {
  SubToolbox,
  SubToolboxGridActionButton,
  SubToolboxInnerActionButton,
  ToolboxScaffold,
} from "./Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "./subtoolbox/SubToolboxLayouts"
import {
  SubToolboxBadge,
  SubToolboxButton,
  SubToolboxCheckbox,
  SubToolboxFieldLabel,
  SubToolboxFileTarget,
  SubToolboxInput,
  SubToolboxOutputCard,
  SubToolboxRadio,
  SubToolboxStatePanel,
  SubToolboxSurface,
  SubToolboxTag,
  SubToolboxTextArea,
  SubToolboxToggle,
} from "./subtoolbox/SubToolboxPrimitives"
import {
  SubToolboxKpiCard,
  SubToolboxSplitButton,
  SubToolboxSplitDropdown,
} from "./subtoolbox/SubToolboxSplitPrimitives"
import type { SubToolboxState } from "./subtoolbox/tokens"
import { hexToRgba } from "./ToolboxUISystem"
import { getToolboxPaletteColors, VT_SPECTRUM_PALETTE_06 } from "../styles/toolboxPalette"

type ReferenceCategory = "all" | "hierarchy" | "actions" | "fields" | "dropdowns" | "content" | "states" | "recipes"

const CATEGORIES: Array<{ id: ReferenceCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "hierarchy", label: "Hierarchy" },
  { id: "actions", label: "Buttons" },
  { id: "fields", label: "Fields" },
  { id: "dropdowns", label: "Menus" },
  { id: "content", label: "Outputs" },
  { id: "states", label: "States" },
  { id: "recipes", label: "Recipes" },
]

const PALETTE_NAMES = [
  "Rose", "Coral", "Orange", "Yellow", "Lime", "Green",
  "Teal", "Cyan", "Royal", "Purple", "Magenta", "Pink",
] as const

const ACTION_TONES = ["pink", "orange", "yellow", "green", "cyan", "blue", "purple"] as const
const PRIMITIVE_TONES = ["accent", "neutral", "ink", "danger", "warning", "success"] as const
const DATA_STATES: SubToolboxState[] = ["loading", "ready", "empty", "blocked", "stale", "error"]
const RECIPE_NAMES = ["Video Selector", "Metadata Editor", "Tag Editor", "Media Upload", "Metric Strip", "Publish Actions"] as const

export interface ToolboxUIReferenceLibraryProps {
  collapsible?: boolean
  isOpenInitial?: boolean
  paletteIndex?: number
}

export const ToolboxUIReferenceLibrary: React.FC<ToolboxUIReferenceLibraryProps> = ({
  collapsible = true,
  isOpenInitial = false,
  paletteIndex: initialPaletteIndex = 7,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitial)
  const [activeCategory, setActiveCategory] = useState<ReferenceCategory>("all")
  const [paletteIndex, setPaletteIndex] = useState(initialPaletteIndex)
  const [textValue, setTextValue] = useState("Napoleon at Austerlitz")
  const [description, setDescription] = useState("A production-ready description uses the same field geometry everywhere.")
  const [privacy, setPrivacy] = useState("public")
  const [format, setFormat] = useState("longform")
  const [dataset, setDataset] = useState("videos")
  const [selectedState, setSelectedState] = useState<SubToolboxState>("ready")
  const [connectedPreview, setConnectedPreview] = useState(false)
  const [microToggle, setMicroToggle] = useState(true)
  const [microTag, setMicroTag] = useState(true)
  const [uploadedFile, setUploadedFile] = useState("No file selected")
  const [copied, setCopied] = useState(false)
  const palette = getToolboxPaletteColors(paletteIndex)
  const childPalette = getToolboxPaletteColors(paletteIndex + 4)
  const primitiveContextStyle = {
    ["--vt-subtoolbox-fill" as string]: palette.header,
    ["--vt-subtoolbox-shadow" as string]: hexToRgba(palette.header, 0.45),
  }
  const show = (category: ReferenceCategory) => activeCategory === "all" || activeCategory === category

  const copyOutput = async () => {
    await navigator.clipboard.writeText(description)
    setCopied(true)
  }

  return (
    <div id="toolbox-ui-library" className="scroll-mt-24">
      <ToolboxScaffold
        title="Studio Hub Component Library"
        subtitle="Canonical hierarchy, controls, states, recipes, responsive behavior, and 12-color inheritance"
        icon={<Layers3 size={40} strokeWidth={3} />}
        paletteIndex={paletteIndex}
        collapsible={collapsible}
        isOpen={isOpen}
        onToggle={() => setIsOpen((current) => !current)}
        unmountWhenClosed
        helpText="Studio Hub Component Library v2 is the certification surface for production toolbox UI. Feature tools choose canonical primitives and recipes instead of redefining geometry."
        headerActions={
          <div className="flex items-center gap-2" style={primitiveContextStyle}>
            <SubToolboxButton size="compact" tone="neutral" aria-label="Previous toolbox palette" icon={<ChevronLeft size={16} strokeWidth={3} />} className="!w-9" onClick={(event) => { event.stopPropagation(); setPaletteIndex((current) => (current + 11) % 12) }} />
            <span className="hidden min-w-16 text-center text-[9px] font-black uppercase sm:block">{PALETTE_NAMES[paletteIndex]}</span>
            <SubToolboxButton size="compact" tone="neutral" aria-label="Next toolbox palette" icon={<ChevronRight size={16} strokeWidth={3} />} className="!w-9" onClick={(event) => { event.stopPropagation(); setPaletteIndex((current) => (current + 1) % 12) }} />
          </div>
        }
      >
        <SubToolboxStack density="comfortable" style={primitiveContextStyle}>
          <SubToolboxSurface tone="subtle">
            <SubToolboxStack density="dense">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-xs font-black uppercase tracking-wider">Studio Hub Certification Surface</strong>
                <span className="text-[9px] font-black uppercase opacity-50">4 levels · 12 palettes · mobile-first</span>
              </div>
              <SubToolboxGrid minItemWidth="compact" density="dense" aria-label="Studio Hub reference category">
                {CATEGORIES.map((category) => (
                  <SubToolboxButton key={category.id} size="compact" tone={activeCategory === category.id ? "ink" : "neutral"} selected={activeCategory === category.id} aria-pressed={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}>{category.label}</SubToolboxButton>
                ))}
              </SubToolboxGrid>
              <div className="flex flex-wrap gap-1" aria-label="ViewTube toolbox palette">
                {VT_SPECTRUM_PALETTE_06.map((color, index) => (
                  <button key={color} type="button" aria-label={`Use ${PALETTE_NAMES[index]} palette`} aria-pressed={paletteIndex === index} onClick={() => setPaletteIndex(index)} className="h-6 w-6 rounded-[4px] border-2 border-black transition-transform hover:-translate-y-0.5 aria-pressed:scale-110" style={{ backgroundColor: color }} />
                ))}
              </div>
            </SubToolboxStack>
          </SubToolboxSurface>

          {show("hierarchy") ? (
            <SubToolbox title="Canonical Hierarchy" subtitle="Main Toolbox → Subtoolbox → Compact Subtoolbox → Interior Component" icon={<Layers3 />} paletteIndex={paletteIndex + 1} collapsible isOpenInitial>
              <SubToolboxStack>
                <SubToolboxSurface tone="accent"><strong className="text-sm font-black uppercase">Main Toolbox</strong><p className="mt-1 text-xs font-bold">80px header · 5px stroke · 16px radius · 10px colored shadow · 26px title</p></SubToolboxSurface>
                <SubToolboxGrid minItemWidth="wide">
                  <SubToolbox title="Standard Subtoolbox" icon={<Layers3 />} paletteIndex={paletteIndex + 7} collapsible={false} openUnits={1}><p className="text-sm font-bold">56px header · 4px stroke · 12px radius · 6px colored shadow · 20px title</p></SubToolbox>
                  <SubToolbox title="Compact Subtoolbox" icon={<Layers3 />} paletteIndex={paletteIndex + 8} collapsible={false} openUnits={1} heightMode="compact"><p className="text-sm font-bold">44px header · 3px stroke · 10px radius · 4px colored shadow · 20px title</p></SubToolbox>
                </SubToolboxGrid>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("actions") ? (
            <SubToolbox title="Buttons + Split Left" icon={<MousePointerClick />} paletteIndex={paletteIndex + 2} collapsible isOpenInitial>
              <SubToolboxStack density="comfortable">
                <SubToolboxSection label="Canonical Split Left · Master Data Tables Pattern">
                  <SubToolboxGrid minItemWidth="wide">
                    <SubToolboxSplitButton icon={<Settings size={21} strokeWidth={3} />} railColor={childPalette.icon} labelColor={childPalette.header}>Settings</SubToolboxSplitButton>
                    <SubToolboxSplitButton icon={<Check size={21} strokeWidth={3} />} railColor={childPalette.icon} labelColor={childPalette.header} selected>Selected · Reversed</SubToolboxSplitButton>
                  </SubToolboxGrid>
                  <p className="text-[10px] font-black uppercase opacity-60">48px square icon rail, 3px structural divider, parent color pair, colored shadow. Selected state reverses the pair.</p>
                </SubToolboxSection>
                <SubToolboxSection label="Legacy Tone Gallery · migration reference">
                  <SubToolboxGrid minItemWidth="wide">
                    {ACTION_TONES.map((tone) => <SubToolboxGridActionButton key={tone} label={tone} iconName="zap" tone={tone} showIconSection onClick={() => {}} />)}
                  </SubToolboxGrid>
                </SubToolboxSection>
                <SubToolboxSection label="Inside Subtoolbox Default · No Icon">
                  <SubToolboxGrid minItemWidth="wide">
                    <SubToolboxInnerActionButton label="Generate" tone="cyan" onClick={() => {}} />
                    <SubToolboxInnerActionButton label="Publish" tone="green" onClick={() => {}} />
                    <SubToolboxInnerActionButton label="Disabled" tone="purple" disabled onClick={() => {}} />
                  </SubToolboxGrid>
                </SubToolboxSection>
                <SubToolboxSection label="Micro Control Family · 26px">
                  <div className="flex flex-wrap items-center gap-1">
                    <SubToolboxButton size="micro" tone="accent">Button</SubToolboxButton>
                    <SubToolboxCheckbox label="Check" defaultChecked />
                    <SubToolboxToggle label="Toggle" pressed={microToggle} onClick={() => setMicroToggle((value) => !value)} />
                    <SubToolboxRadio label="Radio" name="library-radio" defaultChecked />
                    <SubToolboxBadge>Badge</SubToolboxBadge>
                    <SubToolboxTag selected={microTag} onClick={() => setMicroTag((value) => !value)}>Tag</SubToolboxTag>
                  </div>
                </SubToolboxSection>
                <SubToolboxSection label="Primitive Button Tones"><SubToolboxGrid minItemWidth="compact">{PRIMITIVE_TONES.map((tone) => <SubToolboxButton key={tone} tone={tone}>{tone}</SubToolboxButton>)}</SubToolboxGrid></SubToolboxSection>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("fields") ? (
            <SubToolbox title="Fields + Text Inputs" icon={<FormInput />} paletteIndex={paletteIndex + 3} collapsible isOpenInitial>
              <SubToolboxStack>
                <SubToolboxGrid minItemWidth="wide">
                  <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="toolbox-library-micro-title">26px Micro Input</SubToolboxFieldLabel>}><SubToolboxInput id="toolbox-library-micro-title" controlSize="micro" value={textValue} onChange={(event) => setTextValue(event.target.value)} /></SubToolboxSection>
                  <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="toolbox-library-title">48px Standard Input</SubToolboxFieldLabel>}><SubToolboxInput id="toolbox-library-title" value={textValue} onChange={(event) => setTextValue(event.target.value)} /></SubToolboxSection>
                  <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="toolbox-library-search">Search Input</SubToolboxFieldLabel>}><SubToolboxInput id="toolbox-library-search" type="search" placeholder="Search videos…" /></SubToolboxSection>
                  <SubToolboxSection label="Invalid State"><SubToolboxInput aria-label="Invalid field example" aria-invalid="true" value="Required value" readOnly /></SubToolboxSection>
                </SubToolboxGrid>
                <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="toolbox-library-copy">Text Area · subtle idle fill → white + thick accent focus</SubToolboxFieldLabel>}><SubToolboxTextArea id="toolbox-library-copy" value={description} onChange={(event) => setDescription(event.target.value)} /></SubToolboxSection>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("dropdowns") ? (
            <SubToolbox title="Dropdown Menus + Video Selector" icon={<Menu />} paletteIndex={paletteIndex + 4} collapsible isOpenInitial overflowVisible>
              <SubToolboxStack density="comfortable">
                <SubToolboxSection label="Split Left Dropdown · Master Data Tables Default">
                  <SubToolboxGrid minItemWidth="wide">
                    <SubToolboxSplitDropdown
                      ariaLabel="Dataset"
                      icon={<Layers3 size={21} strokeWidth={3} />}
                      railColor={childPalette.icon}
                      labelColor={childPalette.header}
                      value={dataset}
                      options={[
                        { value: "videos", label: "Videos", icon: <Video size={19} strokeWidth={3} /> },
                        { value: "playlists", label: "Playlists", icon: <Layers3 size={19} strokeWidth={3} /> },
                        { value: "formats", label: "Formats", icon: <Layers3 size={19} strokeWidth={3} /> },
                        { value: "retention", label: "Retentions", icon: <BarChart3 size={19} strokeWidth={3} /> },
                      ]}
                      onChange={setDataset}
                    />
                    <SubToolboxSplitDropdown
                      ariaLabel="Privacy"
                      icon={<Settings size={21} strokeWidth={3} />}
                      railColor={childPalette.icon}
                      labelColor={childPalette.header}
                      value={privacy}
                      options={[
                        { value: "public", label: "Public" },
                        { value: "unlisted", label: "Unlisted" },
                        { value: "private", label: "Private" },
                      ]}
                      onChange={setPrivacy}
                    />
                    <SubToolboxSplitDropdown
                      ariaLabel="Format"
                      icon={<Video size={21} strokeWidth={3} />}
                      railColor={childPalette.icon}
                      labelColor={childPalette.header}
                      value={format}
                      options={[
                        { value: "longform", label: "Longform" },
                        { value: "shorts", label: "Shorts" },
                        { value: "live", label: "Live" },
                      ]}
                      onChange={setFormat}
                    />
                  </SubToolboxGrid>
                  <p className="text-[10px] font-black uppercase opacity-60">Open menus are separate rounded modules: 5px below the trigger, full top and bottom corner radius, 3px black stroke and matching colored shadow.</p>
                </SubToolboxSection>
                <SubToolboxSection label="Connection-Aware Video Selector">
                  <SubToolboxSplitButton icon={<Video size={21} strokeWidth={3} />} railColor={childPalette.icon} labelColor={childPalette.header} selected={connectedPreview} onClick={() => setConnectedPreview((current) => !current)}>{connectedPreview ? "Select Video · Channel Connected" : "Connect YouTube Channel"}</SubToolboxSplitButton>
                </SubToolboxSection>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("content") ? (
            <SubToolbox title="Outputs + Data Surfaces" icon={<FileOutput />} paletteIndex={paletteIndex + 5} collapsible isOpenInitial>
              <SubToolboxStack density="comfortable">
                <SubToolboxSection label="Canonical KPI Cards · Master Data Tables Pattern">
                  <SubToolboxGrid minItemWidth="compact">
                    <SubToolboxKpiCard label="Rows" value="494" sublabel="Visible Records" icon={<BarChart3 size={17} strokeWidth={3} />} accentColor="#FF5D8F" railColor="#C0F240" />
                    <SubToolboxKpiCard label="Total Revenue" value="$478.05" sublabel="Avg $0.97" icon={<BarChart3 size={17} strokeWidth={3} />} accentColor="#FF806E" railColor="#3FEE56" />
                    <SubToolboxKpiCard label="Ad Revenue" value="$294.70" sublabel="Avg $0.60" icon={<BarChart3 size={17} strokeWidth={3} />} accentColor="#FFB158" railColor="#55DCC2" />
                  </SubToolboxGrid>
                </SubToolboxSection>
                <SubToolboxGrid minItemWidth="wide"><SubToolboxSurface tone="white"><strong className="text-xs font-black uppercase">White Surface</strong><p className="mt-2 text-sm font-bold">Default readable content.</p></SubToolboxSurface><SubToolboxSurface tone="subtle"><strong className="text-xs font-black uppercase">Subtle Surface</strong><p className="mt-2 text-sm font-bold">Low-emphasis grouping.</p></SubToolboxSurface><SubToolboxSurface tone="accent"><strong className="text-xs font-black uppercase">Accent Surface</strong><p className="mt-2 text-sm font-bold">Highlighted information.</p></SubToolboxSurface></SubToolboxGrid>
                <SubToolboxOutputCard title="Generated Description" icon={<FileOutput size={18} />} accentColor={palette.header} action={<div className="flex items-center gap-2"><span className="rounded-[4px] bg-black px-2 py-1 text-[9px] font-black uppercase text-white">Ready</span><SubToolboxButton aria-label="Copy generated description" size="compact" tone="ink" icon={copied ? <Check size={16} /> : <Clipboard size={16} />} onClick={copyOutput} className="!w-10" /></div>}><p className="whitespace-pre-wrap text-sm font-bold leading-relaxed">{description}</p></SubToolboxOutputCard>
                <SubToolboxSection label="Canonical Tight Reveal Upload · responsive 16:9"><SubToolboxFileTarget label={uploadedFile} icon={<Upload size={28} strokeWidth={3} />} accept="video/*,image/*" onFiles={(files) => setUploadedFile(files?.[0]?.name || "No file selected")} /></SubToolboxSection>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("states") ? (
            <SubToolbox title="Interaction + Data + Connection States" icon={<Sparkles />} paletteIndex={paletteIndex + 6} collapsible isOpenInitial>
              <SubToolboxStack>
                <SubToolboxGrid minItemWidth="compact" density="dense" aria-label="State preview">{DATA_STATES.map((state) => <SubToolboxButton key={state} size="compact" tone={selectedState === state ? "ink" : "neutral"} selected={selectedState === state} aria-pressed={selectedState === state} onClick={() => setSelectedState(state)}>{state}</SubToolboxButton>)}</SubToolboxGrid>
                <SubToolboxStatePanel state={selectedState} message={selectedState === "ready" ? "The canonical Studio Hub component system is ready." : undefined} action={(selectedState === "blocked" || selectedState === "error") ? <SubToolboxButton size="compact" tone="neutral" onClick={() => setSelectedState("ready")}>Recover</SubToolboxButton> : undefined} />
                <SubToolboxGrid minItemWidth="wide"><SubToolboxSurface tone="subtle"><strong className="text-xs font-black uppercase">Disconnected</strong><p className="mt-2 text-sm font-bold">Keep the complete tool visible. Connection gates data and actions, not layout.</p></SubToolboxSurface><SubToolboxSurface tone="accent"><strong className="text-xs font-black uppercase">Connected</strong><p className="mt-2 text-sm font-bold">Hydrate the same composition with channel data without swapping the interface.</p></SubToolboxSurface></SubToolboxGrid>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("recipes") ? (
            <SubToolbox title="Studio Hub Recipes" subtitle="Reusable compositions built only from certified primitives" icon={<Sparkles />} paletteIndex={paletteIndex + 7} collapsible isOpenInitial>
              <SubToolboxGrid minItemWidth="wide">{RECIPE_NAMES.map((recipe, index) => <SubToolboxSurface key={recipe} tone={index % 3 === 0 ? "accent" : index % 3 === 1 ? "subtle" : "white"}><strong className="text-xs font-black uppercase">{recipe}</strong><p className="mt-2 text-sm font-bold">Canonical recipe · responsive · palette-aware · state-aware</p></SubToolboxSurface>)}</SubToolboxGrid>
            </SubToolbox>
          ) : null}

          <SubToolboxSurface tone="subtle" className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider">Studio Hub Component Library v2 · canonical production reference</span>
            <span className="text-[10px] font-black uppercase opacity-55">80/56/44 hierarchy · 26/32/48/56 controls · split-left dropdowns · KPI cards · 12 palettes · mobile full width</span>
          </SubToolboxSurface>
        </SubToolboxStack>
      </ToolboxScaffold>
    </div>
  )
}

export default ToolboxUIReferenceLibrary