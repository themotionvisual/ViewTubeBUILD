export type AudienceRequestEvidence = {
  text: string
  author: string
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\b(please|can you|could you|would you|make a video|video about|tutorial|explain|cover|next video|would love|on|the|a|an|about)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

export const clusterAudienceRequests = (requests: readonly AudienceRequestEvidence[]) => {
  const groups = new Map<string, AudienceRequestEvidence[]>()

  for (const request of requests) {
    const key = normalize(request.text) || request.text.toLowerCase().trim()
    const current = groups.get(key) || []
    current.push(request)
    groups.set(key, current)
  }

  return Array.from(groups.entries())
    .map(([label, grouped]) => ({
      id: label || grouped[0]?.text || "request",
      label,
      count: grouped.length,
      requests: grouped,
      authors: Array.from(new Set(grouped.map((item) => item.author).filter(Boolean))),
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
}
