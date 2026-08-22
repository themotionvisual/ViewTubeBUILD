import React, { useState, useEffect, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { useEntitlement } from "../../../context/entitlementContext"
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare,
  Share2,
  Users,
  Percent,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Zap,
  Search,
  Filter,
  Play,
  ExternalLink
} from "lucide-react"
import { generateVideoAutopsy, type VideoAutopsyResult } from "../../../services/gemini"
import { useBrain } from "../../../context/useBrain"

type RetentionMilestone = "10%" | "20%" | "30%" | "50%" | "75%" | "100%"

const RETENTION_MILESTONES: RetentionMilestone[] = ["10%", "20%", "30%", "50%", "75%", "100%"]

const HEALTH_COLORS: Record<string, string> = {
  excellent: "#C9F830",
  good: "#4FFF5B",
  warning: "#FFE357",
  critical: "#FF1744"
}

const QUADRANT_LABELS: Record<string, { label: string; color: string; description: string }> = {
  gold: { label: "GOLD STANDARD", color: "#C9F830", description: "High CTR + High Retention" },
  clickbait: { label: "CLICKBAIT TRAP", color: "#FF1744", description: "High CTR + Low Retention" },
  hidden_gem: { label: "HIDDEN GEM", color: "#00D2FF", description: "Low CTR + High Retention" },
  needs_overhaul: { label: "NEEDS WORK", color: "#FFB570", description: "Low CTR + Low Retention" }
}

export const VideoAutopsyWidget = ({
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
  const { brain } = useBrain()
  const entitlement = useEntitlement()
  const common = {
    widget,
    instance,
    editMode,
    canEdit: true,
    onToggleCollapse,
    onCycleSize,
    onDecSize,
    onCycleHeight,
    onDecHeight,
    onRemove,
  }

  // State
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [autopsy, setAutopsy] = useState<VideoAutopsyResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["retention", "engagement"]))
  const [searchQuery, setSearchQuery] = useState("")
  const [requestedMilestones, setRequestedMilestones] = useState<Set<RetentionMilestone>>(new Set())
  const [syncStatus, setSyncStatus] = useState<Record<RetentionMilestone, "idle" | "syncing" | "done" | "error">>({
    "10%": "idle", "20%": "idle", "30%": "idle", "50%": "idle", "75%": "idle", "100%": "idle"
  })

  const canonicalVideos = useMemo(() => data.canonicalRows || data.brain?.canonicalRows || [], [data])
  
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return canonicalVideos.slice(0, 20)
    const query = searchQuery.toLowerCase()
    return canonicalVideos.filter((v: any) => 
      v.title?.toLowerCase().includes(query) || v.videoId?.includes(query)
    ).slice(0, 20)
  }, [canonicalVideos, searchQuery])

  const selectedVideo = useMemo(() => {
    if (!selectedVideoId) return null
    return canonicalVideos.find((v: any) => v.videoId === selectedVideoId)
  }, [selectedVideoId, canonicalVideos])

  // Calculate channel averages for benchmarking
  const channelAverages = useMemo(() => {
    if (canonicalVideos.length === 0) return undefined
    
    const withMetrics = canonicalVideos.filter((v: any) => v.views > 0)
    if (withMetrics.length === 0) return undefined

    const totalViews = withMetrics.reduce((sum: number, v: any) => sum + (v.views || 0), 0)
    const totalLikes = withMetrics.reduce((sum: number, v: any) => sum + (v.likes || 0), 0)
    
    return {
      avgCtr: withMetrics.reduce((sum: number, v: any) => sum + (v.ctr || 0), 0) / withMetrics.length,
      avgViewPercentage: withMetrics.reduce((sum: number, v: any) => sum + (v.avgViewPercentage || 0), 0) / withMetrics.length,
      avgLikesPerView: totalViews > 0 ? (totalLikes / totalViews) * 100 : 0
    }
  }, [canonicalVideos])

  const handleRunAutopsy = async () => {
    if (!selectedVideo) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const videoData = {
        videoId: selectedVideo.videoId,
        title: selectedVideo.title,
        views: selectedVideo.views || 0,
        likes: selectedVideo.likes || 0,
        comments: selectedVideo.comments || 0,
        shares: selectedVideo.shares || 0,
        ctr: selectedVideo.ctr || selectedVideo.videoThumbnailImpressionsClickRate || 0,
        avgViewDuration: selectedVideo.avgViewDuration || selectedVideo.averageViewDuration || 0,
        avgViewPercentage: selectedVideo.avgViewPercentage || selectedVideo.averageViewPercentage || 0,
        impressions: selectedVideo.impressions || selectedVideo.videoThumbnailImpressions || 0,
        subscribersGained: selectedVideo.subscribersGained || 0,
        subscribersLost: selectedVideo.subscribersLost || 0,
        trafficSources: selectedVideo.trafficSources || {},
        retentionData: selectedVideo.retentionData || []
      }
      
      const result = await generateVideoAutopsy(videoData, channelAverages, brain)
      setAutopsy(result)
    } catch (e: any) {
      console.error("Autopsy failed:", e)
      setError(e.message || "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Simulate requesting retention milestone data sync
  const handleRequestMilestoneSync = async (milestone: RetentionMilestone) => {
    setRequestedMilestones(prev => new Set(prev).add(milestone))
    setSyncStatus(prev => ({ ...prev, [milestone]: "syncing" }))
    
    // Simulate API call - in real implementation this would call YouTube Analytics API
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, [milestone]: "done" }))
    }, 1500)
  }

  const handleRequestAllMilestones = async () => {
    RETENTION_MILESTONES.forEach(m => {
      handleRequestMilestoneSync(m)
    })
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const headerContent = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ 
        fontSize: "9px", 
        fontWeight: 900, 
        textTransform: "uppercase",
        padding: "2px 6px",
        background: autopsy ? HEALTH_COLORS[autopsy.overallHealth] : "#E0E0E0",
        border: "2px solid #000",
        borderRadius: "4px"
      }}>
        {autopsy ? `${autopsy.healthScore}/100` : "SELECT VIDEO"}
      </div>
    </div>
  )

  return (
    <WidgetShell {...common} headerContent={headerContent} icon={<Activity size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
        
        {/* Video Selector */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
            <input
              type="text"
              className="vt-input"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "28px", height: "32px", fontSize: "10px" }}
            />
          </div>
        </div>

        {/* Video List / Selector */}
        {!selectedVideoId && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            {filteredVideos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", opacity: 0.3, fontWeight: 900, fontSize: "11px" }}>
                NO VIDEOS FOUND
              </div>
            ) : (
              filteredVideos.map((video: any) => (
                <button
                  key={video.videoId}
                  onClick={() => setSelectedVideoId(video.videoId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    border: "2px solid #000",
                    borderRadius: "8px",
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%"
                  }}
                >
                  <div style={{
                    width: "48px",
                    height: "27px",
                    background: "#000",
                    borderRadius: "4px",
                    overflow: "hidden",
                    flexShrink: 0
                  }}>
                    <img 
                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      alt=""
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "10px", fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {video.title}
                    </div>
                    <div style={{ fontSize: "8px", fontWeight: 700, opacity: 0.5, display: "flex", gap: "8px" }}>
                      <span>{video.views?.toLocaleString() || 0} views</span>
                      <span>{video.ctr ? `${(video.ctr * 100).toFixed(1)}% CTR` : ""}</span>
                    </div>
                  </div>
                  <ChevronDown size={14} style={{ opacity: 0.3 }} />
                </button>
              ))
            )}
          </div>
        )}

        {/* Selected Video Analysis */}
        {selectedVideoId && selectedVideo && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Selected Video Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px",
              border: "3px solid #000",
              borderRadius: "10px",
              background: "#fff"
            }}>
              <div style={{
                width: "60px",
                height: "34px",
                background: "#000",
                borderRadius: "6px",
                overflow: "hidden",
                flexShrink: 0,
                border: "2px solid #000"
              }}>
                <img 
                  src={`https://img.youtube.com/vi/${selectedVideo.videoId}/mqdefault.jpg`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  alt=""
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedVideo.title}
                </div>
                <div style={{ fontSize: "9px", fontWeight: 700, opacity: 0.5 }}>
                  {selectedVideo.views?.toLocaleString() || 0} views
                </div>
              </div>
              <button
                onClick={() => { setSelectedVideoId(null); setAutopsy(null); }}
                className="vt-button"
                style={{ height: "24px", fontSize: "8px", padding: "0 8px" }}
              >
                CHANGE
              </button>
            </div>

            {/* Run Autopsy Button */}
            {!autopsy && (
              <button
                onClick={handleRunAutopsy}
                disabled={isAnalyzing}
                className="vt-button primary"
                style={{ height: "40px", fontSize: "12px", gap: "8px" }}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    ANALYZING...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    RUN PERFORMANCE AUTOPSY
                  </>
                )}
              </button>
            )}

            {error && (
              <div style={{
                padding: "10px",
                background: "#FFE0E0",
                border: "2px solid #FF1744",
                borderRadius: "8px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#FF1744"
              }}>
                {error}
              </div>
            )}

            {/* Autopsy Results */}
            {autopsy && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                
                {/* Health Score Banner */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: HEALTH_COLORS[autopsy.overallHealth],
                  border: "3px solid #000",
                  borderRadius: "10px"
                }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.7 }}>
                      Overall Health
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: 1000 }}>
                      {autopsy.healthScore}/100
                    </div>
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    background: "#000",
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase"
                  }}>
                    {autopsy.overallHealth}
                  </div>
                </div>

                {/* CTR/AVD Quadrant */}
                <div style={{
                  padding: "10px",
                  background: QUADRANT_LABELS[autopsy.ctrAvdQuadrant].color,
                  border: "3px solid #000",
                  borderRadius: "10px"
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 1000, textTransform: "uppercase" }}>
                    {QUADRANT_LABELS[autopsy.ctrAvdQuadrant].label}
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: 700, opacity: 0.7 }}>
                    {QUADRANT_LABELS[autopsy.ctrAvdQuadrant].description}
                  </div>
                </div>

                {/* Retention Milestones Section */}
                <div style={{
                  border: "3px solid #000",
                  borderRadius: "10px",
                  overflow: "hidden"
                }}>
                  <button
                    onClick={() => toggleSection("retention")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px",
                      background: "#00D2FF",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
                      Retention Milestones
                    </span>
                    {expandedSections.has("retention") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSections.has("retention") && (
                    <div style={{ padding: "10px", background: "#fff" }}>
                      {/* Request All Button */}
                      <button
                        onClick={handleRequestAllMilestones}
                        className="vt-button secondary"
                        style={{ width: "100%", height: "28px", fontSize: "9px", marginBottom: "10px" }}
                      >
                        <RefreshCw size={12} /> REQUEST ALL MILESTONES
                      </button>
                      
                      {/* Milestone Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        {RETENTION_MILESTONES.map((milestone) => {
                          const analysis = autopsy.retentionAnalysis.find(r => r.milestone === milestone)
                          const status = syncStatus[milestone]
                          
                          return (
                            <div
                              key={milestone}
                              style={{
                                padding: "8px",
                                border: "2px solid #000",
                                borderRadius: "8px",
                                background: status === "done" ? (
                                  analysis?.status === "strong" ? "#C9F830" :
                                  analysis?.status === "average" ? "#FFE357" : "#FF8AAF"
                                ) : "#F5F5F5",
                                textAlign: "center"
                              }}
                            >
                              <div style={{ fontSize: "14px", fontWeight: 1000 }}>{milestone}</div>
                              {status === "syncing" && (
                                <Loader2 size={12} className="animate-spin mx-auto mt-1" />
                              )}
                              {status === "done" && analysis && (
                                <div style={{ fontSize: "8px", fontWeight: 700, marginTop: "2px" }}>
                                  {analysis.percentage.toFixed(1)}% retained
                                </div>
                              )}
                              {status === "idle" && (
                                <button
                                  onClick={() => handleRequestMilestoneSync(milestone)}
                                  style={{
                                    fontSize: "7px",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    marginTop: "2px"
                                  }}
                                >
                                  REQUEST
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Engagement Health Section */}
                <div style={{
                  border: "3px solid #000",
                  borderRadius: "10px",
                  overflow: "hidden"
                }}>
                  <button
                    onClick={() => toggleSection("engagement")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px",
                      background: "#FF83EA",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
                      Engagement Health
                    </span>
                    {expandedSections.has("engagement") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSections.has("engagement") && (
                    <div style={{ padding: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {autopsy.engagementHealth.map((metric, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 8px",
                            background: metric.status === "above" ? "#C9F830" :
                                       metric.status === "at" ? "#FFE357" : "#FF8AAF",
                            borderRadius: "6px",
                            border: "2px solid #000"
                          }}
                        >
                          <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase" }}>
                            {metric.metric}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "10px", fontWeight: 1000 }}>
                              {typeof metric.value === "number" ? metric.value.toFixed(2) : metric.value}
                            </span>
                            {metric.status === "above" && <TrendingUp size={12} />}
                            {metric.status === "below" && <TrendingDown size={12} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Key Insights */}
                <div style={{
                  border: "3px solid #000",
                  borderRadius: "10px",
                  overflow: "hidden"
                }}>
                  <button
                    onClick={() => toggleSection("insights")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px",
                      background: "#FFE357",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
                      Key Insights
                    </span>
                    {expandedSections.has("insights") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSections.has("insights") && (
                    <div style={{ padding: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {autopsy.keyInsights.map((insight, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            padding: "6px",
                            background: "#F5F5F5",
                            borderRadius: "6px",
                            fontSize: "9px",
                            fontWeight: 700
                          }}
                        >
                          <Zap size={12} style={{ flexShrink: 0, color: "#FFB570" }} />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Plan */}
                <div style={{
                  border: "3px solid #000",
                  borderRadius: "10px",
                  overflow: "hidden"
                }}>
                  <button
                    onClick={() => toggleSection("actions")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px",
                      background: "#4FFF5B",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
                      Action Plan
                    </span>
                    {expandedSections.has("actions") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSections.has("actions") && (
                    <div style={{ padding: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {autopsy.actionPlan.map((action, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            padding: "8px",
                            border: "2px solid #000",
                            borderRadius: "8px",
                            background: "#fff"
                          }}
                        >
                          <div style={{
                            width: "24px",
                            height: "24px",
                            background: "#000",
                            color: "#fff",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 1000,
                            flexShrink: 0
                          }}>
                            {action.priority}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "10px", fontWeight: 900 }}>{action.action}</div>
                            <div style={{ fontSize: "8px", fontWeight: 700, opacity: 0.6, marginTop: "2px" }}>
                              Expected: {action.expectedImpact}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Re-run Button */}
                <button
                  onClick={handleRunAutopsy}
                  disabled={isAnalyzing}
                  className="vt-button secondary"
                  style={{ height: "32px", fontSize: "10px" }}
                >
                  <RefreshCw size={14} /> REFRESH ANALYSIS
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </WidgetShell>
  )
}
