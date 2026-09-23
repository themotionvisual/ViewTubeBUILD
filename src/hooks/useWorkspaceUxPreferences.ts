import { useSyncExternalStore } from "react"
import {
  getWorkspaceUxPreferences,
  getWorkspaceUxPreferencesServerSnapshot,
  subscribeWorkspaceUxPreferences,
} from "../services/workspaceUxPreferences"

export const useWorkspaceUxPreferences = () =>
  useSyncExternalStore(
    subscribeWorkspaceUxPreferences,
    getWorkspaceUxPreferences,
    getWorkspaceUxPreferencesServerSnapshot,
  )
