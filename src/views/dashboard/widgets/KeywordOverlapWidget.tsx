import React, { useMemo, useState } from "react"
import { ChevronDown, GitMerge } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  buildKeywordConstellationDataset,
  buildKeywordSelectionSummary,
  modeLabel,
  type KeywordMetricMode,
  type KeywordNode,
} from "./keywordOverlap"

const NODE_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 50, y: 30 },
  { x: 36, y: 50 },
  { x: 64, y: 50 },
  { x: 50, y: 43 },
  { x: 42, y: 37 },
  { x: 58, y: 37 },
  { x: 28, y: 30 },
  { x: 72, y: 30 },
  { x: 27, y: 58 },
  { x: 73, y: 58 },
]

const MODE_OPTIONS: KeywordMetricMode[] = ["views", "likes", "shares", "comments", "engagement_matrix"]

const CORE_COLORS = ["rgba(255, 0, 170, 0.58)", "rgba(0, 185, 255, 0.58)", "rgba(215, 255, 0, 0.58)"]
const MID_COLORS = ["rgba(255, 120, 0, 0.46)", "rgba(80, 235, 200, 0.46)", "rgba(175, 135, 255, 0.46)"]
const OUTER_COLORS = ["rgba(0, 185, 255, 0.35)", "rgba(255, 0, 170, 0.35)", "rgba(215, 255, 0, 0.35)", "rgba(80, 235, 200, 0.35)"]

const formatMetric = (value: number): string => {
  if (!Number.isFinite(value)) return "0"
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return Math.round(value).toLocaleString()
}

const metricLine = (node: KeywordNode): string => {
  return `V/L/S/C: ${formatMetric(node.avgViews)} / ${formatMetric(node.avgLikes)} / ${formatMetric(node.avgShares)} / ${formatMetric(node.avgComments)}`
}

const nodeSizePct = (tier: KeywordNode["tier"]): number => {
  if (tier === "core") return 42
  if (tier === "mid") return 31
  return 24
}

const nodeColor = (node: KeywordNode): string => {
  if (node.tier === "core") return CORE_COLORS[Math.max(0, Math.min(2, node.rank - 1))]
  if (node.tier === "mid") return MID_COLORS[(node.rank - 4) % MID_COLORS.length]
  return OUTER_COLORS[(node.rank - 7) % OUTER_COLORS.length]
}

const MetricModeDropdown: React.FC<{
  mode: KeywordMetricMode
  onChange: (mode: KeywordMetricMode) => void
}> = ({mode, onChange, onDecSize, onCycleHeight, onDecHeight}) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          height: "30px",
          border: "2px solid #000",
          borderRadius: "8px",
          background: "#fff",
          color: "#000",
          fontSize: "10px",
          fontWeight: 900,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px",
          cursor: "pointer",
        }}>
        <span>Metric: {modeLabel(mode)}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "34px",
            left: 0,
            right: 0,
            border: "2px solid #000",
            borderRadius: "8px",
            background: "#fff",
            zIndex: 10,
            overflow: "hidden",
          }}>
          {MODE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
              style={{
                width: "100%",
                height: "28px",
                border: "none",
                borderTop: option === MODE_OPTIONS[0] ? "none" : "1px solid #000",
                background: option === mode ? "#000" : "#fff",
                color: option === mode ? "#fff" : "#000",
                fontSize: "10px",
                fontWeight: 900,
                textTransform: "uppercase",
                textAlign: "left",
                padding: "0 8px",
                cursor: "pointer",
              }}>
              Metric: {modeLabel(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const KeywordOverlapWidget = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
  data,
}: any) => {
  const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }

  const [metricMode, setMetricMode] = useState<KeywordMetricMode>("views")
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])

  const dataset = useMemo(
    () => buildKeywordConstellationDataset(data.canonicalRows || [], metricMode),
    [data.canonicalRows, metricMode],
  )

  const summary = useMemo(
    () => buildKeywordSelectionSummary(data.canonicalRows || [], selectedKeywords, metricMode),
    [data.canonicalRows, selectedKeywords, metricMode],
  )

  const nodes = dataset.nodes.slice(0, 10)
  const hasEnoughData = nodes.length >= 3
  const topKeywords = nodes.slice(0, 3)

  const toggleKeyword = (word: string) => {
    setSelectedKeywords((current) => {
      if (current.includes(word)) return current.filter((entry) => entry !== word)
      if (current.length >= 3) return [current[1], current[2], word]
      return [...current, word]
    })
  }

  return (
    <WidgetShell {...common} icon={<GitMerge size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%", overflow: "auto" }}>
        {!hasEnoughData ? (
          <div style={{ border: "2px solid #000", borderRadius: "10px", padding: "10px", background: "#F5F5F5" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Need More Keyword Data</div>
            <div style={{ fontSize: "10px", fontWeight: 700, opacity: 0.7, marginTop: "4px" }}>
              This chart needs at least 3 recurring title keywords appearing in 2 or more videos.
            </div>
          </div>
        ) : (
          <>
            <div style={{ border: "2px solid #000", borderRadius: "10px", background: "#ECECEC", padding: "8px" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", border: "2px solid #000", borderRadius: "8px", background: "#F8F8F8", overflow: "hidden" }}>
                {nodes.map((node) => {
                  const slot = NODE_POSITIONS[Math.max(0, Math.min(NODE_POSITIONS.length - 1, node.slot))]
                  const sizePct = nodeSizePct(node.tier)
                  const active = selectedKeywords.length === 0 || selectedKeywords.includes(node.word)
                  const showText = node.rank <= 2
                  return (
                    <button
                      key={node.word}
                      onClick={() => toggleKeyword(node.word)}
                      title={`${node.word} · ${metricLine(node)} · ${node.coveragePct.toFixed(1)}% coverage`}
                      style={{
                        position: "absolute",
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        transform: "translate(-50%, -50%)",
                        width: `${sizePct}%`,
                        height: `${sizePct}%`,
                        borderRadius: "50%",
                        border: selectedKeywords.includes(node.word) ? "2px solid #000" : "1px solid rgba(0,0,0,0.45)",
                        background: nodeColor(node),
                        opacity: active ? 1 : 0.3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: "4px",
                        fontSize: "9px",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        color: "#000",
                        cursor: "pointer",
                      }}>
                      {showText ? node.word : ""}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {nodes.map((keyword, idx) => {
                const active = selectedKeywords.includes(keyword.word)
                const badgeColor = idx < 3 ? CORE_COLORS[idx] : idx < 6 ? MID_COLORS[idx - 3] : OUTER_COLORS[idx - 6]
                return (
                  <button
                    key={keyword.word}
                    onClick={() => toggleKeyword(keyword.word)}
                    style={{
                      border: "1.5px solid #000",
                      borderRadius: "999px",
                      padding: "3px 8px",
                      fontSize: "9px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      background: active ? badgeColor : "#fff",
                      color: "#000",
                    }}>
                    {keyword.word}
                  </button>
                )
              })}
            </div>

            <MetricModeDropdown mode={metricMode} onChange={setMetricMode} />
          </>
        )}

        {summary && (
          <div style={{ border: "2px solid #000", borderRadius: "10px", padding: "8px", background: "#fff" }}>
            <div style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>
              Selection: {summary.keywords.join(" + ")}
            </div>
            <div style={{ fontSize: "9px", fontWeight: 700, marginTop: "4px" }}>
              Videos: {summary.videoCount} · Coverage: {summary.coveragePct.toFixed(1)}%
            </div>
            <div style={{ fontSize: "9px", fontWeight: 700 }}>
              Avg V/L/S/C: {formatMetric(summary.avgViews)} / {formatMetric(summary.avgLikes)} / {formatMetric(summary.avgShares)} / {formatMetric(summary.avgComments)}
            </div>
            <div style={{ fontSize: "9px", fontWeight: 700 }}>
              {modeLabel(metricMode)}: {formatMetric(summary.primaryMetricValue)}
            </div>
            <div style={{ marginTop: "6px", display: "grid", gap: "4px" }}>
              {summary.sampleTitles.length ? summary.sampleTitles.map((title) => (
                <div
                  key={title}
                  title={title}
                  style={{
                    border: "1px solid #000",
                    borderRadius: "6px",
                    padding: "4px 6px",
                    fontSize: "9px",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    background: "#F8F8F8",
                  }}>
                  {title}
                </div>
              )) : (
                <div style={{ fontSize: "9px", fontWeight: 700, opacity: 0.7 }}>No matching videos for this combination.</div>
              )}
            </div>
          </div>
        )}

        <div style={{ border: "2px solid #000", borderRadius: "10px", padding: "8px", background: "#fff" }}>
          <div style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", marginBottom: "6px" }}>
            Ranked Keywords ({modeLabel(metricMode)})
          </div>
          <div style={{ display: "grid", gap: "4px" }}>
            {nodes.map((keyword) => (
              <div
                key={keyword.word}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "1.5px solid #000",
                  borderRadius: "8px",
                  background: "#F6F6F6",
                  padding: "6px 8px",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>{keyword.word}</span>
                  <span style={{ fontSize: "10px", fontWeight: 900 }}>{formatMetric(keyword.primaryMetricValue)}</span>
                </div>
                <div style={{ fontSize: "9px", fontWeight: 700, opacity: 0.75 }}>
                  {metricLine(keyword)} · {keyword.videoCount} vids · {keyword.coveragePct.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
