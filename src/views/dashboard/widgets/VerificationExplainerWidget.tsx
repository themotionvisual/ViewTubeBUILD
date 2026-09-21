import React, { useState } from "react"
import {
  BarChart3,
  BookOpen,
  Brain,
  Cable,
  CircleUserRound,
  Database,
  FolderKanban,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetFooter,
  WidgetHeaderToggle,
  WidgetScrollArea,
  WidgetSection,
  WidgetSizedButton,
  WidgetWorkflowMain,
} from "../WidgetPrimitives"
import type { CommonWidgetProps } from "../types"
import "./VerificationExplainerWidget.css"

type AboutPage = "system" | "trust"

const ABOUT_PAGES = [
  { id: "system", label: "SYSTEM" },
  { id: "trust", label: "TRUST" },
] as const

const SYSTEM_NODES = [
  { id: "sync", label: "SYNC", detail: "Channel data", route: "/analytics", Icon: BarChart3, position: "north" },
  { id: "brain", label: "BRAIN", detail: "Decide", route: "/ai-brain", Icon: Brain, position: "west" },
  { id: "create", label: "CREATE", detail: "Build", route: "/studio", Icon: WandSparkles, position: "east" },
  { id: "projects", label: "PLAN", detail: "Ship", route: "/projects", Icon: FolderKanban, position: "south" },
] as const

const TRUST_STEPS = [
  { id: "account", label: "ACCOUNT", detail: "You choose when to connect.", Icon: CircleUserRound },
  { id: "connection", label: "GOOGLE + YOUTUBE", detail: "Connected services provide channel context.", Icon: Cable },
  { id: "data", label: "VIEWTUBE TOOLS", detail: "Tools show where their working data comes from.", Icon: Database },
  { id: "control", label: "YOUR CONTROL", detail: "Manage connections and data controls from Account.", Icon: ShieldCheck },
] as const

const CAPABILITIES = [
  { id: "analyze", label: "ANALYZE" },
  { id: "think", label: "THINK" },
  { id: "make", label: "MAKE" },
  { id: "publish", label: "PUBLISH" },
  { id: "learn", label: "LEARN" },
] as const

export const VerificationExplainerWidget: React.FC<
  CommonWidgetProps & { onNavigate: (to: string) => void }
> = ({ onNavigate, ...common }) => {
  const { channelConnection } = useBrain()
  const [page, setPage] = useState<AboutPage>("system")
  const isConnected = Boolean(channelConnection?.isConnected)

  const navigate = (to: string) => onNavigate(to)

  const headerContent = (
    <WidgetHeaderToggle
      label="About VIEWTUBE page"
      value={page}
      items={ABOUT_PAGES}
      onChange={setPage}
    />
  )

  return (
    <WidgetShell
      {...common}
      icon={<BookOpen size={22} aria-hidden="true" />}
      headerContent={headerContent}
    >
      <WidgetWorkflowMain className="about-vt">
        <WidgetScrollArea
          ariaLabel={page === "system" ? "VIEWTUBE system map" : "VIEWTUBE trust and data map"}
          edge="inset"
          className="about-vt__scroll"
          contentClassName="about-vt__scroll-content"
        >
          {page === "system" ? (
            <div className="about-vt__page is-system">
              <WidgetSection edge="full" className="about-vt__intro">
                <div className="about-vt__intro-copy">
                  <div className="about-vt__intro-row">
                    <WidgetBadge height={18}>CREATOR OS</WidgetBadge>
                    <span className="about-vt__welcome">WELCOME TO VIEWTUBE</span>
                  </div>
                  <strong>YOUR CHANNEL, TURNED INTO A CONNECTED CREATIVE SYSTEM.</strong>
                </div>
                <p>
                  Read the channel, find the next move, make the asset, plan the work, publish, learn, and feed the result back into the system.
                </p>
                <div className="about-vt__spectrum" aria-label="ViewTube color palette">
                  {Array.from({ length: 12 }, (_, index) => <span key={index} aria-hidden="true" />)}
                </div>
              </WidgetSection>

              <div className="about-vt__capability-ribbon" aria-label="ViewTube creator loop">
                {CAPABILITIES.map(({ id, label }) => (
                  <span key={id} className={`is-${id}`}>{label}</span>
                ))}
              </div>

              <WidgetSection className="about-vt__map-section">
                <div className="about-vt__system-map" aria-label="VIEWTUBE connected system">
                  <div className="about-vt__system-lines" aria-hidden="true" />
                  {SYSTEM_NODES.map(({ id, label, detail, route, Icon, position }) => (
                    <WidgetSizedButton
                      key={id}
                      height={32}
                      textFit="adaptive"
                      tone="default"
                      className={`about-vt__system-node is-${position} is-${id}`}
                      onClick={() => navigate(route)}
                      aria-label={`Open ${label}: ${detail}`}
                    >
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </WidgetSizedButton>
                  ))}
                  <button
                    type="button"
                    className="about-vt__hub"
                    onClick={() => navigate("/")}
                    aria-label="VIEWTUBE dashboard home"
                  >
                    <span>VIEW</span>
                    <strong>TUBE</strong>
                    <small>{isConnected ? "CHANNEL CONNECTED" : "START HERE"}</small>
                  </button>
                </div>
              </WidgetSection>

              <WidgetSection edge="full" className="about-vt__handoff">
                <Sparkles size={18} aria-hidden="true" />
                <p><strong>THE LOOP:</strong> analytics becomes intelligence, intelligence becomes action, action becomes content, and every result becomes better context for the next decision.</p>
              </WidgetSection>
            </div>
          ) : (
            <div className="about-vt__page is-trust">
              <WidgetSection edge="full" className="about-vt__intro is-trust-intro">
                <div className="about-vt__intro-copy">
                  <div className="about-vt__intro-row">
                    <WidgetBadge height={18} icon={<LockKeyhole size={11} />}>CONNECTION MAP</WidgetBadge>
                    <span className="about-vt__welcome">VISIBLE BY DESIGN</span>
                  </div>
                  <strong>KNOW WHAT CONNECTS, WHERE IT FLOWS, AND WHAT YOU CONTROL.</strong>
                </div>
                <p>
                  The same visual language that powers the creative system also exposes the account, data, and connection path instead of hiding it behind settings screens.
                </p>
                <div className="about-vt__spectrum" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
                </div>
              </WidgetSection>

              <WidgetSection className="about-vt__trust-map-section">
                <div className="about-vt__trust-map">
                  {TRUST_STEPS.map(({ id, label, detail, Icon }, index) => (
                    <React.Fragment key={id}>
                      <div className={`about-vt__trust-step is-${id}`}>
                        <span className="about-vt__trust-step-icon"><Icon aria-hidden="true" /></span>
                        <strong>{label}</strong>
                        <small>{detail}</small>
                      </div>
                      {index < TRUST_STEPS.length - 1 ? <span className="about-vt__trust-arrow" aria-hidden="true">→</span> : null}
                    </React.Fragment>
                  ))}
                </div>
              </WidgetSection>

              <WidgetSection className="about-vt__status-grid">
                <div className="about-vt__status-cell is-cyan">
                  <span>CONNECTION</span>
                  <strong>{isConnected ? "CONNECTED" : "NOT CONNECTED"}</strong>
                </div>
                <div className="about-vt__status-cell is-lime">
                  <span>ACCOUNT CONTROL</span>
                  <strong>AVAILABLE</strong>
                </div>
                <div className="about-vt__status-cell is-pink">
                  <span>DATA TRANSPARENCY</span>
                  <strong>INSPECTABLE</strong>
                </div>
              </WidgetSection>

              <nav className="about-vt__resource-links" aria-label="VIEWTUBE trust resources">
                <a href="/privacy.html" className="is-cyan">PRIVACY</a>
                <a href="/terms.html" className="is-yellow">TERMS</a>
                <button type="button" className="is-magenta" onClick={() => navigate("/data-transparency")}>DATA &amp; SOURCES</button>
              </nav>
            </div>
          )}
        </WidgetScrollArea>
      </WidgetWorkflowMain>

      <WidgetFooter className="about-vt__footer">
        <WidgetSizedButton
          height={24}
          textFit="adaptive"
          tone="primary"
          className="about-vt__connect-button"
          onClick={() => navigate(isConnected ? "/account" : "/account/connect")}
        >
          <Rocket aria-hidden="true" />
          {isConnected ? "MANAGE ACCOUNT" : "CONNECT CHANNEL"}
        </WidgetSizedButton>
        <WidgetSizedButton
          height={24}
          textFit="adaptive"
          tone="default"
          className="about-vt__guide-button"
          onClick={() => navigate("/user-guide")}
        >
          <BookOpen aria-hidden="true" />
          USER GUIDE
        </WidgetSizedButton>
      </WidgetFooter>
    </WidgetShell>
  )
}
