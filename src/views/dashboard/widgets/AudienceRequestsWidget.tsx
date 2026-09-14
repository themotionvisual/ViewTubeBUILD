import React, { useMemo } from "react"
import { MessagesSquare } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea } from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"

const REQUEST_WORDS = ["please", "can you", "could you", "make a video", "tutorial", "explain", "cover", "next video", "would love"]

export const AudienceRequestsWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const requests = useMemo(() => {
    const pools = [(data.brain as any)?.comments, (data.brain as any)?.recentComments, (data.brain as any)?.channelHub?.comments].filter(Array.isArray).flat()
    return pools.map((item: any) => ({ text: String(item?.textDisplay || item?.text || item?.comment || "").trim(), author: String(item?.authorDisplayName || item?.author || "VIEWER") }))
      .filter((item) => item.text && REQUEST_WORDS.some((word) => item.text.toLowerCase().includes(word)))
      .slice(0, 8)
  }, [data.brain])

  return (
    <WidgetShell {...common} icon={<MessagesSquare size={22} />}>
      <div className="vt-new-widget vt-audience-requests">
        <div className="vt-request-summary"><strong>{requests.length}</strong><span>CONTENT REQUESTS FOUND IN AVAILABLE COMMENT CONTEXT</span></div>
        <WidgetScrollArea className="vt-request-list">
          {requests.length ? requests.map((request, index) => <div className="vt-request-row" key={`${request.author}-${index}`}><span>{request.author}</span><p>{request.text}</p></div>) : <div className="vt-new-widget__empty">NO REQUEST-LIKE COMMENTS ARE AVAILABLE YET. CONNECT COMMENT DATA TO POPULATE THIS WIDGET.</div>}
        </WidgetScrollArea>
        <button className="vt-new-widget__action" type="button" onClick={() => onNavigate?.("/projects")}>TURN REQUEST INTO PROJECT</button>
      </div>
    </WidgetShell>
  )
}
