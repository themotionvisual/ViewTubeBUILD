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
  { id: "control", label: "YOUR CONTROL", detail: "Manage the connection and data controls from Account.", Icon: ShieldCheck },
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
              <WidgetSection className="about-vt__intro">
                <div>
                  <WidgetBadge height={18}>CREATOR OS</WidgetBadge>
                  <strong>ONE CHANNEL. ONE OPERATING LOOP.</strong>
                </div>
                <p>
                  VIEWTUBE connects channel evidence, decisions, creation, and planning so each tool can hand useful context to the next.
                </p>
              </WidgetSection>

              <WidgetSection className="about-vt__map-section">
                <div className="about-vt__system-map" aria-label="VIEWTUBE connected system">
                  <div className="about-vt__system-lines" aria-hidden="true" />
                  {SYSTEM_NODES.map(({ id, label, detail, route, Icon, position }) => (
                    <WidgetSizedButton
                      key={id}
                      height={32}
                      textFit="adaptive"
                      tone="default"
                      className={`about-vt__system-node is-${position}`}
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
                    <small>{isConnected ? "CHANNEL CONNECTED" : "READY TO CONNECT"}</small>
                  </button>
                </div>
              </WidgetSection>

              <WidgetSection className="about-vt__handoff">
                <Sparkles size={18} aria-hidden="true" />
                <p><strong>THE POINT:</strong> move from “what happened?” to “what should I do next?” without rebuilding context in every tool.</p>
              </WidgetSection>
            </div>
          ) : (
            <div className="about-vt__page is-trust">
              <WidgetSection className="about-vt__intro">
                <div>
                  <WidgetBadge height={18} icon={<LockKeyhole size={11} />}>CONNECTION MAP</WidgetBadge>
                  <strong>UNDERSTAND WHAT IS CONNECTED.</strong>
                </div>
                <p>
                  VIEWTUBE should make the route from account connection to creator-facing tools visible instead of hiding it behind the interface.
                </p>
              </WidgetSection>

              <WidgetSection className="about-vt__trust-map-section">
                <div className="about-vt__trust-map">
                  {TRUST_STEPS.map(({ id, label, detail, Icon }, index) => (
                    <React.Fragment key={id}>
                      <div className="about-vt__trust-step">
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
                <div className="about-vt__status-cell">
                  <span>CONNECTION</span>
                  <strong>{isConnected ? "CONNECTED" : "NOT CONNECTED"}</strong>
                </div>
                <div className="about-vt__status-cell">
                  <span>ACCOUNT CONTROL</span>
                  <strong>AVAILABLE</strong>
                </div>
                <div className="about-vt__status-cell">
                  <span>DATA TRANSPARENCY</span>
                  <strong>INSPECTABLE</strong>
                </div>
              </WidgetSection>

              <nav className="about-vt__resource-links" aria-label="VIEWTUBE trust resources">
                <a href="/privacy.html">PRIVACY</a>
                <a href="/terms.html">TERMS</a>
                <button type="button" onClick={() => navigate("/data-transparency")}>DATA &amp; SOURCES</button>
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
          onClick={() => navigate(isConnected ? "/account" : "/account/connect")}
        >
          <Rocket aria-hidden="true" />
          {isConnected ? "MANAGE ACCOUNT" : "CONNECT CHANNEL"}
        </WidgetSizedButton>
        <WidgetSizedButton
          height={24}
          textFit="adaptive"
          tone="default"
          onClick={() => navigate("/user-guide")}
        >
          <BookOpen aria-hidden="true" />
          USER GUIDE
        </WidgetSizedButton>
      </WidgetFooter>
    </WidgetShell>
  )
}
