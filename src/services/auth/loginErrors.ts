// Login/abort error classifier shared across features.
//
// When a Google popup flow closes without completing (user hits X, closes tab,
// switches account), our auth pipeline rejects with `new Error('LOGIN_ABORTED')`.
// That's a normal user outcome, not an error worth surfacing — but if it isn't
// caught explicitly it bubbles up as an unhandled promise rejection, spamming
// diagnostics and (in some UIs) the "Something went wrong" boundary.
//
// GlobalDataContext used to carry a local `isLoginAbortError` helper — this
// module extracts it, tightens the matcher (explicit LOGIN_ABORTED / AbortError
// first, then the historical soft matchers for backward compatibility) and
// exports it so every login catch site can classify consistently.

export const isLoginAbortError = (error: unknown): boolean => {
 if (!error) return false

 // Explicit signals first — cheapest and most specific.
 if (typeof error === "string") return error.includes("LOGIN_ABORTED")

 if (error instanceof Error) {
  if (error.message.includes("LOGIN_ABORTED")) return true
  if (error.name === "AbortError") return true
 }

 if (typeof error === "object" && error !== null) {
  const maybe = error as { code?: string; message?: string; name?: string }
  if (maybe.code === "LOGIN_ABORTED") return true
  if (typeof maybe.message === "string" && maybe.message.includes("LOGIN_ABORTED")) return true
  if (maybe.name === "AbortError") return true
 }

 // Backward-compat soft matchers (kept because GlobalDataContext relied on
 // them to catch popup timeouts and window.close() paths that reject with
 // freeform messages instead of the LOGIN_ABORTED token).
 const message = String((error as { message?: unknown } | null)?.message || error || "").toLowerCase()
 return (
  message.includes("popup") ||
  message.includes("timed out") ||
  message.includes("cancel") ||
  message.includes("aborted")
 )
}
