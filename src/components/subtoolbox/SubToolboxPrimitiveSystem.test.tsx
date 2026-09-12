import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "./SubToolboxLayouts"
import { SubToolboxButton, SubToolboxInput, SubToolboxStatePanel, SubToolboxTextArea } from "./SubToolboxPrimitives"
import { CONTROL_SHELL, SUBTOOLBOX_TOKENS, resolveSubtoolboxMinHeight } from "./tokens"

describe("Subtoolbox Primitive System", () => {
  it("derives compatibility geometry from the single token source", () => {
    expect(CONTROL_SHELL.height).toBe(SUBTOOLBOX_TOKENS.controlHeight.action)
    expect(CONTROL_SHELL.radius).toBe(SUBTOOLBOX_TOKENS.interior.radius)
    expect(SUBTOOLBOX_TOKENS.interior.radius).toBeLessThan(SUBTOOLBOX_TOKENS.shell.radius)
    expect(SUBTOOLBOX_TOKENS.interior.shadowOffset).toBeLessThan(SUBTOOLBOX_TOKENS.shell.shadowOffset)
    expect(resolveSubtoolboxMinHeight(3, "compact")).toBe(144)
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
      </SubToolboxStack>,
    )

    expect(html).toContain("vt-subtoolbox-input")
    expect(html).toContain("vt-subtoolbox-textarea is-compact")
    expect(html).toContain("vt-subtoolbox-actions has-2-columns")
    expect(html).toContain("vt-subtoolbox-button is-compact is-accent is-selected")
    expect(html).toContain('data-subtoolbox-state="error"')
    expect(html).toContain('role="alert"')
  })
})
