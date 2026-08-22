import type { UnifiedAccountSnapshot } from "../account/accountContracts"

export type CommentAccessState = "ready" | "requires_connection" | "requires_reconnect" | "pending"

export const resolveCommentAccessState = (snapshot: UnifiedAccountSnapshot): CommentAccessState => {
 if (snapshot.authentication.status === "pending") return "pending"
 if (
  snapshot.authentication.status === "expired"
  || snapshot.google.status === "expired"
  || snapshot.google.status === "revoked"
 ) return "requires_reconnect"
 if (
  snapshot.authentication.status === "authenticated"
  && snapshot.google.status === "connected"
  && snapshot.google.youtubeScopesGranted
 ) return "ready"
 return "requires_connection"
}
