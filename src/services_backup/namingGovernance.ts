export interface CanonicalNamingEntry {
 canonicalKey: string
 nickname: string
 commonName: string
 shortName: string
}

export const DEFAULT_NAMING_TABLE: CanonicalNamingEntry[] = [
 {
  canonicalKey: "videoThumbnailImpressionsClickRate",
  nickname: "thumbnail ctr",
  commonName: "Thumbnail click-through rate",
  shortName: "CTR",
 },
 {
  canonicalKey: "estimatedMinutesWatched",
  nickname: "watch mins",
  commonName: "Estimated minutes watched",
  shortName: "Watch Min",
 },
 {
  canonicalKey: "averageViewDuration",
  nickname: "avd",
  commonName: "Average view duration",
  shortName: "AVD",
 },
 {
  canonicalKey: "subscribersGained",
  nickname: "subs gained",
  commonName: "Subscribers gained",
  shortName: "Subs +",
 },
 {
  canonicalKey: "estimatedRevenue",
  nickname: "rev",
  commonName: "Estimated revenue",
  shortName: "Revenue",
 },
]

const canonicalKeySet = new Set(DEFAULT_NAMING_TABLE.map((entry) => entry.canonicalKey))
const nicknameToCanonical = new Map(
 DEFAULT_NAMING_TABLE.map((entry) => [entry.nickname.toLowerCase(), entry.canonicalKey]),
)

export const toCanonicalKey = (value: string): string | null => {
 const trimmed = value.trim()
 if (!trimmed) return null
 if (canonicalKeySet.has(trimmed)) return trimmed
 return nicknameToCanonical.get(trimmed.toLowerCase()) || null
}

export const resolveDisplayName = (
 canonicalKey: string,
 variant: "canonical" | "nickname" | "common" | "short" = "common",
): string => {
 const entry = DEFAULT_NAMING_TABLE.find((row) => row.canonicalKey === canonicalKey)
 if (!entry) return canonicalKey
 if (variant === "canonical") return entry.canonicalKey
 if (variant === "nickname") return entry.nickname
 if (variant === "short") return entry.shortName
 return entry.commonName
}

export const findNicknameUsageViolations = (
 payload: Record<string, unknown>,
): string[] => {
 const violations: string[] = []
 for (const key of Object.keys(payload)) {
  if (canonicalKeySet.has(key)) continue
  const canonicalFromNickname = nicknameToCanonical.get(key.toLowerCase())
  if (canonicalFromNickname) {
   violations.push(`Use canonical key '${canonicalFromNickname}' instead of '${key}'.`)
  }
 }
 return violations
}
