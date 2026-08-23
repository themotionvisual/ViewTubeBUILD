// Recursive scrubber that strips secret-shaped keys from any JSON-ish payload
// before it leaves the browser (analytics export, workspace snapshot, bug
// report, debug dump).
//
// Rationale: any of our exports may include serialized OAuth tokens, refresh
// tokens, API keys, session cookies, or Authorization headers embedded deep
// in nested structures. If a user shares a workspace bundle on Slack, uploads
// it to a support ticket, or downloads it for their own archives, we do not
// want those secrets to travel with it.
//
// Strategy: filter by KEY NAME rather than by value. Matching values is a
// nightmare (many valid strings look like tokens); matching well-known key
// names is precise and cheap. Callers wrap payloads with `sanitizeForExport`
// immediately before serialization.
//
// Test coverage lives in ./sanitizeForExport.test.ts.

const SECRET_KEY_PATTERN =
 /(token|access.?token|refresh.?token|authorization|cookie|api.?key|client.?secret|session|password|bearer|credentials?|secret)/i

export const sanitizeForExport = <T = unknown>(value: T): T => {
 if (Array.isArray(value)) {
  return value.map((item) => sanitizeForExport(item)) as unknown as T
 }

 // Preserve primitives and null unchanged.
 if (!value || typeof value !== "object") return value

 // Preserve well-known non-plain objects that a WeakMap-style traversal
 // would otherwise flatten. Callers should not be passing these into
 // JSON.stringify anyway, but this keeps the helper defensive.
 if (value instanceof Date) return value
 if (value instanceof RegExp) return value
 if (value instanceof Map || value instanceof Set) return value
 if (typeof Blob !== "undefined" && value instanceof Blob) return value
 if (typeof File !== "undefined" && value instanceof File) return value
 if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) return value

 return Object.fromEntries(
  Object.entries(value as Record<string, unknown>)
   .filter(([key]) => !SECRET_KEY_PATTERN.test(key))
   .map(([key, childValue]) => [key, sanitizeForExport(childValue)]),
 ) as unknown as T
}

// Convenience wrapper for the common "serialize to JSON string" case so
// callers do not have to remember to sanitize first.
export const stringifyForExport = (value: unknown, space: number = 2): string =>
 JSON.stringify(sanitizeForExport(value), null, space)
