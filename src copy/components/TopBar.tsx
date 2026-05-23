import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, ChevronLeft, ChevronRight, RefreshCw, UserCircle2 } from "lucide-react"
import { useEntitlement } from "../app/AppShell"
import { useBrain } from "../context/useBrain"
import { useDashboard } from "../context/DashboardContext"
import { isOwnerEmail } from "../services/billingEntitlement"
import {
  dismissAiBrainIntake,
  loadAiBrainContext,
  saveAiBrainContext,
  shouldShowAiBrainIntake,
  type BrainPrimaryGoal,
} from "../services/aiBrainContext"
import {
  formatSyncLabel,
  resolvePrimaryAuthAction,
  getSyncTimestamp,
} from "../services/onboardingState"

const planLabel = (planId: string): string => {
  if (planId === "basic") return "Basic"
  if (planId === "creator") return "Creator"
  if (planId === "creator_plus") return "Creator Plus"
  if (planId === "creator_pro") return "Creator Pro"
  if (planId === "executive") return "Executive"
  return "Basic"
}

const knownEmail = (): string => {
  if (typeof window === "undefined") return ""
  const a = String(localStorage.getItem("vt_known_user_email") || "").trim().toLowerCase()
  if (a) return a
  return String(localStorage.getItem("vt_signup_email") || "").trim().toLowerCase()
}

interface TopBarProps {
  sidebarHidden?: boolean
  onToggleSidebar?: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ sidebarHidden = false, onToggleSidebar }) => {
  const navigate = useNavigate()
  const entitlement = useEntitlement()
  const { authState, login, logout, globalSyncData, updateBrain, lastSyncComplete } = useBrain()
  const { editMode, setEditMode, isLocked, setIsLocked, setPickerOpen, exportLayout, importLayout, resetLayout } = useDashboard()
  const [open, setOpen] = useState(false)
  const [widgetOptionsOpen, setWidgetOptionsOpen] = useState(false)
  const [aiBrainOptionsOpen, setAiBrainOptionsOpen] = useState(false)
  const [brainIntakeOpen, setBrainIntakeOpen] = useState(false)
  const [brainWhatNext, setBrainWhatNext] = useState("")
  const [brainPrimaryGoal, setBrainPrimaryGoal] = useState<BrainPrimaryGoal>("views")
  const [brainAudienceNiche, setBrainAudienceNiche] = useState("")
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

  const channelName = authState.channelName || "Not connected"
  const handleText = authState.channelHandle ? `@${String(authState.channelHandle).replace(/^@/, "")}` : "@not-connected"
  const isConnected = authState.isAuthenticated
  const syncTs = getSyncTimestamp(authState)
  const syncLabel = isConnected ? formatSyncLabel(syncTs) : "Not connected"
  const primaryAuthAction = resolvePrimaryAuthAction({
    isAuthenticated: authState.isAuthenticated,
    syncedAt: authState.syncedAt || lastSyncComplete,
    fastAnalytics: authState.fastAnalytics || null,
  })
  const email = useMemo(() => knownEmail(), [authState.isAuthenticated])

  const label = planLabel(entitlement.subscriptionPlanId)
  const unlimited = entitlement.tier === "large"
  const credits = unlimited ? "Unlimited" : `${Math.max(0, Math.floor(entitlement.creditBalance)).toLocaleString()} Credits`
  const cap = Math.max(1, Math.floor(entitlement.rolloverCap || entitlement.monthlyCreditGrant || 1))
  const pct = unlimited
    ? 100
    : Math.max(0, Math.min(100, Math.round((Math.max(0, entitlement.creditBalance) / cap) * 100)))

  const canSeeApiKeys = entitlement.subscriptionPlanId === "executive" || isOwnerEmail(email)

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!open) return
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      if (menuButtonRef.current?.contains(target)) return
      setOpen(false)
    }

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWidgetOptionsOpen(false)
        setAiBrainOptionsOpen(false)
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  useEffect(() => {
    if (!shouldShowAiBrainIntake(authState.isAuthenticated)) return
    const current = loadAiBrainContext()
    setBrainWhatNext(current.whatNext)
    setBrainPrimaryGoal(current.primaryGoal)
    setBrainAudienceNiche(current.audienceNiche)
    setBrainIntakeOpen(true)
  }, [authState.isAuthenticated])

  const onConnectOrSync = async () => {
    setOpen(false)
    setWidgetOptionsOpen(false)
    setAiBrainOptionsOpen(false)
    if (!authState.isAuthenticated) {
      await login()
      return
    }
    await globalSyncData({ batchMode: "initial" })
  }

  const onLogin = async () => {
    setOpen(false)
    setWidgetOptionsOpen(false)
    setAiBrainOptionsOpen(false)
    await login()
  }

  const closeDropdownMenus = () => {
    setOpen(false)
    setWidgetOptionsOpen(false)
    setAiBrainOptionsOpen(false)
  }

  const submitBrainIntake = () => {
    const saved = saveAiBrainContext({
      whatNext: brainWhatNext,
      primaryGoal: brainPrimaryGoal,
      audienceNiche: brainAudienceNiche,
    })
    updateBrain({
      creatorPreferences: {
        what_next_goal: saved.whatNext,
        primary_channel_goal: saved.primaryGoal,
        audience_niche: saved.audienceNiche,
      },
    })
    setBrainIntakeOpen(false)
  }

  const guestSubtitle = "Connect once, sync once, then let ViewTubeX guide your first growth win."

  return (
    <header className="sticky top-0 z-[120] w-full border-b-[3px] border-black bg-white">
      <div className="min-h-[96px] px-4 md:px-6 py-2 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/")}
          className="shrink-0 text-left leading-none"
          aria-label="Go to Dashboard"
        >
          <span className="text-[44px] md:text-[60px] font-[1000] tracking-[-0.06em] uppercase text-black">VIEW</span>
          <span className="text-[44px] md:text-[60px] font-[1000] tracking-[-0.01em] uppercase text-[#00CCFF]">TUBE</span>
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="h-9 px-3 border-[3px] border-black rounded-[10px] bg-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#000] inline-flex items-center gap-1 hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          {sidebarHidden ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {sidebarHidden ? "Show Nav" : "Hide Nav"}
        </button>

        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          {!isConnected && (
            <div className="hidden lg:block flex-1 min-w-[320px] max-w-[760px] border-[3px] border-black rounded-[10px] bg-[#f3f4f6] px-3 py-2 shadow-[2px_2px_0_0_#000]">
              <div className="text-[10px] font-[1000] uppercase tracking-[0.11em] leading-tight">
                Turn channel data into clear growth actions
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] opacity-75 leading-tight">
                Connect, sync, then launch your first optimized workflow in minutes.
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <div className="border-[2px] border-black rounded-[6px] bg-[#C9F830] px-1.5 py-1 text-[7px] font-black uppercase tracking-wider">
                  Daily Growth Signals
                </div>
                <div className="border-[2px] border-black rounded-[6px] bg-[#40C6E9] px-1.5 py-1 text-[7px] font-black uppercase tracking-wider">
                  AI Content Tools
                </div>
              </div>
            </div>
          )}
          {!isConnected && (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={onConnectOrSync}
                className="h-10 px-3 border-[3px] border-black rounded-[9px] bg-[#4FFF5B] text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] shadow-[2px_2px_0_0_#000] whitespace-nowrap"
              >
                Connect Channel
              </button>
              <button
                onClick={() => navigate("/subscribe")}
                className="h-10 px-3 border-[3px] border-black rounded-[9px] bg-[#FFE357] text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] shadow-[2px_2px_0_0_#000] whitespace-nowrap"
              >
                Join
              </button>
            </div>
          )}
          <button
            ref={menuButtonRef}
            onClick={() => setOpen((value) => !value)}
            className="h-[88px] min-w-[360px] px-3 border-[3px] border-black rounded-[14px] bg-[#C9F830] shadow-[3px_3px_0_0_#000] inline-flex items-center justify-between gap-2"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-14 h-14 rounded-full border-[3px] border-black bg-white overflow-hidden shrink-0">
                {authState.channelThumbnail ? (
                  <img src={authState.channelThumbnail} alt="Channel avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><UserCircle2 size={26} /></div>
                )}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[13px] font-black uppercase tracking-tight truncate">{channelName}</div>
                <div className="text-[10px] font-black uppercase tracking-wide opacity-75 truncate">
                  {isConnected ? handleText : "Not connected"}
                </div>
                <div className="text-[9px] font-black uppercase tracking-wide opacity-60 truncate">
                  {isConnected ? syncLabel : "Not connected"}
                </div>
              </div>
            </div>
            <div className="w-[220px] flex flex-col gap-1.5 border-[2px] border-black rounded-[10px] p-2.5 bg-white">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span>{label}</span>
                <span>{credits}</span>
              </div>
              <div className="h-[10px] border-[2px] border-black rounded-full overflow-hidden bg-white">
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    background: unlimited ? "#4FFF5B" : pct > 65 ? "#4FFF5B" : pct > 30 ? "#FFE357" : "#FF83EA",
                  }}
                />
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1 pl-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Menu</span>
              <ChevronDown size={16} />
            </div>
          </button>

          {open && (
            <div
              ref={menuRef}
              role="menu"
              className="absolute right-4 md:right-6 top-[106px] w-[300px] bg-white border-[3px] border-black rounded-[12px] shadow-[5px_5px_0_0_#000] p-2 flex flex-col gap-1 z-[130]"
              onMouseLeave={() => {
                setAiBrainOptionsOpen(false)
                setWidgetOptionsOpen(false)
              }}
              onClickCapture={(event) => {
                const target = event.target as HTMLElement
                const keepOpenButton = target.closest("button[data-keep-open='true']")
                if (keepOpenButton) return
                const clickedButton = target.closest("button")
                if (!clickedButton) return
                setTimeout(() => closeDropdownMenus(), 0)
              }}
            >
              {!isConnected && (
                <>
                  <button onClick={onConnectOrSync} className="text-left px-3 py-2 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">Connect Channel</button>
                  <button onClick={() => { setOpen(false); navigate("/subscribe") }} className="text-left px-3 py-2 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">Join</button>
                  <div className="h-[1px] bg-black/15 my-1" />
                </>
              )}
              <button onClick={() => { setOpen(false); navigate("/account") }} className="text-left px-3 py-2 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">Account Settings</button>
              <button
                data-keep-open="true"
                onMouseEnter={() => {
                  setAiBrainOptionsOpen(true)
                  setWidgetOptionsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-[10px] font-black uppercase inline-flex items-center justify-between border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]"
              >
                AI Brain Context
                <ChevronLeft size={12} className={`transition-transform ${aiBrainOptionsOpen ? "rotate-[-90deg]" : ""}`} />
              </button>
              <button onClick={() => { setOpen(false); navigate("/account?panel=billing") }} className="text-left px-3 py-2 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">Billing & Credits</button>
              <button onClick={onConnectOrSync} className="text-left px-3 py-2 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6] inline-flex items-center gap-2">{authState.isAuthenticated ? <RefreshCw size={12} /> : null}{primaryAuthAction}</button>

              <div className="h-[1px] bg-black/15 my-1" />
              <button
                data-keep-open="true"
                onMouseEnter={() => {
                  setWidgetOptionsOpen(true)
                  setAiBrainOptionsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-[10px] font-black uppercase inline-flex items-center justify-between border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]"
              >
                Widget Options
                <ChevronLeft size={12} className={`transition-transform ${widgetOptionsOpen ? "rotate-[-90deg]" : ""}`} />
              </button>
              {aiBrainOptionsOpen && (
                <div className="absolute right-full mr-2 top-[112px] w-[260px] border-[3px] border-black rounded-[12px] bg-white shadow-[5px_5px_0_0_#000] p-2 z-[140]">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1 px-1">AI Model Orchestration</div>
                  <button onClick={() => { setOpen(false); setAiBrainOptionsOpen(false); navigate("/account#ai-brain-context") }} className="w-full text-left px-2 py-1.5 rounded hover:bg-[#f3f4f6]">
                    <div className="text-[10px] font-black uppercase">Gemini 3.1 Flash Lite ⚡</div>
                    <div className="text-[9px] font-black uppercase opacity-70 mt-1">High-speed SEO & metadata. Best for volume.</div>
                    <span className="inline-flex items-center gap-1 mt-1">
                      <span className="text-[9px] border-[2px] border-black rounded px-1.5 py-0.5 bg-black text-white font-black uppercase">Cost: 1x</span>
                      <span className="text-[9px] border-[2px] border-black rounded px-1.5 py-0.5 bg-[#4FFF5B] font-black uppercase">Lite</span>
                    </span>
                  </button>
                  <button onClick={() => { setOpen(false); setAiBrainOptionsOpen(false); navigate("/account#ai-brain-context") }} className="w-full text-left px-2 py-1.5 rounded hover:bg-[#f3f4f6]">
                    <div className="text-[10px] font-black uppercase">Gemini 3.1 Pro Preview 💎</div>
                    <div className="text-[9px] font-black uppercase opacity-70 mt-1">Deep strategic analysis & script reasoning.</div>
                    <span className="inline-flex items-center gap-1 mt-1">
                      <span className="text-[9px] border-[2px] border-black rounded px-1.5 py-0.5 bg-black text-white font-black uppercase">Cost: 12.5x</span>
                      <span className="text-[9px] border-[2px] border-black rounded px-1.5 py-0.5 bg-[#F0E05A] font-black uppercase">Pro</span>
                    </span>
                  </button>
                  <button onClick={() => { setOpen(false); setAiBrainOptionsOpen(false); navigate("/account#ai-brain-context") }} className="w-full text-left px-2 py-1.5 rounded hover:bg-[#f3f4f6]">
                    <div className="text-[10px] font-black uppercase">Gemini 3 Flash Preview 🎬</div>
                    <div className="text-[9px] font-black uppercase opacity-70 mt-1">Optimized for video and audio data analysis.</div>
                    <span className="inline-flex items-center gap-1 mt-1">
                      <span className="text-[9px] border-[2px] border-black rounded px-1.5 py-0.5 bg-black text-white font-black uppercase">Cost: 2.5x</span>
                      <span className="text-[9px] border-[2px] border-black rounded px-1.5 py-0.5 bg-[#40C6E9] font-black uppercase">Flash</span>
                    </span>
                  </button>
                  <button onClick={() => { setOpen(false); setAiBrainOptionsOpen(false); navigate("/account#ai-brain-context") }} className="w-full text-left px-2 py-1.5 rounded hover:bg-[#f3f4f6]">
                    <div className="text-[10px] font-black uppercase">Gemini 3.1 Flash Image 🖼️</div>
                    <div className="text-[9px] font-black uppercase opacity-70 mt-1">Specialized for thumbnail vision & composition.</div>
                    <span className="inline-flex items-center gap-1 mt-1">
                      <span className="text-[9px] border-[2px] border-black rounded px-1.5 py-0.5 bg-black text-white font-black uppercase">Cost: 4x</span>
                      <span className="text-[9px] border-[2px] border-black rounded px-1.5 py-0.5 bg-[#FF83EA] font-black uppercase">Vision</span>
                    </span>
                  </button>
                </div>
              )}
              {widgetOptionsOpen && (
                <div className="absolute right-full mr-2 top-[152px] w-[280px] border-[3px] border-black rounded-[12px] bg-white shadow-[5px_5px_0_0_#000] p-2 flex flex-col gap-1 z-[140]">
                  <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest opacity-60">Widget Options</div>
                  <div className="h-[1px] bg-black/15 mb-1" />
                    <button
                      onClick={() => { setOpen(false); setWidgetOptionsOpen(false); setEditMode((value) => !value) }}
                      className="text-left px-2 py-1.5 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]"
                    >
                      {editMode ? "Exit Rearrange Widgets" : "Rearrange Widgets"}
                    </button>
                    <button
                      onClick={() => { setOpen(false); setWidgetOptionsOpen(false); setPickerOpen(true) }}
                      className="text-left px-2 py-1.5 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]"
                    >
                      Widget Availability
                    </button>
                    <button
                      onClick={() => { setOpen(false); setWidgetOptionsOpen(false); setIsLocked((value) => !value) }}
                      className="text-left px-2 py-1.5 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]"
                    >
                      {isLocked ? "Layout Settings: Unlock" : "Layout Settings: Lock"}
                    </button>
                    <button onClick={() => { setOpen(false); setWidgetOptionsOpen(false); exportLayout() }} className="text-left px-2 py-1.5 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">Layout Settings: Export</button>
                    <button onClick={() => { setOpen(false); setWidgetOptionsOpen(false); importLayout() }} className="text-left px-2 py-1.5 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">Layout Settings: Import</button>
                    <button onClick={() => { setOpen(false); setWidgetOptionsOpen(false); resetLayout() }} className="text-left px-2 py-1.5 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">Layout Settings: Reset</button>
                </div>
              )}

              {canSeeApiKeys && (
                <button onClick={() => { setOpen(false); navigate("/account#api-keys") }} className="text-left px-3 py-2 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">API Keys</button>
              )}
              <button onClick={() => { setOpen(false); navigate("/user-guide") }} className="text-left px-3 py-2 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#f3f4f6]">User Guide</button>
              <div className="h-[1px] bg-black/15 my-1" />
              <button onClick={() => { setOpen(false); logout() }} className="text-left px-3 py-2 text-[10px] font-black uppercase border-[2px] border-transparent rounded hover:border-black hover:bg-[#FF1744] hover:text-white">Sign Out</button>
            </div>
          )}
        </div>
      </div>
      {!isConnected && (
        <div className="px-4 md:px-6 pb-2 xl:hidden">
          <div className="border-[2px] border-black rounded-[10px] bg-[#f3f4f6] px-3 py-2 flex items-center justify-between gap-2">
            <div className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">
              Turn channel data into clear growth actions.
            </div>
            <button
              onClick={() => navigate("/user-guide")}
              className="h-7 px-3 border-[2px] border-black rounded-[8px] bg-white text-[8px] font-black uppercase tracking-wider"
            >
              How It Works
            </button>
          </div>
        </div>
      )}
      {brainIntakeOpen && (
        <div className="fixed inset-0 z-[220] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[680px] bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0_0_#000] overflow-hidden">
            <div className="px-5 py-4 bg-[#C9F830] border-b-[4px] border-black">
              <h2 className="text-2xl font-black uppercase tracking-tight">Quick AI Brain Setup</h2>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] opacity-80 mt-1">
                Tell us what you want to achieve next
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-[0.12em]">What are you trying to achieve next?</label>
                <textarea
                  value={brainWhatNext}
                  onChange={(event) => setBrainWhatNext(event.target.value)}
                  placeholder="Example: reach 10k views per video and improve repeat viewers."
                  className="w-full min-h-[92px] border-[3px] border-black rounded-xl px-3 py-2 font-bold"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-[0.12em]">Primary channel goal</label>
                  <select
                    value={brainPrimaryGoal}
                    onChange={(event) => setBrainPrimaryGoal(event.target.value as BrainPrimaryGoal)}
                    className="w-full h-11 border-[3px] border-black rounded-xl px-3 font-black uppercase bg-white"
                  >
                    <option value="views">Views</option>
                    <option value="subscribers">Subscribers</option>
                    <option value="revenue">Revenue</option>
                    <option value="retention">Retention</option>
                    <option value="consistency">Consistency</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-[0.12em]">Audience + niche</label>
                  <input
                    value={brainAudienceNiche}
                    onChange={(event) => setBrainAudienceNiche(event.target.value)}
                    placeholder="Example: history shorts for 18-34 learners."
                    className="w-full h-11 border-[3px] border-black rounded-xl px-3 font-bold"
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    dismissAiBrainIntake()
                    setBrainIntakeOpen(false)
                    navigate("/account#ai-brain-context")
                  }}
                  className="px-4 py-2 border-[3px] border-black rounded-xl bg-white font-black uppercase text-xs shadow-[2px_2px_0_0_#000]"
                >
                  Edit Later
                </button>
                <button
                  onClick={submitBrainIntake}
                  className="px-4 py-2 border-[3px] border-black rounded-xl bg-[#4FFF5B] font-black uppercase text-xs shadow-[2px_2px_0_0_#000]"
                >
                  Save Brain Context
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
