import React, { useMemo } from "react"
import { Star } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { useVideoComments } from "../useVideoComments"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"

export const SuperfanCardWidget: React.FC<
  CommonWidgetProps & { data: DashboardData }
> = ({ data, ...common }) => {
  const recentVideoId = data.canonicalRows[0]?.videoId || null
  const { comments, loading } = useVideoComments(recentVideoId)
  
  const displayFans = useMemo(() => {
    if (comments.length > 0) {
      return comments.slice(0, 4).map((comment, i) => ({
        name: `@${comment.author.replace(/[^a-zA-Z0-9]/g, "")}`,
        color: ["#00D2FF", "#FF3399", "#4FFF5B", "#FFE357"][i % 4],
        detail: i === 0 ? "Most recent commenter" : "Active audience member",
        tag: ["SUPERFAN", "LOYALTY", "VIBE", "LEGEND"][i % 4],
      }))
    }
    
    // If no comments, use fallback profiles based on actual channel name
    const channelBase = (data.authState.channelName || "Create").split(" ")[0]
    return [
      { name: `@${channelBase}Max`, color: "#00D2FF", detail: "Top 1% Engagement", tag: "SUPERFAN" },
      { name: `@${channelBase}Pro`, color: "#FF3399", detail: "Sub Shared 5+ Videos", tag: "LOYALTY" },
      { name: `@${channelBase}User`, color: "#4FFF5B", detail: "Frequent Commenter", tag: "VIBE" },
      { name: `@${channelBase}Fan`, color: "#FFE357", detail: "Early Supporter", tag: "LEGEND" },
    ].slice(0, common.instance.size === "quarter" ? 1 : 4)
  }, [comments, data.authState.channelName, common.instance.size])

  return (
    <WidgetShell {...common} icon={<Star size={22} />}>
      <div className="vt-widget-fill" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {loading ? (
          <div style={{ opacity: 0.3, fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>Scanning for superfans...</div>
        ) : (
          displayFans.map((fan, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                borderBottom: idx < displayFans.length - 1 ? "1px solid #eee" : "none",
                paddingBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: fan.color,
                  border: "2px solid #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {fan.name.charAt(1).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800 }}>{fan.name}</span>
                  <span style={{ fontSize: "8px", fontWeight: 900, background: fan.color, padding: "1px 4px", borderRadius: "4px", border: "1px solid #000" }}>{fan.tag}</span>
                </div>
                <div style={{ fontSize: "9px", fontWeight: 700, opacity: 0.5 }}>{fan.detail}</div>
              </div>
            </div>
          ))
        )}
     </div>
   </WidgetShell>
  )
}
