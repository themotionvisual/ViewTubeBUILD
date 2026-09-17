import React, { useState } from "react"
import { ChevronLeft, ChevronRight, Layers3 } from "lucide-react"
import { ToolboxScaffold } from "./Toolbox"
import { SubToolboxButton } from "./subtoolbox/SubToolboxPrimitives"
import { getToolboxPaletteColors } from "../styles/toolboxPalette"
import { StudioHubCompletePrimitiveCatalog } from "./studio-hub/StudioHubCompletePrimitiveCatalog"

const PALETTE_NAMES = [
  "Rose", "Coral", "Orange", "Yellow", "Lime", "Green",
  "Teal", "Cyan", "Royal", "Purple", "Magenta", "Pink",
] as const

export interface ToolboxUIReferenceLibraryProps {
  collapsible?: boolean
  isOpenInitial?: boolean
  paletteIndex?: number
}

/**
 * Production certification surface for the Studio Hub UI system.
 *
 * This component intentionally renders the complete canonical catalog rather
 * than maintaining a second hand-authored subset of primitives. New reusable
 * families belong in StudioHubCompletePrimitiveCatalog and therefore appear in
 * this toolbox automatically.
 */
export const ToolboxUIReferenceLibrary: React.FC<ToolboxUIReferenceLibraryProps> = ({
  collapsible = true,
  isOpenInitial = false,
  paletteIndex: initialPaletteIndex = 7,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitial)
  const [paletteIndex, setPaletteIndex] = useState(initialPaletteIndex)
  const palette = getToolboxPaletteColors(paletteIndex)
  const primitiveContextStyle = {
    ["--vt-subtoolbox-fill" as string]: palette.header,
  } as React.CSSProperties

  return (
    <div id="toolbox-ui-library" className="scroll-mt-24 vt-studio-hub-component-library">
      {/*
        Hierarchy repair: toolbox-system.css had regressed the main level to
        56px, making top-level toolboxes visually identical to subtoolboxes.
        Main Toolbox authority is 80/5/16/10; nested SubToolbox remains 56px.
      */}
      <style>{`
        .vt-studio-hub-component-library [data-vt-toolbox][data-vt-toolbox-level="main"] {
          --vt-toolbox-header-height: 80px !important;
          --vt-toolbox-stroke: 5px !important;
          --vt-toolbox-radius: 16px !important;
          --vt-toolbox-shadow-offset: 10px !important;
          --vt-toolbox-title-size: 26px !important;
        }
        .vt-studio-hub-component-library [data-vt-toolbox][data-vt-toolbox-level="main"]:not([data-vt-toolbox-variant="accordion"]) > header {
          height: 80px !important;
          min-height: 80px !important;
          max-height: 80px !important;
        }
        .vt-studio-hub-component-library [data-vt-toolbox][data-vt-toolbox-level="main"]:not([data-vt-toolbox-variant="accordion"]) > header > :first-child > :first-child {
          width: 80px !important;
          min-width: 80px !important;
          height: 80px !important;
          flex-basis: 80px !important;
        }
        .vt-studio-hub-component-library [data-vt-toolbox][data-vt-toolbox-level="main"]:not([data-vt-toolbox-variant="accordion"]) > header h1 {
          font-size: 26px !important;
          line-height: .92 !important;
        }
      `}</style>

      <ToolboxScaffold
        title="Studio Hub Component Library"
        subtitle="Complete canonical component, primitive, size, state, palette, asset and controller certification surface"
        icon={<Layers3 size={40} strokeWidth={3} />}
        paletteIndex={paletteIndex}
        collapsible={collapsible}
        isOpen={isOpen}
        onToggle={() => setIsOpen((current) => !current)}
        unmountWhenClosed
        helpText="The Studio Hub Component Library is the production authority. Every reusable family is rendered at L0, L1 and L2. Feature tools consume these primitives instead of redefining their geometry."
        headerActions={
          <div className="flex items-center gap-1" style={primitiveContextStyle}>
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
            <span className="hidden min-w-14 text-center text-[9px] font-black uppercase sm:block">
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
        <StudioHubCompletePrimitiveCatalog />
      </ToolboxScaffold>
    </div>
  )
}

export default ToolboxUIReferenceLibrary
