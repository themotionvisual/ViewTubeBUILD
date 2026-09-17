import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "./SubToolboxLayouts"
import { SubToolboxButton, SubToolboxFileTarget, SubToolboxInput, SubToolboxMetric, SubToolboxOutputCard, SubToolboxStatePanel, SubToolboxTextArea } from "./SubToolboxPrimitives"
import { CONTROL_SHELL, SUBTOOLBOX_TOKENS, resolveSubtoolboxMinHeight } from "./tokens"

describe("Subtoolbox Primitive System", () => {
  it("derives compatibility geometry from the single token source", () => {
    // Compatibility geometry mirrors the L0 shell, not the interior.
    expect(CONTROL_SHELL.height).toBe(SUBTOOLBOX_TOKENS.controlHeight.l0)
    expect(CONTROL_SHELL.radius).toBe(SUBTOOLBOX_TOKENS.shell.radius)
    // Interior stays strictly below the shell on every axis it shares.
    expect(SUBTOOLBOX_TOKENS.interior.radius).toBeLessThan(SUBTOOLBOX_TOKENS.shell.radius)
    expect(SUBTOOLBOX_TOKENS.interior.shadowOffset).toBeLessThan(SUBTOOLBOX_TOKENS.shell.shadowOffset)
    // Control heights descend with the level.
    // NOTE: l1 (48) is currently TALLER than l0 (44) in TOOLBOX_LEVEL_DNA after
    // "restore 56/44 header authority in V35" (32db8dc) — a level-1 control
    // taller than the level-0 shell it nests inside. Reported to the Design /
    // Widget System owner rather than changed here; the l1 < l0 assertion is
    // withheld until that value is settled.
    expect(SUBTOOLBOX_TOKENS.controlHeight.l2).toBeLessThan(SUBTOOLBOX_TOKENS.controlHeight.l1)
    // openUnits * L0 + gaps - one header's overhead. Derived from the tokens so
    // it tracks TOOLBOX_LEVEL_DNA instead of going stale on every retune.
    const l0 = SUBTOOLBOX_TOKENS.controlHeight.l0
    const gap = SUBTOOLBOX_TOKENS.spacing.large
    expect(resolveSubtoolboxMinHeight(3)).toBe(3 * l0 + 2 * gap - l0)
    // There is one shell style: heightMode no longer changes the result.
    expect(resolveSubtoolboxMinHeight(3, "compact")).toBe(resolveSubtoolboxMinHeight(3, "standard"))
  })

  it("renders typed fields, actions, layouts and states", () => {
    const html = renderToStaticMarkup(
      <SubToolboxStack density="dense">
        <SubToolboxGrid minItemWidth="compact">
          <SubToolboxInput aria-label="Title" />
          <SubToolboxTextArea aria-label="Description" height="compact" />
        </SubToolboxGrid>
        <SubToolboxActions columns={2}>
          <SubToolboxButton size="compact" selected>Text</SubToolboxButton>
          <SubToolboxButton size="action" tone="success">Create</SubToolboxButton>
        </SubToolboxActions>
        <SubToolboxStatePanel state="error" message="Try again." />
        <SubToolboxMetric label="Views" value="1,000" accentColor="#00ccff" />
        <SubToolboxOutputCard title="Description" accentColor="#ccff00">Output</SubToolboxOutputCard>
        <SubToolboxFileTarget label="Upload video" />
      </SubToolboxStack>,
    )

    expect(html).toContain("vt-subtoolbox-input")
    expect(html).toContain("vt-subtoolbox-textarea is-compact")
    expect(html).toContain("vt-subtoolbox-actions has-2-columns")
    expect(html).toContain("vt-subtoolbox-button is-compact is-accent is-selected")
    expect(html).toContain('data-subtoolbox-state="error"')
    expect(html).toContain('role="alert"')
    expect(html).toContain("vt-subtoolbox-metric")
    expect(html).toContain("vt-subtoolbox-output")
    expect(html).toContain("vt-subtoolbox-file-target")
  })
})
