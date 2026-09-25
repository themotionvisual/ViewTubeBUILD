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
          ? "Component Library — Hardcoded"
          : "Component Library — Primitive"}
        subtitle={isHardcoded
          ? "Frozen visual baseline. Component anatomy remains hardcoded for comparison."
          : "Production-import surface. Every family renders inside the same SubToolbox shell, 12-color title/icon pairing, primitives and shared CSS used by Studio tools."}
        icon={<Layers3 size={40} strokeWidth={3} />}
        paletteIndex={paletteIndex}
        collapsible={collapsible}
        isOpen={isOpen}
        onToggle={() => setIsOpen((current) => !current)}
        unmountWhenClosed
        helpText={isHardcoded
          ? "Frozen baseline used only to compare visual parity while the production primitive system is migrated."
          : "Primitive production track. Each family is mounted inside a real SubToolbox; nested components inherit that SubToolbox title/icon color pair and shared production styling instead of choosing local colors."}
        headerActions={
          <div className="flex items-center gap-1" style={primitiveContextStyle}>
            <SubToolboxIconButton
              level="l1"
              ariaLabel="Previous toolbox palette"
              icon={<ChevronLeft aria-hidden="true" />}
              className="vt-toolbox-header-palette-button"
              onClick={(event) => {
                event.stopPropagation()
                onPaletteIndexChange((paletteIndex + 11) % 12)
              }}
            />
            <span className="hidden min-w-14 text-center text-[9px] font-black uppercase sm:block">
              {PALETTE_NAMES[paletteIndex]}
            </span>
            <SubToolboxIconButton
              level="l1"
              ariaLabel="Next toolbox palette"
              icon={<ChevronRight aria-hidden="true" />}
              className="vt-toolbox-header-palette-button"
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
      {/* Geometry comes from the production Toolbox/SubToolbox token authority. */}
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
