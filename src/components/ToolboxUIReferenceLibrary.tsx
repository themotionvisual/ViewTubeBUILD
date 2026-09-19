import React, { useState } from "react"
import { ChevronLeft, ChevronRight, Layers3 } from "lucide-react"
import { ToolboxScaffold } from "./Toolbox"
import { SubToolboxButton } from "./subtoolbox/SubToolboxPrimitives"
import { getToolboxPaletteColors } from "../styles/toolboxPalette"
import { StudioHubCompletePrimitiveCatalog } from "./studio-hub/StudioHubCompletePrimitiveCatalog"
import { StudioHubPrimitiveMigrationCatalog } from "./studio-hub/StudioHubPrimitiveMigrationCatalog"

const PALETTE_NAMES = [
  "Rose", "Coral", "Orange", "Yellow", "Lime", "Green",
  "Teal", "Cyan", "Royal", "Purple", "Magenta", "Pink",
] as const

export interface ToolboxUIReferenceLibraryProps {
  collapsible?: boolean
  isOpenInitial?: boolean
  paletteIndex?: number
}

type LibraryTrack = "hardcoded" | "primitive"

interface ComponentLibraryTrackProps {
  track: LibraryTrack
  collapsible: boolean
  isOpenInitial: boolean
  paletteIndex: number
  onPaletteIndexChange: (index: number) => void
}

const ComponentLibraryTrack: React.FC<ComponentLibraryTrackProps> = ({
  track,
  collapsible,
  isOpenInitial,
  paletteIndex,
  onPaletteIndexChange,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitial)
  const palette = getToolboxPaletteColors(paletteIndex)
  const primitiveContextStyle = {
    ["--vt-subtoolbox-fill" as string]: palette.header,
  } as React.CSSProperties
  const isHardcoded = track === "hardcoded"

  return (
    <div
      id={isHardcoded ? "toolbox-ui-library-hardcoded" : "toolbox-ui-library-primitive"}
      className="scroll-mt-24 vt-studio-hub-component-library"
      data-vt-library-track={track}
    >
      <ToolboxScaffold
        title={isHardcoded
          ? "Studio Hub Component Library — Hardcoded"
          : "Studio Hub Component Library — Primitive"}
        subtitle={isHardcoded
          ? "Frozen visual baseline. Component anatomy remains hardcoded for comparison."
          : "Migration surface. Families move one-by-one to canonical primitives and shared CSS."}
        icon={<Layers3 size={40} strokeWidth={3} />}
        paletteIndex={paletteIndex}
        collapsible={collapsible}
        isOpen={isOpen}
        onToggle={() => setIsOpen((current) => !current)}
        unmountWhenClosed
        helpText={isHardcoded
          ? "Frozen baseline used only to compare visual parity while the production primitive system is migrated."
          : "Primitive migration copy. A family is moved only after it can match the frozen baseline through shared tokens, primitives and CSS."}
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
                onPaletteIndexChange((paletteIndex + 11) % 12)
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
                onPaletteIndexChange((paletteIndex + 1) % 12)
              }}
            />
          </div>
        }
      >
        {isHardcoded
          ? <StudioHubCompletePrimitiveCatalog paletteIndex={paletteIndex} />
          : <StudioHubPrimitiveMigrationCatalog paletteIndex={paletteIndex} />}
      </ToolboxScaffold>
    </div>
  )
}

/**
 * Dual-track Studio Hub UI certification surface.
 *
 * HARD-CODED remains frozen as a visual baseline.
 * PRIMITIVE is the migration surface. Families move there one at a time and
 * must stay visually aligned with the baseline before their catalog-specific
 * anatomy/CSS is retired.
 */
export const ToolboxUIReferenceLibrary: React.FC<ToolboxUIReferenceLibraryProps> = ({
  collapsible = true,
  isOpenInitial = false,
  paletteIndex: initialPaletteIndex = 7,
}) => {
  const [paletteIndex, setPaletteIndex] = useState(initialPaletteIndex)

  return (
    <div id="toolbox-ui-library" className="space-y-6" data-vt-library-comparison="true">
      {/*
        Preserve the existing Component Library shell geometry for both tracks.
        The dual-track migration changes ownership, not appearance.
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

      <ComponentLibraryTrack
        track="hardcoded"
        collapsible={collapsible}
        isOpenInitial={isOpenInitial}
        paletteIndex={paletteIndex}
        onPaletteIndexChange={setPaletteIndex}
      />
      <ComponentLibraryTrack
        track="primitive"
        collapsible={collapsible}
        isOpenInitial={isOpenInitial}
        paletteIndex={paletteIndex}
        onPaletteIndexChange={setPaletteIndex}
      />
    </div>
  )
}

export default ToolboxUIReferenceLibrary
