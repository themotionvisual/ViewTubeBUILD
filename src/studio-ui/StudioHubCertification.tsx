import React from "react"
import { Check, Link2, Search, Settings2, Sparkles } from "lucide-react"
import { SubToolbox } from "../components/Toolbox"
import { SubToolboxSection, SubToolboxStack, SubToolboxGrid } from "../components/subtoolbox/SubToolboxLayouts"
import { SubToolboxFieldLabel, SubToolboxSurface } from "../components/subtoolbox/SubToolboxPrimitives"
import { StudioDropdown } from "./primitives/StudioDropdown"
import {
  StudioButton,
  StudioIconButton,
  StudioInput,
  StudioSearchInput,
  StudioSplitLeftButton,
  StudioTextArea,
} from "./primitives/StudioControls"
import { STUDIO_PALETTE } from "./palette"

const DROPDOWN_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "unlisted", label: "Unlisted" },
  { value: "private", label: "Private" },
]

export const StudioHubCertification: React.FC = () => {
  const [privacy, setPrivacy] = React.useState("public")

  return (
    <SubToolbox title="Studio Hub Certification" icon={<Settings2 />} collapsible isOpenInitial paletteIndex={7} overflowVisible>
      <SubToolboxStack density="comfortable">
        <SubToolboxSurface tone="subtle">
          <p className="text-[10px] font-black uppercase tracking-wider">
            Canonical Studio controls only · widget CSS must not own any specimen below
          </p>
        </SubToolboxSurface>

        <SubToolboxSection label="12-color inheritance">
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
            {STUDIO_PALETTE.map((color, index) => (
              <div key={color} title={`Palette ${index + 1}`} className="aspect-square rounded-[4px] border-2 border-black" style={{ backgroundColor: color }} />
            ))}
          </div>
        </SubToolboxSection>

        <SubToolboxSection label="Inputs">
          <SubToolboxGrid minItemWidth="wide">
            <StudioInput aria-label="Standard input specimen" defaultValue="Standard 48px field" />
            <StudioSearchInput aria-label="Search input specimen" placeholder="Search videos…" />
            <StudioInput aria-label="Disabled input specimen" value="Disabled" disabled readOnly />
          </SubToolboxGrid>
          <SubToolboxFieldLabel htmlFor="studio-cert-textarea">Textarea</SubToolboxFieldLabel>
          <StudioTextArea id="studio-cert-textarea" defaultValue="Textarea shares the same structural border, radius, accent focus outline and colored shadow." />
        </SubToolboxSection>

        <SubToolboxSection label="Dropdowns">
          <SubToolboxGrid minItemWidth="wide">
            <StudioDropdown id="studio-cert-dropdown" ariaLabel="Privacy" value={privacy} options={DROPDOWN_OPTIONS} onChange={setPrivacy} />
            <StudioDropdown ariaLabel="Disconnected video selector" value="" options={[]} connectionMessage="Connect your YouTube channel to load videos" />
          </SubToolboxGrid>
        </SubToolboxSection>

        <SubToolboxSection label="Registered button sizes">
          <SubToolboxGrid minItemWidth="compact">
            <StudioButton sizeVariant="compact">Compact</StudioButton>
            <StudioButton sizeVariant="standard">Standard</StudioButton>
            <StudioButton sizeVariant="action">Action</StudioButton>
            <StudioButton sizeVariant="standard" selected>Selected</StudioButton>
            <StudioButton sizeVariant="standard" disabled>Disabled</StudioButton>
            <StudioButton sizeVariant="standard" loading>Loading</StudioButton>
          </SubToolboxGrid>
        </SubToolboxSection>

        <SubToolboxSection label="Semantic appearances">
          <SubToolboxGrid minItemWidth="compact">
            <StudioButton tone="accent">Primary</StudioButton>
            <StudioButton tone="neutral">Neutral</StudioButton>
            <StudioButton tone="warning">Warning</StudioButton>
            <StudioButton tone="success">Success</StudioButton>
            <StudioButton tone="danger">Danger</StudioButton>
          </SubToolboxGrid>
        </SubToolboxSection>

        <SubToolboxSection label="Icon + split-left">
          <SubToolboxGrid minItemWidth="wide">
            <div className="flex gap-3">
              <StudioIconButton label="Search" icon={<Search size={18} />} />
              <StudioIconButton label="Confirm" tone="success" icon={<Check size={18} />} />
            </div>
            <StudioSplitLeftButton icon={<Sparkles size={22} />}>Generate</StudioSplitLeftButton>
            <StudioSplitLeftButton tone="success" icon={<Link2 size={22} />}>Connect Channel</StudioSplitLeftButton>
          </SubToolboxGrid>
        </SubToolboxSection>
      </SubToolboxStack>
    </SubToolbox>
  )
}

export default StudioHubCertification
