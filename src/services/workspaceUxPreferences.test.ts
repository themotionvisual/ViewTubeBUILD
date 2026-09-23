// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  DEFAULT_WORKSPACE_UX_PREFERENCES,
  WORKSPACE_UX_CHANGED_EVENT,
  WORKSPACE_UX_STORAGE_KEY,
  getWorkspaceUxPreferences,
  saveWorkspaceUxPreferences,
  setWorkspaceUxToggle,
  subscribeWorkspaceUxPreferences,
} from "./workspaceUxPreferences"

describe("workspace UX preferences", () => {
  beforeEach(() => {
    localStorage.clear()
    saveWorkspaceUxPreferences(DEFAULT_WORKSPACE_UX_PREFERENCES)
  })

  it("ships conservative defaults for gesture-heavy behavior", () => {
    const preferences = getWorkspaceUxPreferences()
    expect(preferences.mobileCompactTopBar).toBe(true)
    expect(preferences.preserveOrientationPosition).toBe(true)
    expect(preferences.preservePagePosition).toBe(true)
    expect(preferences.keyboardPositionRestore).toBe(true)
    expect(preferences.rememberToolboxState).toBe(true)
    expect(preferences.restoreLastWorkspace).toBe(false)
    expect(preferences.desktopKeyboardNavigation).toBe(false)
    expect(preferences.globalQuickSwitcher).toBe(true)
    expect(preferences.rememberRecentDestinations).toBe(true)
    expect(preferences.mobileNavigationAutoHide).toBe(false)
    expect(preferences.edgeSwipeNavigation).toBe(false)
    expect(preferences.thumbZoneShortcuts).toBe(false)
    expect(preferences.stickyModuleHeaders).toBe(false)
  })

  it("persists individual toggles without resetting the other preferences", () => {
    setWorkspaceUxToggle("edgeSwipeNavigation", true)
    setWorkspaceUxToggle("stickyModuleHeaders", true)

    const preferences = getWorkspaceUxPreferences()
    expect(preferences.edgeSwipeNavigation).toBe(true)
    expect(preferences.stickyModuleHeaders).toBe(true)
    expect(preferences.mobileCompactTopBar).toBe(true)
    expect(localStorage.getItem(WORKSPACE_UX_STORAGE_KEY)).toContain('"edgeSwipeNavigation":true')
  })

  it("notifies live subscribers when a setting changes", () => {
    const listener = vi.fn()
    const unsubscribe = subscribeWorkspaceUxPreferences(listener)
    setWorkspaceUxToggle("thumbZoneShortcuts", true)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(getWorkspaceUxPreferences().thumbZoneShortcuts).toBe(true)

    unsubscribe()
    window.dispatchEvent(new CustomEvent(WORKSPACE_UX_CHANGED_EVENT))
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
