import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "./SubToolboxLayouts"
import { SubToolboxButton, SubToolboxFileTarget, SubToolboxInput, SubToolboxMetric, SubToolboxOutputCard, SubToolboxStatePanel, SubToolboxTextArea } from "./SubToolboxPrimitives"
import { CONTROL_SHELL, SUBTOOLBOX_CONTROL_SIZES, SUBTOOLBOX_STATES, SUBTOOLBOX_TOKENS, TOOLBOX_LEVEL_DNA, resolveSubtoolboxMinHeight } from "./tokens"

describe("Subtoolbox Primitive System", () => {
  it("derives compatibility geometry from the single token source", () => {
    // Compatibility geometry mirrors the L0 shell, not the interior.
    expect(CONTROL_SHELL.height).toBe(SUBTOOLBOX_TOKENS.controlHeight.l0)
    expect(CONTROL_SHELL.radius).toBe(SUBTOOLBOX_TOKENS.shell.radius)
    // Interior stays strictly below the shell on every axis it shares.
    expect(SUBTOOLBOX_TOKENS.interior.radius).toBeLessThan(SUBTOOLBOX_TOKENS.shell.radius)
    expect(SUBTOOLBOX_TOKENS.interior.shadowOffset).toBeLessThan(SUBTOOLBOX_TOKENS.shell.shadowOffset)
    // Control heights descend with the level.
    expect(SUBTOOLBOX_TOKENS.controlHeight.l2).toBeLessThan(SUBTOOLBOX_TOKENS.controlHeight.l1)
    expect(SUBTOOLBOX_TOKENS.controlHeight.l1).toBeLessThan(SUBTOOLBOX_TOKENS.controlHeight.l0)
    // openUnits * L0 + gaps - one header's overhead. Derived from the tokens so
    // it tracks TOOLBOX_LEVEL_DNA instead of going stale on every retune.
    const l0 = SUBTOOLBOX_TOKENS.controlHeight.l0
    const gap = SUBTOOLBOX_TOKENS.spacing.large
    expect(resolveSubtoolboxMinHeight(3)).toBe(3 * l0 + 2 * gap - l0)
    // There is one shell style: heightMode no longer changes the result.
    expect(resolveSubtoolboxMinHeight(3, "compact")).toBe(resolveSubtoolboxMinHeight(3, "standard"))
  })

  // 32db8dc lowered two levels of the ladder and left a third behind, which put
  // a level-1 control above the level-0 shell for weeks without failing a gate.
  // Assert the whole ladder, not one pair, so the next retune cannot repeat it.
  it("keeps every level-owned axis strictly descending", () => {
    const ladder = ["toolbox", "l0", "l1", "l2"] as const
    const axes = ["height", "stroke", "radius", "shadowOffset", "titleSize"] as const
    for (const axis of axes) {
      for (let i = 1; i < ladder.length; i += 1) {
        const outer = TOOLBOX_LEVEL_DNA[ladder[i - 1]][axis]
        const inner = TOOLBOX_LEVEL_DNA[ladder[i]][axis]
        expect(
          inner,
          `${ladder[i]}.${axis} (${inner}) must sit below ${ladder[i - 1]}.${axis} (${outer})`,
        ).toBeLessThan(outer)
      }
    }
  })

  // The components emit `is-${size}` as a class name, so a size the stylesheet
  // does not define renders an unstyled control and a size the type does not
  // allow is a permanent call-site error that still looks right on screen.
  // Both happened. Assert the two agree in both directions.
  it("keeps control sizes and their stylesheet rules in step", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles/subtoolbox-system.css"), "utf8")
    const styled = new Set(
      [...css.matchAll(/\.vt-subtoolbox-button\.is-([a-z0-9-]+)/g)].map((match) => match[1]),
    )
    for (const size of SUBTOOLBOX_CONTROL_SIZES) {
      expect(styled.has(size), `size "${size}" has no .vt-subtoolbox-button.is-${size} rule`).toBe(true)
    }
    // Tones share the is-* namespace, so only assert the sizes are covered by
    // the type — a stray size class with no type member is the other half.
    const tones = new Set(["neutral", "ink", "danger", "warning", "success", "selected"])
    const sizes = new Set<string>(SUBTOOLBOX_CONTROL_SIZES)
    for (const cls of styled) {
      if (tones.has(cls)) continue
      expect(sizes.has(cls), `.is-${cls} is styled but is not a declared control size`).toBe(true)
    }
  })

  it("gives every declared subtoolbox state default copy", () => {
    // The Record is typed, but a missing key renders an empty panel rather than
    // failing the build, so assert the rendered output instead of the type.
    for (const state of SUBTOOLBOX_STATES) {
      const html = renderToStaticMarkup(<SubToolboxStatePanel state={state} />)
      expect(html, `${state} has no default copy`).toMatch(/<p>\s*\S/)
    }
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
