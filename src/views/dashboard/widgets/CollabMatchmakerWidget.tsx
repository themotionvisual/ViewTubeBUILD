import React, { useState, useEffect } from "react"
import { Users, Mail, Phone, ExternalLink, Sparkles, MessageCircle, ArrowRight, UserPlus } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { generateCollabOpportunities, type CollabPeer } from "../../../services/CollabEngine"

export const CollabMatchmakerWidget: React.FC<any> = ({
  widget, instance, editMode, onToggleCollapse, onCycleSize, onCycleHeight, onRemove, data, canEdit
}) => {
  const common = { widget, instance, editMode, canEdit, onToggleCollapse, onCycleSize, onCycleHeight, onRemove }
  const [peers, setPeers] = useState<CollabPeer[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  const findPeers = async () => {
    setLoading(true)
    try {
      const myName = data.authState.channelName || "My Channel"
      const myNiche = data.brain?.channelProfile?.primaryNiche || "General Content"
      const mySubs = data.stats?.subscriberCount || 1000
      
      const results = await generateCollabOpportunities(myName, myNiche, mySubs)
      setPeers(results)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-load on first mount if empty
    if (peers.length === 0 && !loading) {
      findPeers()
    }
  }, [])

  const selectedPeer = peers.find(p => p.id === selectedPeerId)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(id)
    setTimeout(() => setCopySuccess(null), 2000)
  }

  return (
    <WidgetShell {...common} title="COLLAB MATCHMAKER" icon={<Users size={20} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "8px", overflow: "hidden" }}>
        
        {/* Header Action */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "4px", borderBottom: "1px solid #eee" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, opacity: 0.6 }}>PEER NETWORK</span>
          <button 
            onClick={findPeers}
            disabled={loading}
            className="widget-control-btn" 
            style={{ padding: "2px 8px", height: "22px", background: "#4FFF5B" }}
          >
            {loading ? "SEARCHING..." : "REFRESH LIST"}
          </button>
        </div>

        <div style={{ display: "flex", flex: 1, gap: "8px", overflow: "hidden" }}>
          {/* List Side */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            paddingRight: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            {peers.length === 0 && !loading && (
              <div style={{ padding: "20px", textAlign: "center", opacity: 0.5, fontSize: "12px" }}>
                No peers found. Click refresh to scan.
              </div>
            )}
            
            {peers.map(peer => (
              <div 
                key={peer.id}
                onClick={() => setSelectedPeerId(peer.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px",
                  border: `2px solid ${selectedPeerId === peer.id ? "black" : "#eee"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: selectedPeerId === peer.id ? "#f9f9f9" : "white",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ 
                  width: "24px", 
                  height: "24px", 
                  borderRadius: "50%", 
                  border: "1px solid black",
                  background: "#eee",
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  <img src={peer.thumbnail || `https://i.pravatar.cc/50?u=${peer.id}`} alt="" style={{ width: "100%", height: "100%" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{peer.name}</div>
                    <div style={{ fontSize: "8px", fontWeight: 900, color: "#4FFF5B" }}>{peer.nicheMatch}% MATCH</div>
                  </div>
                  <div style={{ fontSize: "8px", opacity: 0.6, fontWeight: 700 }}>{peer.subscriberCount.toLocaleString()} SUBS</div>
                </div>
              </div>
            ))}
          </div>

          {/* Details Side (Expanded) */}
          <div style={{ 
            flex: 1.5, 
            background: "#f0f0f0", 
            border: "2px solid black",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            overflowY: "auto",
            position: "relative"
          }}>
            {selectedPeer ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "11px", fontWeight: 900, marginBottom: "2px" }}>{selectedPeer.name.toUpperCase()}</h4>
                    <p style={{ fontSize: "8px", fontWeight: 700, opacity: 0.6 }}>{selectedPeer.handle}</p>
                  </div>
                  <a 
                    href={`https://youtube.com/${selectedPeer.handle}/about`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: "black", background: "#eee", border: "1.5px solid black", borderRadius: "4px", padding: "2px" }}
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div style={{ borderTop: "1.5px dashed #ccc", paddingTop: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                    <Sparkles size={10} color="#FF3399" />
                    <span style={{ fontSize: "8px", fontWeight: 900, color: "#FF3399" }}>COLLAB CONCEPT</span>
                  </div>
                  <div style={{ 
                    background: "white", 
                    border: "1.5px solid black", 
                    borderRadius: "6px", 
                    padding: "6px", 
                    fontSize: "9px", 
                    lineHeight: "1.3",
                    fontWeight: 700
                  }}>
                    {selectedPeer.collabIdea}
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MessageCircle size={10} color="#00D2FF" />
                      <span style={{ fontSize: "8px", fontWeight: 900, color: "#00D2FF" }}>OUTREACH MESSAGE</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(selectedPeer.outreachMessage || "", selectedPeer.id)}
                      style={{ fontSize: "7px", fontWeight: 900, padding: "2px 4px", background: copySuccess === selectedPeer.id ? "#4FFF5B" : "#eee", border: "1px solid black", borderRadius: "4px" }}
                    >
                      {copySuccess === selectedPeer.id ? "COPIED!" : "COPY"}
                    </button>
                  </div>
                  <div style={{ 
                    background: "#e8faff", 
                    border: "1.5px solid black", 
                    borderRadius: "6px", 
                    padding: "6px", 
                    fontSize: "9px", 
                    lineHeight: "1.3",
                    fontStyle: "italic",
                    whiteSpace: "pre-wrap"
                  }}>
                    "{selectedPeer.outreachMessage}"
                  </div>
                </div>

                <div style={{ marginTop: "auto", display: "flex", gap: "4px" }}>
                  <button className="widget-control-btn" style={{ flex: 1, height: "24px", fontSize: "8px" }}>
                     SEND DM (TWITTER)
                  </button>
                  <button className="widget-control-btn" style={{ flex: 1, height: "24px", fontSize: "8px" }}>
                     FIND EMAIL
                  </button>
                </div>
              </>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <Users size={32} style={{ opacity: 0.2 }} />
                  <p style={{ fontSize: "10px", fontWeight: 700, opacity: 0.4 }}>SELECT A PEER TO GENERATE CAMPAIGN</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
