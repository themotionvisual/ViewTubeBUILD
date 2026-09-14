export type StudioDataState = "idle" | "loading" | "ready" | "empty" | "error"

export type StudioConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnect_required"

export type StudioStateSnapshot = {
  data: StudioDataState
  connection: StudioConnectionState
}

export const isStudioCapabilityAvailable = (connection: StudioConnectionState) =>
  connection === "connected"
