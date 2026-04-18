import React from "react"
import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  CheckSquare,
  Crown,
  Database,
  Grip,
  Layers,
  Link2,
  Loader2,
  Star,
  TrendingUp,
  Upload,
  UserCircle2,
  Video,
  WandSparkles,
  X,
} from "lucide-react"
import type { DashboardData } from "./useDashboardData"
import type { WidgetDefinition, WidgetRenderCallbacks, WidgetInstanceState } from "./types"

interface WidgetRendererProps extends WidgetRenderCallbacks {
  widget: WidgetDefinition
  instance: WidgetInstanceState
  editMode: boolean
  canEdit: boolean
  data: DashboardData
  onNavigate: (to: string) => void
}

const formatUploadDate = (value: unknown): string => {
  const dt = new Date(String(value || ""))
  return Number.isNaN(dt.getTime()) ? "Unknown date" : dt.toLocaleDateString()
}

const widgetControlClass =
  "h-8 bg-[#f3f4f6] border-[3px] border-black rounded-[12px] inline-flex items-center justify-center text-[9px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.45)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.45)] transition-all"

const WidgetShell: React.FC<{
  widget: WidgetDefinition
  instance: WidgetInstanceState
  editMode: boolean
  canEdit: boolean
  onToggleCollapse: () => void
  onCycleSize: () => void
  onRemove: () => void
  children: React.ReactNode
  icon?: React.ReactNode
}> = ({ widget, instance, editMode, canEdit, onToggleCollapse, onCycleSize, onRemove, children, icon }) => {
  return (
    <article className="bg-white border-[4px] border-black rounded-[16px] overflow-hidden h-full" style={{ boxShadow: `6px 6px 0px 0px ${widget.headerColor}80` }}>
      <header className="h-[56px] border-b-[4px] border-black flex items-stretch" style={{ backgroundColor: widget.headerColor }}>
        <div className="w-[56px] border-r-[4px] border-black flex items-center justify-center" style={{ backgroundColor: widget.iconRailColor }}>
          {icon || <Layers size={22} className="text-black" />}
        </div>
        <div className="flex-1 px-3 flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[15px] font-black uppercase tracking-tight leading-none truncate">{widget.title}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.08em] opacity-60 truncate">{widget.subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {canEdit && editMode ? (
              <>
                <button
                  onClick={onCycleSize}
                  className={`${widgetControlClass} min-w-[44px] px-2`}
                  title="Cycle size bucket">
                  {instance.size}
                </button>
                <button
                  onClick={onRemove}
                  className={`${widgetControlClass} w-8`}
                  title="Remove widget">
                  <X size={14} />
                </button>
                <span
                  className={`${widgetControlClass} w-8 cursor-grab active:cursor-grabbing`}
                >
                  <Grip size={14} />
                </span>
              </>
            ) : null}
            <button
              onClick={onToggleCollapse}
              className={`${widgetControlClass} w-8 text-[11px]`}
              title={instance.collapsed ? "Expand" : "Collapse"}>
              {instance.collapsed ? "+" : "−"}
            </button>
          </div>
        </div>
      </header>
      {!instance.collapsed ? <div className="p-3 md:p-4 h-[calc(100%-56px)]">{children}</div> : null}
    </article>
  )
}

const statusBadge = (status: string, tone: string) => (
  <span
    className="h-7 px-2 border-[3px] border-black rounded-md inline-flex items-center text-[9px] font-black uppercase tracking-[0.1em] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.35)]"
    style={{ backgroundColor: tone }}
  >
    {status}
  </span>
)

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  instance,
  editMode,
  canEdit,
  onToggleCollapse,
  onCycleSize,
  onRemoveWidget,
  data,
  onNavigate,
}) => {
  const common = {
    widget,
    instance,
    editMode,
    canEdit,
    onToggleCollapse: () => onToggleCollapse(widget.id),
    onCycleSize: () => onCycleSize(widget.id),
    onRemove: () => onRemoveWidget(widget.id),
  }

  if (widget.id === "kpi-cluster") {
    return (
      <WidgetShell {...common} icon={<TrendingUp size={20} />}>
        <div className="grid grid-cols-2 gap-3 h-full">
          {data.statBlocks.map((stat) => (
            <div key={stat.label} className="border-[3px] border-black rounded-[12px] overflow-hidden">
              <div className="h-8 border-b-[3px] border-black px-2 flex items-center" style={{ backgroundColor: stat.color }}>
                <span className="text-[11px] font-black uppercase tracking-[0.08em]">{stat.label}</span>
              </div>
              <div className="bg-[#F2F2F2] h-[calc(100%-32px)] px-2 py-2 flex items-center">
                <span className="text-lg md:text-2xl font-[1000] uppercase tracking-tight truncate">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "channel-overview") {
    return (
      <WidgetShell {...common} icon={<UserCircle2 size={20} />}>
        <div className="h-full flex items-center gap-4">
          <div className="h-24 w-24 rounded-full border-[4px] border-black bg-white overflow-hidden flex items-center justify-center">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="Channel Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xl font-black opacity-40">OS</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">Connected Channel</p>
            <p className="text-lg font-[1000] uppercase tracking-tight truncate">{data.authState.channelName || "No Channel Linked"}</p>
            <div className="mt-2">{data.authState.isAuthenticated ? statusBadge("Linked", "#4FFF5B") : statusBadge("Offline", "#FF8AAF")}</div>
          </div>
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "mini-calendar") {
    return (
      <WidgetShell {...common} icon={<CalendarDays size={20} />}>
        <div className="grid grid-cols-7 gap-1 h-full content-start">
          {data.upcomingDays.map((day) => (
            <div
              key={day.dateStr}
              className="aspect-square rounded-[12px] border-[2px] border-black text-[10px] font-black flex items-center justify-center"
              style={{
                backgroundColor: day.isToday ? "#FFB570" : day.tasks.length > 0 ? "#FFD8B3" : "#f1f1f1",
                opacity: day.tasks.length > 0 || day.isToday ? 1 : 0.55,
              }}>
              {day.date.getDate()}
            </div>
          ))}
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "task-stack") {
    return (
      <WidgetShell {...common} icon={<CheckSquare size={20} />}>
        <div className="space-y-2">
          {data.todayTasks.length ? (
            data.todayTasks.slice(0, 6).map((task: { id?: string; completed?: boolean; text?: string }, idx: number) => (
              <div key={task.id || `task-${idx}`} className="border-[2px] border-black rounded-[12px] bg-white px-3 py-2 flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded border-[2px] border-black" style={{ backgroundColor: task.completed ? "#FFB570" : "transparent" }} />
                <span className={`text-xs font-black uppercase ${task.completed ? "line-through opacity-45" : ""}`}>{task.text || "Untitled Task"}</span>
              </div>
            ))
          ) : (
            <div className="border-[2px] border-dashed border-black/30 rounded-[12px] bg-[#f8f8f8] p-4 text-[10px] font-black uppercase tracking-[0.12em] opacity-55 text-center">
              Schedule Clear
            </div>
          )}
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "quick-actions") {
    return (
      <WidgetShell {...common} icon={<Layers size={20} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {data.quickActions.map((action, idx) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.to)}
              className="h-12 border-[3px] border-black rounded-[12px] text-left px-3 text-[11px] font-black uppercase tracking-[0.08em] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.45)]"
              style={{ backgroundColor: idx % 2 === 0 ? "#4FFF5B" : "#579AFF" }}>
              {action.label}
            </button>
          ))}
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "recent-uploads") {
    return (
      <WidgetShell {...common} icon={<Upload size={20} />}>
        <div className="space-y-2">
          {data.recentUploads.length ? (
            data.recentUploads.map((video) => (
              <div key={video.videoId} className="border-[2px] border-black rounded-[12px] bg-white px-2 py-2 flex gap-2">
                <div className="w-12 h-8 rounded-[8px] overflow-hidden border-2 border-black bg-gray-100 shrink-0">
                  <img
                    src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/0.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase truncate">{video.title}</p>
                  <p className="text-[9px] font-black uppercase opacity-55">{formatUploadDate(video.uploadDate)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] font-black uppercase opacity-60">No uploads in cache</p>
          )}
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "top-performer") {
    return (
      <WidgetShell {...common} icon={<Video size={20} />}>
          {data.topPerformer ? (
          <div className="border-[3px] border-black rounded-[12px] bg-white p-3 h-full flex flex-col justify-between">
            <p className="text-sm font-black uppercase leading-tight line-clamp-2">{data.topPerformer.title}</p>
            <div>
              <p className="text-[26px] font-[1000] uppercase leading-none">
                {Math.round(data.topPerformer.metrics.views?.value || 0).toLocaleString()}
              </p>
              <p className="text-[10px] font-black uppercase opacity-60">Top views in current dataset</p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] font-black uppercase opacity-60">No video data yet</p>
        )}
      </WidgetShell>
    )
  }

  if (widget.id === "upload-cadence") {
    return (
      <WidgetShell {...common} icon={<Activity size={20} />}>
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {data.consistencyDays.map((day) => (
              <div
                key={day.dateStr}
                className="aspect-square border-[2px] border-black rounded-[4px]"
                style={{ backgroundColor: day.active ? "#40C6E9" : day.hasTasks ? "#FFE357" : "#e5e5e5" }}
              />
            ))}
          </div>
          <div className="flex gap-2 text-[9px] font-black uppercase">
            <span className="px-2 py-1 border-[2px] border-black rounded-[6px]" style={{ backgroundColor: "#40C6E9" }}>
              Upload
            </span>
            <span className="px-2 py-1 border-[2px] border-black rounded-[6px]" style={{ backgroundColor: "#FFE357" }}>
              Tasked
            </span>
            <span className="px-2 py-1 border-[2px] border-black rounded-[6px] bg-[#e5e5e5]">Idle</span>
          </div>
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "alerts-feed") {
    return (
      <WidgetShell {...common} icon={<Bell size={20} />}>
        <div className="space-y-2">
          {data.alerts.map((alert, idx) => (
            <div key={idx} className="border-[2px] border-black rounded-[12px] bg-white px-3 py-2 text-xs font-black">
              {alert}
            </div>
          ))}
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "sync-connection") {
    return (
      <WidgetShell {...common} icon={<Link2 size={20} />}>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-[2px] border-black rounded-[12px] bg-white px-3 py-2">
            <span className="text-[10px] font-black uppercase">Channel Link</span>
            {data.authState.isAuthenticated ? statusBadge("Linked", "#4FFF5B") : statusBadge("Offline", "#FF8AAF")}
          </div>
          <div className="flex items-center justify-between border-[2px] border-black rounded-[12px] bg-white px-3 py-2">
            <span className="text-[10px] font-black uppercase">Last Sync</span>
            <span className="text-[10px] font-black uppercase">{data.formatRelativeTime(data.lastSyncComplete ? new Date(data.lastSyncComplete).getTime() : null)}</span>
          </div>
          <button
            disabled={data.isSyncing}
            onClick={() => {
              void data.globalSyncData()
            }}
            className="w-full h-10 border-[3px] border-black rounded-[12px] font-black uppercase text-xs flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: "#24D3FF" }}>
            {data.isSyncing ? <Loader2 size={14} className="animate-spin" /> : null}
            {data.isSyncing ? "Syncing" : "Sync Data"}
          </button>
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "ai-prompt-box") {
    return (
      <WidgetShell {...common} icon={<Bot size={20} />}>
        <div className="space-y-2">
          <textarea
            rows={4}
            readOnly
            value={"Why are my views dropping this month?"}
            className="w-full resize-none border-[3px] border-black rounded-[12px] px-3 py-2 text-xs font-black bg-white"
          />
          <button className="w-full h-10 border-[3px] border-black rounded-[12px] bg-[#40C6E9] text-xs font-black uppercase">
            Draft Strategy Reply
          </button>
          <p className="text-[9px] font-black uppercase opacity-55">Prototype widget. Full AI flow is staged.</p>
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "revenue-momentum") {
    return (
      <WidgetShell {...common} icon={<TrendingUp size={20} />}>
        <div className="space-y-2">
          {data.revenueMomentum.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-8 text-[9px] font-black uppercase">{item.label}</span>
              <div className="flex-1 h-6 border-[2px] border-black rounded-[6px] bg-[#f2f2f2] overflow-hidden">
                <div className="h-full bg-[#C9F830] border-r-[2px] border-black" style={{ width: `${Math.min(100, item.value)}%` }} />
              </div>
              <span className="w-10 text-right text-[9px] font-black uppercase">{item.value}%</span>
            </div>
          ))}
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "superfan-card") {
    return (
      <WidgetShell {...common} icon={<Crown size={20} />}>
        <div className="border-[3px] border-black rounded-[12px] bg-white p-3 flex items-start gap-3">
          <div className="h-14 w-14 rounded-full border-[3px] border-black bg-[#FFE357] flex items-center justify-center shrink-0">
            <Star size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase">@HistoryBuff99</p>
            <p className="text-[9px] font-black uppercase opacity-60 mb-1">Top 1% supporter</p>
            <p className="text-[11px] font-black leading-snug">Watched your last 10 videos and dropped 15 comments this week.</p>
          </div>
        </div>
      </WidgetShell>
    )
  }

  if (widget.id === "system-micro-stack") {
    return (
      <WidgetShell {...common} icon={<Database size={20} />}>
        <div className="space-y-2">
          <div className="border-[2px] border-black rounded-[12px] bg-white px-3 py-2 flex items-center justify-between text-[10px] font-black uppercase">
            <span>Storage</span>
            <span>98% Full</span>
          </div>
          <div className="border-[2px] border-black rounded-[12px] bg-white px-3 py-2 flex items-center justify-between text-[10px] font-black uppercase">
            <span>Gemini</span>
            <span className="text-[#0a8f1f]">Ready</span>
          </div>
          <div className="border-[2px] border-black rounded-[12px] bg-white px-3 py-2 flex items-center justify-between text-[10px] font-black uppercase">
            <span>Theme</span>
            <span>Industrial</span>
          </div>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell {...common} icon={<WandSparkles size={20} />}>
      <p className="text-xs font-black uppercase">Widget not mapped yet.</p>
    </WidgetShell>
  )
}
