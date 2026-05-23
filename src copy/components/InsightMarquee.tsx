import React, { useMemo, useState, useEffect } from "react"

export type InsightBadgeTone = "cyan" | "lime" | "white"

export interface InsightMarqueeSegment {
  badge: string
  text: string
  badgeTone?: InsightBadgeTone
}

export interface InsightMarqueeProps {
  segments?: InsightMarqueeSegment[]
  chartInsight?: string
  personalInsight?: string
  mode?: "insight-lock" | "simple-scroll"
}

const badgeToneClass = (tone?: InsightBadgeTone): string => {
  if (tone === "cyan") return "bg-[#00CCFF] text-black"
  if (tone === "lime") return "bg-[#CCFF00] text-black"
  return "bg-white text-black"
}

export const InsightMarquee: React.FC<InsightMarqueeProps> = ({
  segments,
  chartInsight,
  personalInsight,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const safeSegments = useMemo<InsightMarqueeSegment[]>(() => {
    const arr: InsightMarqueeSegment[] = []
    if (segments && segments.length > 0) {
      arr.push(...segments)
    }
    if (chartInsight) {
      arr.push({ badge: "CHART", text: chartInsight, badgeTone: "cyan" })
    }
    if (personalInsight) {
      arr.push({ badge: "ACTION", text: personalInsight, badgeTone: "lime" })
    }
    if (arr.length === 0) {
      arr.push({ badge: "INSIGHT", text: "No insights available.", badgeTone: "white" })
    }
    return arr
  }, [segments, chartInsight, personalInsight])

  useEffect(() => {
    if (safeSegments.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % safeSegments.length);
    }, 8000); // 8 seconds per insight
    return () => clearInterval(interval);
  }, [safeSegments.length]);

  return (
    <div className="w-full flex items-center h-10 px-4 overflow-hidden relative">
      {safeSegments.map((segment, idx) => (
        <div 
          key={idx} 
          className={`absolute left-4 right-4 flex items-center gap-3 transition-opacity duration-1000 ${
            idx === activeIdx ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <span className={`px-2 py-0.5 border-[2.5px] border-black rounded-md font-[1000] text-[11px] uppercase tracking-wider shrink-0 ${badgeToneClass(segment.badgeTone)}`}>
            {segment.badge}
          </span>
          <span className="font-black text-[12px] uppercase tracking-tight text-white/90 truncate">
            {segment.text}
          </span>
        </div>
      ))}
    </div>
  )
}
