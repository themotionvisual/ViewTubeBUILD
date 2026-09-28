export interface CommunityCommentEvidence {
  id: string
  author: string
  videoId: string
  text: string
  likeCount: number
  replyCount: number
  publishedAt: string | null
  source?: string
}

export type CommunityAdvocateConfidence = "strong" | "medium" | "limited"

export interface CommunityAdvocate {
  author: string
  authorKey: string
  score: number
  confidence: CommunityAdvocateConfidence
  commentCount: number
  videoCount: number
  totalCommentLikes: number
  totalReplies: number
  lastCommentAt: string | null
  videoIds: string[]
  commentIds: string[]
  signals: string[]
  evidence: CommunityCommentEvidence[]
}

const clean = (value: unknown): string => String(value ?? "").replace(/\s+/g, " ").trim()
const numberOrZero = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

const authorKey = (value: string): string =>
  value.trim().replace(/^@+/, "").toLocaleLowerCase()

const validTimestamp = (value: string | null): number | null => {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

export const normalizeCommunityCommentEvidence = (
  rawItems: unknown[],
  input: { fallbackVideoId?: string; source?: string } = {},
): CommunityCommentEvidence[] => rawItems
  .map((raw, index) => {
    const item = (raw || {}) as any
    const snippet = item?.snippet?.topLevelComment?.snippet || item?.snippet || {}
    const author = clean(item.author || item.authorDisplayName || snippet.authorDisplayName)
    const text = clean(item.text || item.textDisplay || item.textOriginal || snippet.textOriginal || snippet.textDisplay)
    const id = clean(item.id || item.commentId || item.threadId || (author || text ? `${input.source || "comment"}:${index}:${author}` : ""))
    if (!author || !id) return null

    return {
      id,
      author,
      videoId: clean(item.videoId || item.video?.id || snippet.videoId || input.fallbackVideoId),
      text,
      likeCount: numberOrZero(item.likeCount ?? snippet.likeCount),
      replyCount: numberOrZero(item.replyCount ?? item.totalReplyCount ?? item?.snippet?.totalReplyCount),
      publishedAt: clean(item.publishedAt || snippet.publishedAt) || null,
      source: input.source,
    } satisfies CommunityCommentEvidence
  })
  .filter((item): item is CommunityCommentEvidence => Boolean(item))

const recencySignal = (timestamp: number | null, now: number) => {
  if (timestamp === null) return { points: 0, label: null as string | null }
  const days = Math.max(0, (now - timestamp) / 86_400_000)
  if (days <= 30) return { points: 4, label: "RECENT" }
  if (days <= 90) return { points: 1.5, label: "LAST 90 DAYS" }
  return { points: 0, label: null }
}

export const rankCommunityAdvocates = (
  inputComments: CommunityCommentEvidence[],
  options: {
    now?: Date
    excludedAuthors?: string[]
    limit?: number
  } = {},
): CommunityAdvocate[] => {
  const now = (options.now || new Date()).getTime()
  const excluded = new Set((options.excludedAuthors || []).map(authorKey).filter(Boolean))
  const seenCommentIds = new Set<string>()
  const byAuthor = new Map<string, CommunityCommentEvidence[]>()

  for (const comment of inputComments) {
    const id = clean(comment.id)
    const key = authorKey(comment.author)
    if (!id || !key || excluded.has(key) || seenCommentIds.has(id)) continue
    seenCommentIds.add(id)
    const group = byAuthor.get(key) || []
    group.push({
      ...comment,
      id,
      author: clean(comment.author),
      videoId: clean(comment.videoId),
      likeCount: numberOrZero(comment.likeCount),
      replyCount: numberOrZero(comment.replyCount),
      publishedAt: clean(comment.publishedAt) || null,
    })
    byAuthor.set(key, group)
  }

  return Array.from(byAuthor.entries())
    .map(([key, evidence]): CommunityAdvocate => {
      const videoIds = Array.from(new Set(evidence.map((comment) => comment.videoId).filter(Boolean)))
      const totalCommentLikes = evidence.reduce((sum, comment) => sum + comment.likeCount, 0)
      const totalReplies = evidence.reduce((sum, comment) => sum + comment.replyCount, 0)
      const timestamps = evidence
        .map((comment) => validTimestamp(comment.publishedAt))
        .filter((value): value is number => value !== null)
      const newest = timestamps.length ? Math.max(...timestamps) : null
      const recency = recencySignal(newest, now)
      const commentCount = evidence.length
      const videoCount = videoIds.length

      // Repeated participation across multiple videos is deliberately more
      // important than one unusually popular comment.
      const score =
        commentCount * 4
        + Math.max(0, videoCount - 1) * 8
        + Math.min(totalCommentLikes, 100) * 0.05
        + Math.min(totalReplies, 30) * 0.5
        + recency.points

      const confidence: CommunityAdvocateConfidence =
        commentCount >= 3 && videoCount >= 2
          ? "strong"
          : commentCount >= 2 || videoCount >= 2
            ? "medium"
            : "limited"

      const signals: string[] = [
        `${commentCount} COMMENT${commentCount === 1 ? "" : "S"}`,
      ]
      if (videoCount > 1) signals.push(`${videoCount} VIDEOS`)
      if (totalCommentLikes > 0) signals.push(`${totalCommentLikes} COMMENT LIKE${totalCommentLikes === 1 ? "" : "S"}`)
      if (totalReplies > 0) signals.push(`${totalReplies} REPL${totalReplies === 1 ? "Y" : "IES"}`)
      if (recency.label) signals.push(recency.label)

      return {
        author: evidence[0]?.author || key,
        authorKey: key,
        score: Math.round(score * 10) / 10,
        confidence,
        commentCount,
        videoCount,
        totalCommentLikes,
        totalReplies,
        lastCommentAt: newest === null ? null : new Date(newest).toISOString(),
        videoIds,
        commentIds: evidence.map((comment) => comment.id),
        signals,
        evidence: [...evidence].sort((left, right) =>
          (validTimestamp(right.publishedAt) || 0) - (validTimestamp(left.publishedAt) || 0)),
      }
    })
    .sort((left, right) =>
      right.score - left.score
      || right.videoCount - left.videoCount
      || right.commentCount - left.commentCount
      || left.author.localeCompare(right.author))
    .slice(0, options.limit || 12)
}
