export interface AlgorithmLifecycleObservation {
 videoId: string
 channelId: string
 metric: string
 value: number
 lifecycleHour: number
 observedAt: number
 format?: string | null
 durationSeconds?: number | null
 topicKey?: string | null
 evidenceId?: string | null
}

export interface AlgorithmLifecycleCohortRequest {
 channelId: string
 videoId: string
 metric: string
 lifecycleHour: number
 format?: string | null
 durationSeconds?: number | null
 topicKey?: string | null
 minimumPeers?: number
 maximumPeers?: number
 lifecycleToleranceHours?: number
 durationToleranceRatio?: number
}

export interface AlgorithmLifecycleCohortResult {
 status: "available" | "insufficient_peers"
 metric: string
 lifecycleHour: number
 targetVideoId: string
 peers: AlgorithmLifecycleObservation[]
 baselineValue: number | null
 medianValue: number | null
 sampleSize: number
 evidenceIds: string[]
 explanation: string
}

const median = (values: number[]) => {
 if (!values.length) return null
 const sorted = [...values].sort((a, b) => a - b)
 const middle = Math.floor(sorted.length / 2)
 return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

const durationCompatible = (
 candidate: AlgorithmLifecycleObservation,
 request: AlgorithmLifecycleCohortRequest,
) => {
 if (!request.durationSeconds || !candidate.durationSeconds) return true
 const tolerance = request.durationToleranceRatio ?? .35
 const delta = Math.abs(candidate.durationSeconds - request.durationSeconds) / Math.max(request.durationSeconds, 1)
 return delta <= tolerance
}

const formatCompatible = (candidate: AlgorithmLifecycleObservation, request: AlgorithmLifecycleCohortRequest) =>
 !request.format || !candidate.format || candidate.format === request.format

const topicCompatible = (candidate: AlgorithmLifecycleObservation, request: AlgorithmLifecycleCohortRequest) =>
 !request.topicKey || !candidate.topicKey || candidate.topicKey === request.topicKey

/**
 * Builds a fair historical baseline from observations measured at comparable
 * lifecycle ages. It does not treat a video's lifetime total as a 24h/72h peer.
 *
 * Callers must supply genuine lifecycle observations (for example a video metric
 * captured at T+24h). If that evidence does not exist, this service returns
 * insufficient_peers rather than substituting mismatched current totals.
 */
export const buildAlgorithmLifecycleCohort = (
 observations: AlgorithmLifecycleObservation[],
 request: AlgorithmLifecycleCohortRequest,
): AlgorithmLifecycleCohortResult => {
 const toleranceHours = request.lifecycleToleranceHours ?? Math.max(2, request.lifecycleHour * .15)
 const minimumPeers = Math.max(2, request.minimumPeers ?? 3)
 const maximumPeers = Math.max(minimumPeers, Math.min(100, request.maximumPeers ?? 12))

 const peers = observations
  .filter((candidate) => candidate.channelId === request.channelId)
  .filter((candidate) => candidate.videoId !== request.videoId)
  .filter((candidate) => candidate.metric === request.metric)
  .filter((candidate) => Math.abs(candidate.lifecycleHour - request.lifecycleHour) <= toleranceHours)
  .filter((candidate) => formatCompatible(candidate, request))
  .filter((candidate) => durationCompatible(candidate, request))
  .filter((candidate) => topicCompatible(candidate, request))
  .sort((left, right) => {
   const lifecycleDelta = Math.abs(left.lifecycleHour - request.lifecycleHour) - Math.abs(right.lifecycleHour - request.lifecycleHour)
   if (lifecycleDelta !== 0) return lifecycleDelta
   const durationDeltaLeft = request.durationSeconds && left.durationSeconds
    ? Math.abs(left.durationSeconds - request.durationSeconds)
    : 0
   const durationDeltaRight = request.durationSeconds && right.durationSeconds
    ? Math.abs(right.durationSeconds - request.durationSeconds)
    : 0
   return durationDeltaLeft - durationDeltaRight
  })
  .slice(0, maximumPeers)

 const values = peers.map((peer) => peer.value).filter(Number.isFinite)
 const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
 const medianValue = median(values)
 const available = peers.length >= minimumPeers
 return {
  status: available ? "available" : "insufficient_peers",
  metric: request.metric,
  lifecycleHour: request.lifecycleHour,
  targetVideoId: request.videoId,
  peers,
  baselineValue: available ? medianValue ?? mean : null,
  medianValue,
  sampleSize: peers.length,
  evidenceIds: [...new Set(peers.map((peer) => peer.evidenceId).filter(Boolean) as string[])],
  explanation: available
   ? `Baseline uses ${peers.length} peer videos measured near T+${request.lifecycleHour}h; median is preferred over lifetime/current totals.`
   : `Only ${peers.length} comparable lifecycle peers were available; at least ${minimumPeers} are required.`,
 }
}

export const lifecycleObservationKey = (observation: AlgorithmLifecycleObservation) =>
 `${observation.channelId}:${observation.videoId}:${observation.metric}:${Math.round(observation.lifecycleHour)}`
