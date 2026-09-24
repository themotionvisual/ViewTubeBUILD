import React, { useMemo } from "react"
import { MessagesSquare } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetSizedButton } from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import { clusterAudienceRequests } from "./audienceRequestModel"

const REQUEST_WORDS = ["please", "can you", "could you", "make a video", "tutorial", "explain", "cover", "next video", "would love"]

export const AudienceRequestsWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const requests = useMemo(() => {
    const pools = [(data.brain as any)?.comments, (data.brain as any)?.recentComments, (data.brain as any)?.channelHub?.comments].filter(Array.isArray).flat()
    return pools.map((item: any) => ({
      text: String(item?.textDisplay || item?.text || item?.comment || "").trim(),
      author: String(item?.authorDisplayName || item?.author || "VIEWER"),
    }))
      .filter((item) => item.text && REQUEST_WORDS.some((word) => item.text.toLowerCase().includes(word)))
      .slice(0, 40)
  }, [data.brain])

  const clusters = useMemo(() => clusterAudienceRequests(requests), [requests])
  const repeated = clusters.filter((cluster) => cluster.count > 1)
  const topCluster = clusters[0] || null

  return (
    <WidgetShell {...common} icon={<MessagesSquare size={22} />}>
      <div className="vt-new-widget vt-audience-requests">
        <div className="vt-request-summary">
          <strong>{requests.length}</strong>
          <span>{clusters.length} THEMES · {repeated.length} REPEATED REQUEST{repeated.length === 1 ? "" : "S"}</span>
        </div>

        {topCluster ? (
          <div className="vt-request-top">
            <span>TOP REQUEST THEME</span>
            <strong>{topCluster.label || topCluster.requests[0]?.text}</strong>
            <small>{topCluster.count} REQUEST{topCluster.count === 1 ? "" : "S"} · {topCluster.authors.length} VIEWER{topCluster.authors.length === 1 ? "" : "S"}</small>
          </div>
        ) : null}

        <WidgetScrollArea ariaLabel="Audience request themes" className="vt-request-list">
          {clusters.length ? clusters.slice(0, 8).map((cluster) => (
            <div className="vt-request-row vt-request-cluster" key={cluster.id}>
              <span>{cluster.count > 1 ? `${cluster.count}× REPEATED` : "ONE REQUEST"} · {cluster.authors.slice(0, 2).join(" · ") || "VIEWER"}</span>
              <p>{cluster.label || cluster.requests[0]?.text}</p>
              <small>{cluster.requests[0]?.text}</small>
            </div>
          )) : (
            <div className="vt-new-widget__empty">NO REQUEST-LIKE COMMENTS ARE AVAILABLE YET. CONNECT COMMENT DATA TO POPULATE THIS WIDGET.</div>
          )}
        </WidgetScrollArea>

        <div className="vt-request-actions">
          <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/projects")}>
            TURN INTO PROJECT
          </WidgetSizedButton>
          <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/tools/audience-loop-studio")}>
            AUDIENCE LOOP
          </WidgetSizedButton>
          <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/tools/series-and-theme-generator")}>
            SERIES FIT
          </WidgetSizedButton>
        </div>
      </div>
    </WidgetShell>
  )
}
