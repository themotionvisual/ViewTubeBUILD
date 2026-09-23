// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
  getLastWorkspaceRoute,
  isRestorableWorkspaceRoute,
  persistToolboxOpen,
  readPersistedToolboxOpen,
  saveLastWorkspaceRoute,
  toolboxStateStorageKey,
} from "./workspaceUiPersistence"
import {
  DEFAULT_WORKSPACE_UX_PREFERENCES,
  saveWorkspaceUxPreferences,
  setWorkspaceUxToggle,
} from "./workspaceUxPreferences"

describe("workspace UI persistence", () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, "", "/studio")
    saveWorkspaceUxPreferences(DEFAULT_WORKSPACE_UX_PREFERENCES)
  })

  it("scopes toolbox state to route, level and identity", () => {
    const descriptor = {
      level: "main" as const,
      title: "Video Manager",
      variant: "scaffold",
      paletteIndex: 2,
    }

    expect(toolboxStateStorageKey(descriptor)).toContain("%2Fstudio")
    expect(readPersistedToolboxOpen(descriptor, true)).toBe(true)

    persistToolboxOpen(descriptor, false)
    expect(readPersistedToolboxOpen(descriptor, true)).toBe(false)

    window.history.replaceState({}, "", "/projects")
    expect(readPersistedToolboxOpen(descriptor, true)).toBe(true)
  })

  it("ignores saved toolbox state when the preference is disabled", () => {
    const descriptor = {
      level: "sub" as const,
      title: "Publishing",
      variant: "sub",
      paletteIndex: 4,
    }

    persistToolboxOpen(descriptor, false)
    expect(readPersistedToolboxOpen(descriptor, true)).toBe(false)

    setWorkspaceUxToggle("rememberToolboxState", false)
    expect(readPersistedToolboxOpen(descriptor, true)).toBe(true)
  })

  it("only restores creator workspaces, not settings or guide pages", () => {
    expect(isRestorableWorkspaceRoute("/studio")).toBe(true)
    expect(isRestorableWorkspaceRoute("/projects?project=abc")).toBe(true)
    expect(isRestorableWorkspaceRoute("/editor-v1#timeline")).toBe(true)
    expect(isRestorableWorkspaceRoute("/settings?panel=experience")).toBe(false)
    expect(isRestorableWorkspaceRoute("/user-guide")).toBe(false)

    saveLastWorkspaceRoute("/studio?tool=video-manager")
    expect(getLastWorkspaceRoute()).toBe("/studio?tool=video-manager")

    saveLastWorkspaceRoute("/settings?panel=experience")
    expect(getLastWorkspaceRoute()).toBe("/studio?tool=video-manager")
  })
})
