import React from "react"
import { Lightbulb, Minus, Plus, Settings2 } from "lucide-react"
import {
  HardcodedGenericControl,
  STUDIO_HUB_COMPONENT_FAMILIES,
  type StudioHubComponentLevel,
} from "./StudioHubCompletePrimitiveCatalog"
import {
  SubToolboxBadge,
  SubToolboxButton,
  SubToolboxCheckControl,
  SubToolboxIconButton,
  SubToolboxInput,
  SubToolboxRadioControl,
  SubToolboxSegmentedToggle,
  SubToolboxStatusBadge,
  SubToolboxStepper,
  SubToolboxTag,
  SubToolboxTextArea,
  SubToolboxToggleSwitch,
  SubToolboxTooltip,
} from "../subtoolbox/SubToolboxPrimitives"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import "./studio-hub-complete-primitive-catalog.css"

const LEVELS: StudioHubComponentLevel[] = ["l0", "l1", "l2"]

export const STUDIO_HUB_MIGRATED_FAMILIES = [
  "Primary Button",
  "Secondary Button",
  "Neutral Button",
  "Destructive Button",
  "Square Icon Button",
  "Text Input",
  "Textarea",
  "Stepper",
  "Toggle",
  "Checkbox",
  "Radio",
  "Segmented Choice",
  "Tag",
  "Badge",
  "Status Badge",
  "Tooltip",
] as const

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
  const [stepperValue, setStepperValue] = React.useState(5)
  const [toggleOn, setToggleOn] = React.useState(true)
  const [checkboxOn, setCheckboxOn] = React.useState(true)
  const [radioOn, setRadioOn] = React.useState(true)
  const [segmentChoice, setSegmentChoice] = React.useState("A")

  // Wave 02: these families are now rendered by production primitives + shared
  // CSS. All remaining families deliberately fall back to the frozen catalog
  // renderer until visual parity is certified.
  if (name === "Primary Button" || name === "Secondary Button" || name === "Neutral Button" || name === "Destructive Button") {
    return <SubToolboxButton level={level} style={style}>{name.replace(" Button", "")}</SubToolboxButton>
  }
  if (name === "Square Icon Button") {
    return <SubToolboxIconButton level={level} style={style} icon={<Settings2 />} ariaLabel="Settings" />
  }
  if (name === "Text Input") {
    return <SubToolboxInput level={level} style={style} type="text" defaultValue="TEXT INPUT" />
  }
  if (name === "Textarea") {
    return <SubToolboxTextArea level={level} style={style} defaultValue="DESCRIPTION" />
  }
  if (name === "Stepper") {
    return <SubToolboxStepper level={level} style={style} value={stepperValue} decreaseIcon={<Minus />} increaseIcon={<Plus />} onDecrease={() => setStepperValue((value) => value - 1)} onIncrease={() => setStepperValue((value) => value + 1)} />
  }
  if (name === "Toggle") {
    return <SubToolboxToggleSwitch level={level} style={style} pressed={toggleOn} aria-label="Toggle" onClick={() => setToggleOn((value) => !value)} />
  }
  if (name === "Checkbox") {
    return <SubToolboxCheckControl level={level} style={style} checked={checkboxOn} aria-label="Checkbox" onClick={() => setCheckboxOn((value) => !value)} />
  }
  if (name === "Radio") {
    return <SubToolboxRadioControl level={level} style={style} checked={radioOn} aria-label="Radio" onClick={() => setRadioOn((value) => !value)} />
  }
  if (name === "Segmented Choice") {
    return <SubToolboxSegmentedToggle level={level} style={{ ...style, ["--vt-segment-count" as string]: 3 }} options={[{ value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} value={segmentChoice} onValueChange={setSegmentChoice} />
  }
  if (name === "Tag") {
    return <SubToolboxTag level={level} style={style}>NAPOLEON</SubToolboxTag>
  }
  if (name === "Badge") {
    return <SubToolboxBadge level={level} style={style}>BADGE</SubToolboxBadge>
  }
  if (name === "Status Badge") {
    return <SubToolboxStatusBadge level={level} style={style}>READY</SubToolboxStatusBadge>
  }
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
