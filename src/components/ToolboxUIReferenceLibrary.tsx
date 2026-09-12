import React, { useState } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  FileOutput,
  FormInput,
  Layers3,
  Menu,
  MousePointerClick,
  Sparkles,
  Upload,
} from "lucide-react"
import {
  SubToolbox,
  SubToolboxDropdownControl,
  SubToolboxDropdownTopTitleControl,
  SubToolboxGridActionButton,
  SubToolboxInnerActionButton,
  ToolboxScaffold,
} from "./Toolbox"
import { SubToolboxActions, SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "./subtoolbox/SubToolboxLayouts"
import {
  SubToolboxButton,
  SubToolboxFieldLabel,
  SubToolboxFileTarget,
  SubToolboxInput,
  SubToolboxMetric,
  SubToolboxOutputCard,
  SubToolboxSelect,
  SubToolboxStatePanel,
  SubToolboxSurface,
  SubToolboxTextArea,
} from "./subtoolbox/SubToolboxPrimitives"
import type { SubToolboxState } from "./subtoolbox/tokens"
import { hexToRgba } from "./ToolboxUISystem"
import { getToolboxPaletteColors, VT_SPECTRUM_PALETTE_06 } from "../styles/toolboxPalette"

type ReferenceCategory = "all" | "shells" | "actions" | "fields" | "dropdowns" | "content" | "states"

const CATEGORIES: Array<{ id: ReferenceCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "shells", label: "Shells" },
  { id: "actions", label: "Buttons" },
  { id: "fields", label: "Fields" },
  { id: "dropdowns", label: "Menus" },
  { id: "content", label: "Outputs" },
  { id: "states", label: "States" },
]

const PALETTE_NAMES = [
  "Rose", "Coral", "Orange", "Yellow", "Lime", "Green",
  "Teal", "Cyan", "Royal", "Purple", "Magenta", "Pink",
] as const

const ACTION_TONES = ["pink", "orange", "yellow", "green", "cyan", "blue", "purple"] as const
const PRIMITIVE_TONES = ["accent", "neutral", "ink", "danger", "warning", "success"] as const
const DATA_STATES: SubToolboxState[] = ["loading", "ready", "empty", "blocked", "stale", "error"]

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
  const [privacy, setPrivacy] = useState("PUBLIC")
  const [format, setFormat] = useState("longform")
  const [destinations, setDestinations] = useState<string[]>(["youtube"])
  const [selectedState, setSelectedState] = useState<SubToolboxState>("ready")
  const [uploadedFile, setUploadedFile] = useState("No file selected")
  const [copied, setCopied] = useState(false)
  const palette = getToolboxPaletteColors(paletteIndex)
  const primitiveContextStyle = {
    ["--vt-subtoolbox-fill" as string]: palette.header,
    ["--vt-subtoolbox-shadow" as string]: hexToRgba(palette.header, 0.45),
  }
  const show = (category: ReferenceCategory) => activeCategory === "all" || activeCategory === category

  const toggleDestination = (value: string) => {
    setDestinations((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value])
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(description)
    setCopied(true)
  }

  return (
    <div id="toolbox-ui-library" className="scroll-mt-24">
      <ToolboxScaffold
        title="Toolbox UI Library"
        subtitle="Canonical toolbox shells, subtoolboxes, controls, outputs, states, and interaction patterns"
        icon={<Layers3 size={40} strokeWidth={3} />}
        paletteIndex={paletteIndex}
        collapsible={collapsible}
        isOpen={isOpen}
        onToggle={() => setIsOpen((current) => !current)}
        unmountWhenClosed
        helpText="A live production component library for building every Studio Hub toolbox from the same tokens, geometry, palette, and behavior."
        headerActions={
          <div className="flex items-center gap-2" style={primitiveContextStyle}>
            <SubToolboxButton
              size="compact"
              tone="neutral"
              aria-label="Previous toolbox palette"
              icon={<ChevronLeft size={16} strokeWidth={3} />}
              className="!w-9"
              onClick={(event) => {
                event.stopPropagation()
                setPaletteIndex((current) => (current + 11) % 12)
              }}
            />
            <span className="hidden min-w-16 text-center text-[9px] font-black uppercase sm:block">
              {PALETTE_NAMES[paletteIndex]}
            </span>
            <SubToolboxButton
              size="compact"
              tone="neutral"
              aria-label="Next toolbox palette"
              icon={<ChevronRight size={16} strokeWidth={3} />}
              className="!w-9"
              onClick={(event) => {
                event.stopPropagation()
                setPaletteIndex((current) => (current + 1) % 12)
              }}
            />
          </div>
        }
      >
        <SubToolboxStack density="comfortable" style={primitiveContextStyle}>
          <SubToolboxSurface tone="subtle">
            <SubToolboxStack density="dense">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-xs font-black uppercase tracking-wider">Reference Category</strong>
                <span className="text-[9px] font-black uppercase opacity-50">Production components · 12 palettes</span>
              </div>
              <SubToolboxGrid minItemWidth="compact" density="dense" aria-label="Toolbox reference category">
                {CATEGORIES.map((category) => (
                  <SubToolboxButton
                    key={category.id}
                    size="compact"
                    tone={activeCategory === category.id ? "ink" : "neutral"}
                    selected={activeCategory === category.id}
                    aria-pressed={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </SubToolboxButton>
                ))}
              </SubToolboxGrid>
              <div className="flex flex-wrap gap-1" aria-label="ViewTube toolbox palette">
                {VT_SPECTRUM_PALETTE_06.map((color, index) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${PALETTE_NAMES[index]} palette`}
                    aria-pressed={paletteIndex === index}
                    onClick={() => setPaletteIndex(index)}
                    className="h-6 w-6 rounded-[4px] border-2 border-black transition-transform hover:-translate-y-0.5 aria-pressed:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </SubToolboxStack>
          </SubToolboxSurface>

          {show("shells") ? (
            <SubToolbox
              title="Shell System"
              subtitle="Permanent divider, colored transparent shadow, matching header radii, and 300ms collapse"
              icon={<Layers3 />}
              paletteIndex={paletteIndex + 1}
              collapsible
              isOpenInitial
              helpText="The standard shell is the default nested module. Compact mode reduces stroke, radius, shadow, and header height together."
            >
              <SubToolboxGrid minItemWidth="wide">
                <SubToolbox title="Standard Module" icon={<Layers3 />} paletteIndex={paletteIndex + 7} collapsible={false} openUnits={1}>
                  <p className="text-sm font-bold">56px header · 4px stroke · 12px radius · 6px colored shadow</p>
                </SubToolbox>
                <SubToolbox title="Compact Module" icon={<Layers3 />} paletteIndex={paletteIndex + 8} collapsible={false} openUnits={1} heightMode="compact">
                  <p className="text-sm font-bold">44px header · 3px stroke · 10px radius · 4px colored shadow</p>
                </SubToolbox>
              </SubToolboxGrid>
            </SubToolbox>
          ) : null}

          {show("actions") ? (
            <SubToolbox title="Buttons + Split Left" icon={<MousePointerClick />} paletteIndex={paletteIndex + 2} collapsible isOpenInitial>
              <SubToolboxStack density="comfortable">
                <SubToolboxSection label="Primitive Button Tones">
                  <SubToolboxGrid minItemWidth="compact">
                    {PRIMITIVE_TONES.map((tone) => (
                      <SubToolboxButton key={tone} tone={tone}>{tone}</SubToolboxButton>
                    ))}
                  </SubToolboxGrid>
                </SubToolboxSection>
                <SubToolboxSection label="Split-Left Module Actions · 4px">
                  <SubToolboxGrid minItemWidth="wide">
                    {ACTION_TONES.map((tone) => (
                      <SubToolboxGridActionButton key={tone} label={tone} iconName="zap" tone={tone} showIconSection onClick={() => {}} />
                    ))}
                  </SubToolboxGrid>
                </SubToolboxSection>
                <SubToolboxSection label="Split-Left Interior Actions · 3px">
                  <SubToolboxGrid minItemWidth="wide">
                    <SubToolboxInnerActionButton label="Generate" iconName="sparkles" tone="cyan" showIconSection onClick={() => {}} />
                    <SubToolboxInnerActionButton label="Publish" iconName="check" tone="green" showIconSection onClick={() => {}} />
                    <SubToolboxInnerActionButton label="Disabled" iconName="archive" tone="purple" showIconSection disabled onClick={() => {}} />
                  </SubToolboxGrid>
                </SubToolboxSection>
                <SubToolboxActions columns={2}>
                  <SubToolboxButton size="action" tone="success" icon={<Check size={20} />}>Primary Action</SubToolboxButton>
                  <SubToolboxButton size="action" tone="neutral" icon={<Clipboard size={20} />}>Secondary Action</SubToolboxButton>
                </SubToolboxActions>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("fields") ? (
            <SubToolbox title="Fields + Text Inputs" icon={<FormInput />} paletteIndex={paletteIndex + 3} collapsible isOpenInitial>
              <SubToolboxStack>
                <SubToolboxGrid minItemWidth="wide">
                  <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="toolbox-library-title">Standard Input</SubToolboxFieldLabel>}>
                    <SubToolboxInput id="toolbox-library-title" value={textValue} onChange={(event) => setTextValue(event.target.value)} />
                  </SubToolboxSection>
                  <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="toolbox-library-search">Search Input</SubToolboxFieldLabel>}>
                    <SubToolboxInput id="toolbox-library-search" type="search" placeholder="Search videos…" />
                  </SubToolboxSection>
                  <SubToolboxSection label="Invalid State">
                    <SubToolboxInput aria-label="Invalid field example" aria-invalid="true" value="Required value" readOnly />
                  </SubToolboxSection>
                  <SubToolboxSection label="Disabled State">
                    <SubToolboxInput aria-label="Disabled field example" value="Unavailable" disabled readOnly />
                  </SubToolboxSection>
                </SubToolboxGrid>
                <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="toolbox-library-copy">Text Area</SubToolboxFieldLabel>}>
                  <SubToolboxTextArea id="toolbox-library-copy" value={description} onChange={(event) => setDescription(event.target.value)} />
                </SubToolboxSection>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("dropdowns") ? (
            <SubToolbox title="Dropdown Menus" icon={<Menu />} paletteIndex={paletteIndex + 4} collapsible isOpenInitial overflowVisible>
              <SubToolboxStack density="comfortable">
                <SubToolboxGrid minItemWidth="wide">
                  <SubToolboxDropdownControl label="Privacy" value={privacy} options={["PUBLIC", "UNLISTED", "PRIVATE"]} onChange={setPrivacy} tone="orange" />
                  <SubToolboxDropdownTopTitleControl label="Format" value={format.toUpperCase()} options={[{ value: "longform", label: "LONGFORM" }, { value: "shorts", label: "SHORTS" }, { value: "live", label: "LIVE" }]} onChange={setFormat} tone="cyan" />
                  <SubToolboxDropdownTopTitleControl label="Destinations" value={`${destinations.length} SELECTED`} options={[{ value: "youtube", label: "YOUTUBE" }, { value: "shorts", label: "SHORTS FEED" }, { value: "community", label: "COMMUNITY" }]} onChange={toggleDestination} multiSelect selectedValues={destinations} tone="green" />
                  <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="toolbox-library-native-select">Compact Select</SubToolboxFieldLabel>}>
                    <SubToolboxSelect id="toolbox-library-native-select" value={privacy} onChange={(event) => setPrivacy(event.target.value)}>
                      <option>PUBLIC</option>
                      <option>UNLISTED</option>
                      <option>PRIVATE</option>
                    </SubToolboxSelect>
                  </SubToolboxSection>
                </SubToolboxGrid>
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("content") ? (
            <SubToolbox title="Outputs + Data Surfaces" icon={<FileOutput />} paletteIndex={paletteIndex + 5} collapsible isOpenInitial>
              <SubToolboxStack density="comfortable">
                <SubToolboxGrid minItemWidth="compact">
                  <SubToolboxMetric label="Views" value="48.2K" accentColor="#36E0F6" />
                  <SubToolboxMetric label="AVP" value="72%" accentColor="#C0F240" />
                  <SubToolboxMetric label="CTR" value="4.8%" accentColor="#FFDA47" />
                  <SubToolboxMetric label="Revenue" value="$84" accentColor="#3FEE56" />
                </SubToolboxGrid>
                <SubToolboxGrid minItemWidth="wide">
                  <SubToolboxSurface tone="white"><strong className="text-xs font-black uppercase">White Surface</strong><p className="mt-2 text-sm font-bold">Default readable content.</p></SubToolboxSurface>
                  <SubToolboxSurface tone="subtle"><strong className="text-xs font-black uppercase">Subtle Surface</strong><p className="mt-2 text-sm font-bold">Low-emphasis grouping.</p></SubToolboxSurface>
                  <SubToolboxSurface tone="accent"><strong className="text-xs font-black uppercase">Accent Surface</strong><p className="mt-2 text-sm font-bold">Highlighted information.</p></SubToolboxSurface>
                </SubToolboxGrid>
                <SubToolboxOutputCard
                  title="Generated Description"
                  icon={<FileOutput size={18} />}
                  accentColor={palette.header}
                  action={
                    <div className="flex items-center gap-2">
                      <span className="rounded-[4px] bg-black px-2 py-1 text-[9px] font-black uppercase text-white">Ready</span>
                      <SubToolboxButton aria-label="Copy generated description" size="compact" tone="ink" icon={copied ? <Check size={16} /> : <Clipboard size={16} />} onClick={copyOutput} className="!w-10" />
                    </div>
                  }
                >
                  <p className="whitespace-pre-wrap text-sm font-bold leading-relaxed">{description}</p>
                </SubToolboxOutputCard>
                <SubToolboxFileTarget label={uploadedFile} icon={<Upload size={28} strokeWidth={3} />} accept="video/*,image/*" onFiles={(files) => setUploadedFile(files?.[0]?.name || "No file selected")} />
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          {show("states") ? (
            <SubToolbox title="Interaction + Data States" icon={<Sparkles />} paletteIndex={paletteIndex + 6} collapsible isOpenInitial>
              <SubToolboxStack>
                <SubToolboxGrid minItemWidth="compact" density="dense" aria-label="State preview">
                  {DATA_STATES.map((state) => (
                    <SubToolboxButton key={state} size="compact" tone={selectedState === state ? "ink" : "neutral"} selected={selectedState === state} aria-pressed={selectedState === state} onClick={() => setSelectedState(state)}>{state}</SubToolboxButton>
                  ))}
                </SubToolboxGrid>
                <SubToolboxStatePanel
                  state={selectedState}
                  message={selectedState === "ready" ? "The canonical toolbox component system is ready." : undefined}
                  action={(selectedState === "blocked" || selectedState === "error") ? <SubToolboxButton size="compact" tone="neutral" onClick={() => setSelectedState("ready")}>Recover</SubToolboxButton> : undefined}
                />
              </SubToolboxStack>
            </SubToolbox>
          ) : null}

          <SubToolboxSurface tone="subtle" className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider">Toolbox UI Library v1 · canonical Studio Hub reference</span>
            <span className="text-[10px] font-black uppercase opacity-55">4px shell · 3px interior · 12/8px radii · colored shadows</span>
          </SubToolboxSurface>
        </SubToolboxStack>
      </ToolboxScaffold>
    </div>
  )
}

export default ToolboxUIReferenceLibrary
