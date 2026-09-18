import React from "react"
import { Lightbulb } from "lucide-react"
import {
  HardcodedGenericControl,
  STUDIO_HUB_COMPONENT_FAMILIES,
  type StudioHubComponentLevel,
} from "./StudioHubCompletePrimitiveCatalog"
import { SubToolboxTooltip } from "../subtoolbox/SubToolboxPrimitives"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import "./studio-hub-complete-primitive-catalog.css"

const LEVELS: StudioHubComponentLevel[] = ["l0", "l1", "l2"]

export const STUDIO_HUB_MIGRATED_FAMILIES = ["Tooltip"] as const

const pair = (index: number) => ({
  a: VT_SPECTRUM_PALETTE_06[index % 12],
  b: VT_SPECTRUM_PALETTE_06[(index + 6) % 12],
})

const DemoShell: React.FC<{ level: StudioHubComponentLevel; children: React.ReactNode }> = ({ level, children }) => (
  <div className={`vt-catalog-demo is-${level}`} data-level={level}>{children}</div>
)

const PrimitiveMigrationControl: React.FC<{
  name: string
  level: StudioHubComponentLevel
  index: number
  paletteIndex: number
}> = ({ name, level, index, paletteIndex }) => {
  const levelOffset = level === "l0" ? 0 : level === "l1" ? 2 : 4
  const colors = pair(paletteIndex + levelOffset)
  const style = { "--pair-a": colors.a, "--pair-b": colors.b } as React.CSSProperties

  // Wave 01: Tooltip is the first family moved out of the catalog-specific
  // renderer and into the canonical primitive/CSS system. Every other family
  // intentionally falls back to the frozen hardcoded renderer until its own
  // visual parity pass is certified.
  if (name === "Tooltip") {
    return <SubToolboxTooltip level={level} forceOpen content="TOOLTIP" style={style} />
  }

  return (
    <HardcodedGenericControl
      name={name}
      level={level}
      index={index}
      paletteIndex={paletteIndex}
    />
  )
}

export interface StudioHubPrimitiveMigrationCatalogProps {
  paletteIndex?: number
}

export const StudioHubPrimitiveMigrationCatalog: React.FC<StudioHubPrimitiveMigrationCatalogProps> = ({
  paletteIndex = 7,
}) => (
  <section
    className="vt-complete-catalog"
    aria-labelledby="studio-hub-primitive-migration-catalog-title"
    data-palette-index={paletteIndex}
    data-vt-catalog-track="primitive-migration"
  >
    <header className="vt-complete-catalog-heading">
      <div>
        <Lightbulb />
        <div>
          <h2 id="studio-hub-primitive-migration-catalog-title">Complete Component + Primitive Catalog</h2>
          <p>Every reusable Studio Hub family rendered at L0, L1 and L2. Compact is retired.</p>
        </div>
      </div>
      <strong>{STUDIO_HUB_COMPONENT_FAMILIES.length} FAMILIES · {STUDIO_HUB_COMPONENT_FAMILIES.length * LEVELS.length} EXAMPLES</strong>
    </header>

    <div className="vt-complete-catalog-grid">
      {STUDIO_HUB_COMPONENT_FAMILIES.map((name, index) => (
        <article
          className="vt-catalog-family"
          key={name}
          data-vt-family={name}
          data-vt-migration-state={STUDIO_HUB_MIGRATED_FAMILIES.includes(name as (typeof STUDIO_HUB_MIGRATED_FAMILIES)[number]) ? "primitive" : "hardcoded-fallback"}
        >
          <h3><span>{String(index + 1).padStart(2, "0")}</span>{name}</h3>
          <div className="vt-catalog-levels">
            {LEVELS.map((level) => (
              <DemoShell level={level} key={level}>
                <PrimitiveMigrationControl
                  name={name}
                  level={level}
                  index={index}
                  paletteIndex={paletteIndex}
                />
              </DemoShell>
            ))}
          </div>
        </article>
      ))}
    </div>
  </section>
)

export default StudioHubPrimitiveMigrationCatalog
