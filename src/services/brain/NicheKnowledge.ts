import type {
 BrainResponseCitation,
 NicheKnowledgeProfile,
 NicheKnowledgeRefreshPolicy,
 NicheKnowledgeSource,
} from "../../types"
import {
 getLatestNicheKnowledgeProfileDB,
 saveNicheKnowledgeProfileDB,
} from "./Persistence"

const DAY = 24 * 60 * 60 * 1000

export const DEFAULT_NICHE_KNOWLEDGE_REFRESH_POLICY: NicheKnowledgeRefreshPolicy = {
 evergreenTtlMs: 30 * DAY,
 currentTtlMs: DAY,
 refreshOnFingerprintChange: true,
}

const makeId = (prefix: string): string => {
 const random = typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`
 return `${prefix}_${random}`
}

const normalize = (value: unknown): string =>
 String(value || "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()

const titleCase = (value: string): string =>
 value.replace(/\b\w/g, (letter) => letter.toUpperCase())

const safeResearchText = (value: unknown, maximum = 1400): string =>
 normalize(value)
  .replace(/ignore (all |any )?(previous|prior) instructions?/gi, "")
  .replace(/system prompt/gi, "reference text")
  .slice(0, maximum)

const unique = (values: string[], limit: number): string[] =>
 Array.from(new Set(values.map(normalize).filter(Boolean))).slice(0, limit)

export const resolveCanonicalNiche = (input: {
 niche?: string | null
 topicClusters?: string[]
 contentPillars?: string[]
}): string => {
 const candidates = unique([
  input.niche || "",
  ...(input.topicClusters || []),
  ...(input.contentPillars || []),
 ], 8)
 const joined = candidates.join(" ").toLowerCase()

 if (/napoleon|napoleonic/.test(joined) && /military|history|cavalry|war/.test(joined)) {
  return "Napoleonic military history"
 }
 if (/animation/.test(joined) && /history|historical/.test(joined)) {
  return "Animated history education"
 }

 const primary = normalize(input.niche || candidates.slice(0, 3).join(" "))
 return primary ? titleCase(primary.toLowerCase()) : ""
}

const missingProfile = (input: {
 channelId?: string | null
 evidenceFingerprint: string
 canonicalNiche?: string
}): NicheKnowledgeProfile => {
 const now = new Date().toISOString()
 return {
  id: makeId("niche_knowledge"),
  channelId: input.channelId || null,
  canonicalNiche: input.canonicalNiche || "",
  evidenceFingerprint: input.evidenceFingerprint,
  createdAt: now,
  updatedAt: now,
  evergreenExpiresAt: now,
  summary: "",
  terminology: [],
  majorSubtopics: [],
  adjacentTopics: [],
  audienceQuestions: [],
  sources: [],
  status: "missing",
 }
}

type WikipediaSearchResponse = {
 query?: { search?: Array<{ title?: string; snippet?: string }> }
}

type WikipediaSummaryResponse = {
 title?: string
 extract?: string
 content_urls?: { desktop?: { page?: string } }
}

const fetchWikipediaProfile = async (
 canonicalNiche: string,
 fetcher: typeof fetch,
 now: Date,
 policy: NicheKnowledgeRefreshPolicy,
): Promise<{ summary: string; sources: NicheKnowledgeSource[]; titles: string[] }> => {
 const searchUrl = new URL("https://en.wikipedia.org/w/api.php")
 searchUrl.search = new URLSearchParams({
  action: "query",
  list: "search",
  srsearch: canonicalNiche,
  srlimit: "4",
  format: "json",
  origin: "*",
 }).toString()
 const searchResponse = await fetcher(searchUrl.toString(), { headers: { Accept: "application/json" } })
 if (!searchResponse.ok) throw new Error(`Wikipedia search returned ${searchResponse.status}`)
 const search = await searchResponse.json() as WikipediaSearchResponse
 const titles = unique((search.query?.search || []).map((item) => item.title || ""), 3)
 if (!titles.length) return { summary: "", sources: [], titles: [] }

 const summaries = await Promise.all(titles.map(async (title) => {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const response = await fetcher(url, { headers: { Accept: "application/json" } })
  if (!response.ok) return null
  return response.json() as Promise<WikipediaSummaryResponse>
 }))
 const accessedAt = now.toISOString()
 const expiresAt = new Date(now.getTime() + policy.evergreenTtlMs).toISOString()
 const sources = summaries.flatMap<NicheKnowledgeSource>((item, index) => {
  if (!item?.extract) return []
  return [{
   id: `wikipedia_${index}_${encodeURIComponent(item.title || titles[index] || canonicalNiche)}`,
   title: item.title || titles[index] || canonicalNiche,
   url: item.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(titles[index] || canonicalNiche)}`,
   source: "wikipedia",
   excerpt: safeResearchText(item.extract, 900),
   accessedAt,
   expiresAt,
  }]
 })
 return {
  summary: sources.map((source) => source.excerpt).join(" ").slice(0, 2200),
  sources,
  titles,
 }
}

export const resolveNicheKnowledge = async (input: {
 channelId?: string | null
 niche?: string | null
 topicClusters?: string[]
 contentPillars?: string[]
 evidenceFingerprint: string
 fetcher?: typeof fetch
 now?: Date
 policy?: NicheKnowledgeRefreshPolicy
}): Promise<NicheKnowledgeProfile> => {
 const channelId = input.channelId || null
 const canonicalNiche = resolveCanonicalNiche(input)
 const policy = input.policy || DEFAULT_NICHE_KNOWLEDGE_REFRESH_POLICY
 const now = input.now || new Date()
 if (!canonicalNiche) return missingProfile({ channelId, evidenceFingerprint: input.evidenceFingerprint })

 const cached = await getLatestNicheKnowledgeProfileDB(channelId)
 const cacheFresh = cached
  && cached.canonicalNiche === canonicalNiche
  && (!policy.refreshOnFingerprintChange || cached.evidenceFingerprint === input.evidenceFingerprint)
  && new Date(cached.evergreenExpiresAt).getTime() > now.getTime()
 if (cacheFresh) return cached

 const fetcher = input.fetcher || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : null)
 if (!fetcher) {
  const profile = cached || missingProfile({ channelId, evidenceFingerprint: input.evidenceFingerprint, canonicalNiche })
  return { ...profile, canonicalNiche, status: profile.sources.length ? "partial" : "missing" }
 }

 try {
  const research = await fetchWikipediaProfile(canonicalNiche, fetcher, now, policy)
  const profile: NicheKnowledgeProfile = {
   id: cached?.id || makeId("niche_knowledge"),
   channelId,
   canonicalNiche,
   evidenceFingerprint: input.evidenceFingerprint,
   createdAt: cached?.createdAt || now.toISOString(),
   updatedAt: now.toISOString(),
   evergreenExpiresAt: new Date(now.getTime() + policy.evergreenTtlMs).toISOString(),
   summary: research.summary,
   terminology: unique([canonicalNiche, ...research.titles], 8),
   majorSubtopics: unique(research.titles.filter((title) => title.toLowerCase() !== canonicalNiche.toLowerCase()), 6),
   adjacentTopics: unique((input.topicClusters || []).filter((topic) => !canonicalNiche.toLowerCase().includes(topic.toLowerCase())), 6),
   audienceQuestions: [
    `What does a viewer new to ${canonicalNiche} need explained first?`,
    `Which recurring question in ${canonicalNiche} could become a series?`,
    `What common misconception about ${canonicalNiche} can this channel clarify?`,
   ],
   sources: research.sources,
   status: research.sources.length ? "ready" : "partial",
  }
  await saveNicheKnowledgeProfileDB(profile)
  return profile
 } catch (error) {
  const fallback = cached || missingProfile({ channelId, evidenceFingerprint: input.evidenceFingerprint, canonicalNiche })
  return {
   ...fallback,
   canonicalNiche,
   evidenceFingerprint: input.evidenceFingerprint,
   updatedAt: now.toISOString(),
   status: fallback.sources.length ? "partial" : "missing",
  }
 }
}

export const buildRelevantNicheKnowledgeContext = (
 profile: NicheKnowledgeProfile | null,
 userText: string,
 maximumCharacters = 1800,
): string => {
 if (!profile || profile.status === "missing") return ""
 const terms = normalize(userText).toLowerCase().split(/\W+/).filter((term) => term.length > 3)
 const relevantSources = profile.sources.filter((source) => {
  const haystack = `${source.title} ${source.excerpt}`.toLowerCase()
  return !terms.length || terms.some((term) => haystack.includes(term))
 })
 const sources = (relevantSources.length ? relevantSources : profile.sources).slice(0, 2)
 return [
  `Public niche knowledge: ${profile.canonicalNiche}.`,
  profile.summary,
  ...sources.map((source) => `${source.title}: ${source.excerpt}`),
 ].join("\n").slice(0, maximumCharacters)
}

export const readCachedCurrentNicheResearch = (
 profile: NicheKnowledgeProfile | null,
 now = new Date(),
): { text: string; citations: BrainResponseCitation[] } | null => {
 if (!profile?.currentExpiresAt || new Date(profile.currentExpiresAt).getTime() <= now.getTime()) return null
 const sources = profile.sources.filter((source) => source.source === "google")
 if (!sources.length) return null
 return {
  text: sources.map((source) => source.excerpt).join(" ").slice(0, 1800),
  citations: sources.map((source) => ({
   id: source.id,
   title: source.title,
   url: source.url,
   source: "google",
   accessedAt: source.accessedAt,
  })),
 }
}

export const cacheCurrentNicheResearch = async (input: {
 profile: NicheKnowledgeProfile
 text: string
 citations: BrainResponseCitation[]
 now?: Date
 policy?: NicheKnowledgeRefreshPolicy
}): Promise<NicheKnowledgeProfile> => {
 const now = input.now || new Date()
 const policy = input.policy || DEFAULT_NICHE_KNOWLEDGE_REFRESH_POLICY
 const expiresAt = new Date(now.getTime() + policy.currentTtlMs).toISOString()
 const evergreen = input.profile.sources.filter((source) => source.source !== "google")
 const currentSources: NicheKnowledgeSource[] = input.citations.slice(0, 5).map((citation, index) => ({
  id: citation.id || `google_${index}_${makeId("source")}`,
  title: citation.title,
  url: citation.url,
  source: "google",
  excerpt: safeResearchText(input.text, 1400),
  accessedAt: citation.accessedAt || now.toISOString(),
  expiresAt,
 }))
 const profile: NicheKnowledgeProfile = {
  ...input.profile,
  updatedAt: now.toISOString(),
  currentExpiresAt: expiresAt,
  sources: [...evergreen, ...currentSources],
 }
 await saveNicheKnowledgeProfileDB(profile)
 return profile
}
