/**
 * Numeric claim auditing.
 *
 * The Brain must never present a figure the evidence does not support. The previous
 * implementation tested `JSON.stringify(evidence).includes(claim)`, which is an
 * unanchored substring match: any short figure that happens to appear inside a longer
 * number, id, timestamp or url passed. A channel with one video at 1,284,730 views
 * silently whitelisted "4", "28", "84", "473" and many more — which is most of the
 * small percentages and rates a creator would actually act on.
 *
 * This module compares *parsed numeric values* instead, with a tolerance derived from
 * how precisely the claim was written, so "1.28M" is correctly recognised as a rounded
 * statement of 1,284,730 while "34%" is not recognised as anything at all unless the
 * evidence really contains 34.
 *
 * Two severities, because they deserve different handling:
 *
 *   fabricated        a magnitude or count with no basis in evidence. Hard failure:
 *                     triggers repair.
 *   unverifiedDerived a percentage or rate that is not directly present. Often a
 *                     legitimate computation (views fell 34%), so it is recorded for
 *                     observability rather than blocking delivery.
 *
 * `unverifiedDerived` shrinks to near-zero once statistics are computed deterministically
 * and written into the evidence pack, because a grounded 34% then matches exactly. Until
 * then, flagging without blocking avoids punishing correct answers while still making the
 * gap measurable.
 */

export interface NumericClaim {
 /** The token exactly as it appeared in the generated text. */
 token: string
 /** Parsed magnitude. A percentage keeps its face value: "34%" is 34. */
 value: number
 isPercent: boolean
 /** Half the last significant place implied by how the token was written. */
 tolerance: number
}

const SUFFIX_SCALE: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 }

/**
 * Bare integers a creator-facing answer uses as prose rather than as data:
 * "three things to try", "over the last 28 days". Exempt only when written bare —
 * a percentage, a decimal or a magnitude suffix is a data claim and is never exempt,
 * which is what the old hardcoded allowlist got wrong.
 */
const PROSE_INTEGER_MAXIMUM = 12
const COMMON_WINDOW_DAYS = new Set([7, 14, 28, 30, 60, 90, 180, 365])

const NUMERIC_TOKEN = /\d[\d,]*(?:\.\d+)?\s?[KkMmBb]?%?/g

export const parseNumericToken = (raw: string): NumericClaim | null => {
 const token = raw.trim()
 const match = token.match(/^(\d[\d,]*(?:\.\d+)?)\s?([KkMmBb])?(%)?$/)
 if (!match) return null
 const [, mantissaRaw, suffix, percent] = match
 const mantissa = Number(mantissaRaw.replace(/,/g, ""))
 if (!Number.isFinite(mantissa)) return null

 const decimals = mantissaRaw.includes(".") ? mantissaRaw.split(".")[1].length : 0
 const scale = suffix ? SUFFIX_SCALE[suffix.toLowerCase()] : 1
 const step = Math.pow(10, -decimals) * scale

 return {
  token,
  value: mantissa * scale,
  isPercent: Boolean(percent),
  // A claim written to the nearest 0.01M is only asserting +/- 5,000.
  tolerance: step / 2,
 }
}

const isProseInteger = (claim: NumericClaim, raw: string): boolean => {
 if (claim.isPercent) return false
 if (/[KkMmBb]/.test(raw)) return false
 if (!Number.isInteger(claim.value)) return false
 return claim.value <= PROSE_INTEGER_MAXIMUM || COMMON_WINDOW_DAYS.has(claim.value)
}

/**
 * Walk any evidence shape and collect every number it asserts, including numbers
 * embedded in strings ("480,312 views" contributes 480312) so a figure the creator
 * can already see on screen is not reported as invented.
 */
export const collectKnownNumbers = (value: unknown, depth = 0): Set<number> => {
 const found = new Set<number>()
 if (depth > 8 || value == null) return found

 const absorb = (other: Set<number>) => other.forEach((entry) => found.add(entry))

 if (typeof value === "number") {
  if (Number.isFinite(value)) found.add(value)
  return found
 }
 if (typeof value === "string") {
  for (const raw of value.match(NUMERIC_TOKEN) || []) {
   const parsed = parseNumericToken(raw)
   if (parsed) found.add(parsed.value)
  }
  return found
 }
 if (Array.isArray(value)) {
  value.forEach((entry) => absorb(collectKnownNumbers(entry, depth + 1)))
  return found
 }
 if (typeof value === "object") {
  Object.values(value as Record<string, unknown>).forEach((entry) =>
   absorb(collectKnownNumbers(entry, depth + 1)))
 }
 return found
}

const isSupported = (claim: NumericClaim, known: Set<number>): boolean => {
 for (const candidate of known) {
  if (Math.abs(candidate - claim.value) <= claim.tolerance) return true
 }
 return false
}

export interface NumericAudit {
 /** Counts and magnitudes with no basis in evidence. Repair on these. */
 fabricated: NumericClaim[]
 /** Percentages and rates not directly present. Record, do not block. */
 unverifiedDerived: NumericClaim[]
}

export const auditNumericClaims = (input: {
 text: string
 evidence: unknown
}): NumericAudit => {
 const known = collectKnownNumbers(input.evidence)
 const fabricated: NumericClaim[] = []
 const unverifiedDerived: NumericClaim[] = []
 const seen = new Set<string>()

 for (const raw of input.text.match(NUMERIC_TOKEN) || []) {
  const claim = parseNumericToken(raw)
  if (!claim || seen.has(claim.token)) continue
  seen.add(claim.token)
  if (isProseInteger(claim, raw)) continue
  if (isSupported(claim, known)) continue
  if (claim.isPercent) unverifiedDerived.push(claim)
  else fabricated.push(claim)
 }

 return { fabricated, unverifiedDerived }
}
