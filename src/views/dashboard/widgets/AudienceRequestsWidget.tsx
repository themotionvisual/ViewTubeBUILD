import React, { useEffect, useMemo, useState } from "react"
import { MessageCircleQuestion, MessagesSquare, PlusCircle, Users } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetMetric,
  WidgetScrollArea,
  WidgetSizedButton,
  WidgetStatePanel,
} from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import "./AudienceRequestsWidget.css"

const REQUEST_WORDS = ["please", "can you", "could you", "make a video", "tutorial", "explain", "cover", "next video", "would love"]

type RequestEvidence = {
  id: string
  text: string
  author: string
}

type RequestCluster = {
  id: string
  label: string
  count: number
  authors: string[]
  evidence: RequestEvidence[]
}

const normalizeRequest = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\b(please|can you|could you|would you|make a video|video about|tutorial|explain|cover|next video|would love|about|the|a|an)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const clusterRequests = (requests: RequestEvidence[]): RequestCluster[] => {
  const groups = new Map<string, RequestEvidence[]>()
  for (const request of requests) {
    const key = normalizeRequest(request.text) || request.text.toLowerCase()
    const group = groups.get(key) || []
    group.push(request)
    groups.set(key, group)
  }

  return Array.from(groups.entries())
    .map(([label, evidence]) => ({
      id: label,
      label,
      count: evidence.length,
      authors: Array.from(new Set(evidence.map((item) => item.author))).filter(Boolean),
      evidence,
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 8)
}

const RequestClusterMap: React.FC<{
  clusters: RequestCluster[]
  selectedId: string | null
  onSelect: (id: string) => void
}> = ({ clusters, selectedId, onSelect }) => (
  <div className="vt-request-cluster-map" aria-label="Audience request cluster map">
    <div className="vt-request-cluster-map__hub">
      <MessagesSquare aria-hidden="true" />
      <b>{clusters.reduce((sum, cluster) => sum + cluster.count, 0)}</b>
      <small>REQUESTS</small>
    </div>
    {clusters.slice(0, 6).map((cluster, index) => (
      <button
        key={cluster.id}
        type="button"
        className="vt-request-cluster-map__node"
        data-node={index + 1}
        data-selected={cluster.id === selectedId ? "true" : "false"}
        aria-pressed={cluster.id === selectedId}
        onClick={() => onSelect(cluster.id)}
      >
        <span>{cluster.count}×</span>
        <strong>{cluster.label || cluster.evidence[0]?.text}</strong>
        <small>{cluster.authors.length} VIEWER{cluster.authors.length === 1 ? "" : "S"}</small>
      </button>
    ))}
    <div className="vt-request-cluster-map__loop" aria-hidden="true">
      <span>COMMENTS</span>
      <span>THEMES</span>
      <span>PROJECTS</span>
      <span>RETURN</span>
    </div>
  </div>
)

export const AudienceRequestsWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const requests = useMemo<RequestEvidence[]>(() => {
    const pools = [
      (data.brain as any)?.comments,
      (data.brain as any)?.recentComments,
      (data.brain as any)?.channelHub?.comments,
    ].filter(Array.isArray).flat()

    return pools.map((item: any, index: number) => ({
      id: String(item?.id || item?.commentId || index),
      text: String(item?.textDisplay || item?.text || item?.comment || "").trim(),
      author: String(item?.authorDisplayName || item?.author || "VIEWER"),
    }))
      .filter((item) => item.text && REQUEST_WORDS.some((word) => item.text.toLowerCase().includes(word)))
      .slice(0, 40)
  }, [data.brain])

  const clusters = useMemo(() => clusterRequests(requests), [requests])

  useEffect(() => {
    setSelectedId((current) => current && clusters.some((cluster) => cluster.id === current) ? current : clusters[0]?.id || null)
  }, [clusters])

  const selected = clusters.find((cluster) => cluster.id === selectedId) || clusters[0] || null
  const repeated = clusters.filter((cluster) => cluster.count > 1).length

  return (
    <WidgetShell {...common} icon={<MessagesSquare size={22} />}>
      <div className="vt-audience-requests-widget">
        {!clusters.length ? (
          <WidgetStatePanel state={{
            status: "empty",
            data: null,
            message: "No request-like comments are available yet. Connect comment data to populate the Audience Loop.",
          }} />
        ) : (
          <>
            <RequestClusterMap clusters={clusters} selectedId={selectedId} onSelect={setSelectedId} />

            <section className="vt-audience-requests-widget__inspector">
              <div className="vt-audience-requests-widget__head">
                <div>
                  <span>SELECTED REQUEST THEME</span>
                  <strong>{selected?.label || selected?.evidence[0]?.text}</strong>
                </div>
                <WidgetBadge height={24} status={(selected?.count || 0) > 1 ? "positive" : "neutral"}>
                  {(selected?.count || 0) > 1 ? `${selected?.count}× REPEATED` : "ONE REQUEST"}
                </WidgetBadge>
              </div>

              <div className="vt-audience-requests-widget__metrics">
                <WidgetMetric label="REQUESTS" value={selected?.count || 0} />
                <WidgetMetric label="VIEWERS" value={selected?.authors.length || 0} />
                <WidgetMetric label="REPEATED THEMES" value={repeated} />
              </div>

              <WidgetScrollArea ariaLabel="Request evidence" className="vt-audience-requests-widget__evidence">
                {(selected?.evidence || []).map((request) => (
                  <article key={request.id}>
                    <span>{request.author}</span>
                    <p>{request.text}</p>
                  </article>
                ))}
              </WidgetScrollArea>

              <div className="vt-audience-requests-widget__actions">
                <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/projects")}>
                  <PlusCircle aria-hidden="true" /> TURN INTO PROJECT
                </WidgetSizedButton>
                <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/tools/audience-loop-studio")}>
                  <Users aria-hidden="true" /> AUDIENCE LOOP
                </WidgetSizedButton>
                <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/tools/series-and-theme-generator")}>
                  <MessageCircleQuestion aria-hidden="true" /> SERIES FIT
                </WidgetSizedButton>
              </div>
            </section>
          </>
        )}
      </div>
    </WidgetShell>
  )
}
