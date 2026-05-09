import React, { useState } from "react"
import { Brain, Zap, Sparkles, Dna, BarChart3, Map } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"
import { useBrain } from "../../../context/useBrain"
import { reflectAndCompress } from "../../../services/brain"

interface BrainHubWidgetProps extends CommonWidgetProps {
  data: DashboardData
  editMode?: boolean
}

const MEMORY_SECTIONS = [
  { key: "identityAndAspirations", label: "Identity", icon: Sparkles, color: "#FF3399" },
  { key: "contentDNA", label: "Content DNA", icon: Dna, color: "#00D2FF" },
  { key: "performanceLedger", label: "Performance", icon: BarChart3, color: "#C9F830" },
  { key: "futureStateMap", label: "Future Map", icon: Map, color: "#FFB570" },
] as const

export const BrainHubWidget: React.FC<BrainHubWidgetProps> = ({ data, editMode, ...common }) => {
  const { getBrainMemory } = useBrain()
  const memory = getBrainMemory()
  const [isReflecting, setIsReflecting] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const handleReflect = async () => {
    setIsReflecting(true)
    try {
      await reflectAndCompress()
      window.location.reload()
    } catch {
      setIsReflecting(false)
    }
  }

  const lastSync = memory.lastReflection
    ? new Date(memory.lastReflection).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Never"

  return (
    <WidgetShell {...common} icon={<Brain size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%", overflow: "auto" }}>

        {/* OODA Directive Banner */}
        {memory.strategicAdvice && (
          <div style={{
            background: "#000",
            color: "#ccff00",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "3px solid #000",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}>
            <div style={{
              background: "#ccff00",
              borderRadius: "6px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Zap size={14} color="#000" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "8px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                opacity: 0.5,
                marginBottom: "2px",
              }}>
                OODA Directive
              </div>
              <div style={{
                fontSize: "11px",
                fontWeight: 900,
                lineHeight: 1.3,
                textTransform: "uppercase",
                fontStyle: "italic",
              }}>
                "{memory.strategicAdvice}"
              </div>
            </div>
          </div>
        )}

        {/* Memory Sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {MEMORY_SECTIONS.map(({ key, label, icon: Icon, color }) => {
            const value = (memory as any)[key] || "Awaiting data..."
            const isExpanded = expandedSection === key
            const truncated = value.length > 60 ? value.slice(0, 60) + "…" : value

            return (
              <div
                key={key}
                onClick={() => setExpandedSection(isExpanded ? null : key)}
                style={{
                  background: isExpanded ? "#f9f9f9" : "#fff",
                  border: "2.5px solid #000",
                  borderRadius: "10px",
                  padding: "8px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                  <div style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    background: color,
                    border: "1.5px solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={10} color="#000" />
                  </div>
                  <span style={{
                    fontSize: "8px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {label}
                  </span>
                </div>
                <div style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  lineHeight: 1.4,
                  opacity: 0.7,
                  overflow: "hidden",
                  ...(isExpanded
                    ? {}
                    : {
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as any,
                      }),
                }}>
                  {isExpanded ? value : truncated}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer: Stats + Reflect */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
          paddingTop: "4px",
          borderTop: "2px solid #f0f0f0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ccff00",
                boxShadow: "0 0 6px #ccff00",
              }} />
              <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.3 }}>
                Synced: {lastSync}
              </span>
            </div>
            <span style={{
              fontSize: "8px",
              fontWeight: 900,
              background: "#f0f0f0",
              border: "1.5px solid #000",
              borderRadius: "4px",
              padding: "1px 5px",
            }}>
              {memory.interactionCount} signals
            </span>
          </div>

          <button
            onClick={handleReflect}
            disabled={isReflecting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#000",
              color: "#fff",
              border: "2.5px solid #000",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "8px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              cursor: isReflecting ? "wait" : "pointer",
              opacity: isReflecting ? 0.5 : 1,
              boxShadow: "2px 2px 0px 0px #ccff00",
              transition: "all 0.15s",
            }}
          >
            <Zap size={10} color="#ccff00" />
            {isReflecting ? "Thinking..." : "Reflect"}
          </button>
        </div>
      </div>
    </WidgetShell>
  )
}
