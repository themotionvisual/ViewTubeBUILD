import React, { useState } from "react"
import { Layers, X, GripVertical, ChevronsUpDown, ChevronsLeftRight, Sparkles } from "lucide-react"
import { VTLottie } from "../../components/VTLottie"
import type { WidgetDefinition, WidgetInstanceState } from "./types"

export const WidgetShell: React.FC<{
 widget: WidgetDefinition
 instance: WidgetInstanceState
 editMode: boolean
 canEdit: boolean
 onToggleCollapse: () => void
 onCycleSize: () => void
 onCycleHeight: () => void
 onRemove: () => void
 children: React.ReactNode
 icon?: React.ReactNode
 headerContent?: React.ReactNode
 hasAI?: boolean
 onRegenerate?: () => void
 aiCost?: number
 aiDisabled?: boolean
 aiDisabledReason?: string
}> = ({
 widget,
 editMode,
 canEdit,
 onCycleSize,
 onCycleHeight,
 onRemove,
 children,
 icon,
 headerContent,
 hasAI,
 onRegenerate,
 aiCost,
 aiDisabled,
 aiDisabledReason,
}) => {
 const [isSubtitleOpen, setIsSubtitleOpen] = useState(false);

 const words = widget.title.split(" ");
 const formattedTitle = words.length >= 2 ? (
  <>
   {words[0]}<br/>{words.slice(1).join(" ")}
  </>
 ) : (
  widget.title
 );

 const WIDGET_DESCRIPTIONS: Record<string, { short: string, detailed: string }> = {
  "kpi-cluster": {
   short: "REAL-TIME CHANNEL VITALS AND CORE GROWTH METRICS.",
   detailed: "Monitor subscribers, views, and revenue in a dense, at-a-glance cluster. Best used for high-level health checks."
  },
  "channel-overview": {
   short: "HIGH-LEVEL SUMMARY OF YOUR CHANNEL'S 28-DAY PERFORMANCE.",
   detailed: "A holistic view of your channel's reach and engagement. Use this to identify long-term trends and seasonality."
  },
  "realtime-performance": {
   short: "MONITOR LIVE CONCURRENT VIEWERS AND TRAFFIC VELOCITY.",
   detailed: "See exactly who is watching and where they come from in real time. Perfect for monitoring the first 48 hours of a launch."
  },
  "alerts-feed": {
   short: "INSTANT NOTIFICATIONS FOR MILESTONES AND CRITICAL EVENTS.",
   detailed: "Stay updated on major subscriber jumps, revenue spikes, or policy alerts. Check daily to catch urgent channel changes."
  },
  "system-micro-stack": {
   short: "MINIATURE CONTROL CENTER FOR QUICK CHANNEL ACTIONS.",
   detailed: "A compact stack for toggling visibility or quick settings. Keep this pinned for rapid-fire channel management."
  },
  "recent-uploads": {
   short: "PERFORMANCE AUDIT OF YOUR MOST RECENT VIDEO RELEASES.",
   detailed: "Compare your latest videos side-by-side. Use this to spot which topics or thumbnails are currently resonating."
  },
  "consistency-heatmap": {
   short: "VISUALIZE YOUR POSTING FREQUENCY AND CONSISTENCY.",
   detailed: "A calendar-style heat map of your uploads. Use it to ensure you aren't leaving gaps that hurt algorithmic reach."
  },
  "task-stack": {
   short: "TODO LIST FOR PRODUCTION MILESTONES AND CREATIVE GOALS.",
   detailed: "Manage your production pipeline from ideation to publish. Best used to keep track of multiple edits simultaneously."
  },
  "community-post": {
   short: "AI-POWERED GENERATOR FOR ENGAGING COMMUNITY UPDATES.",
   detailed: "Draft polls, images, and text posts optimized for reach. Best used to prime the algorithm between major video uploads."
  },
  "description-editor": {
   short: "STANDARDIZE AND REFINE YOUR VIDEO METADATA AT SCALE.",
   detailed: "Bulk edit or template your descriptions with SEO-ready blocks. Use snippets to keep your links and socials consistent."
  },
  "tag-generator": {
   short: "AI-EXTRACTED KEYWORD CLUSTERS FOR MAXIMUM SEO REACH.",
   detailed: "Generate high-ranking tags based on your video content. Best used to discover niche keywords you might have missed."
  },
  "thumb-ai": {
   short: "AI-DRIVEN THUMBNAIL ANALYSIS AND VARIATION GENERATOR.",
   detailed: "Evaluate thumbnail CTR potential and generate variations. Use it to test different emotional hooks before you publish."
  },
  "top-performer": {
   short: "DEEP DIVE INTO THE VIDEOS DRIVING YOUR CHANNEL GROWTH.",
   detailed: "Analyze your #1 videos to find the 'secret sauce' of their success. Replicate these patterns in your future content."
  },
  "revenue-momentum": {
   short: "ANALYZE EARNING VELOCITY AND FUTURE REVENUE PROJECTIONS.",
   detailed: "Track how fast you're making money and where it peaks. Use this to plan high-budget productions around revenue spikes."
  },
  "revenue-chart": {
   short: "DETAILED DAILY BREAKDOWN OF YOUR CHANNEL'S EARNINGS.",
   detailed: "A granular chart of your RPM, CPM, and total revenue. Best used to track the impact of ad-friendly content shifts."
  },
  "keyword-engine": {
   short: "SEARCH VOLUME AND COMPETITION ANALYSIS FOR NEW TOPICS.",
   detailed: "Find what viewers are searching for before you hit record. Use it to pick high-demand, low-competition video ideas."
  },
  "traffic-sources": {
   short: "MAP WHERE YOUR VIEWERS ARE DISCOVERING YOUR CONTENT.",
   detailed: "Identify if your views come from Search, Suggested, or External. Use this to tailor your titles for specific surfaces."
  },
  "audience-retention": {
   short: "DIAGNOSE EXACTLY WHERE VIEWERS STOP WATCHING VIDEOS.",
   detailed: "View second-by-second drop-off points. Use these insights to fix pacing issues and improve your video hooks."
  },
  "shorts-vs-long": {
   short: "COMPARE PERFORMANCE ACROSS DIFFERENT VIDEO FORMATS.",
   detailed: "Analyze which format drives more subs vs more revenue. Use this to balance your content strategy for maximum growth."
  },
  "superfan-card": {
   short: "IDENTIFY AND REWARD YOUR MOST LOYAL COMMUNITY MEMBERS.",
   detailed: "Track your top 10% of commenters and subscribers. Use this to engage directly with your most valuable 'inner circle.'"
  },
  "comment-replier": {
   short: "AI-ASSISTED REPLIES TO BOOST ENGAGEMENT AND RETENTION.",
   detailed: "Craft provocative, algorithm-priming replies to comments. Use it to spark longer conversations in your comment section."
  },
  "ai-prompt-box": {
   short: "DIRECT COMMAND LINE FOR CHANNEL-WIDE AI OPERATIONS.",
   detailed: "Execute complex data queries or content tasks via text. Best used for advanced batch-processing or deep data analysis."
  },
  "ask-me": {
   short: "NATURAL LANGUAGE CHAT FOR INSTANT CHANNEL INSIGHTS.",
   detailed: "Ask anything about your data and get an immediate answer. Best used for 'Why?' questions that charts can't explain."
  },
  "daily-oracle": {
   short: "STRATEGIC AI ADVICE TAILORED TO YOUR CURRENT GROWTH.",
   detailed: "Receive a daily 'prediction' or strategic tip for your channel. Use this for a fresh perspective on your content direction."
  },
  "ai-journal": {
   short: "CREATIVE LOG FOR TRACKING EXPERIMENTS AND STRATEGIES.",
   detailed: "Document what works and what doesn't in your content journey. Best used to build a personalized 'Creator Playbook.'"
  },
  "mini-calendar": {
   short: "PRODUCTION SCHEDULE AND UPCOMING MILESTONE TRACKER.",
   detailed: "A compact view of your upcoming tasks and deadlines. Use it to plan your week and avoid production bottlenecks."
  },
  "quick-actions": {
   short: "PRIMARY NAVIGATION LAUNCHERS FOR CORE TOOLS.",
   detailed: "Quickly jump to the most common dashboard surfaces. Use this as your home base for navigating the ViewTube ecosystem."
  },
  "goals-tracker": {
   short: "TRACK PROGRESS TOWARDS YOUR CHANNEL MILESTONES.",
   detailed: "Set and monitor goals for subscribers, views, or revenue. Use it to stay motivated and hit your growth targets."
  },
  "alerts-ticker": {
   short: "REAL-TIME TICKER OF CRITICAL CHANNEL EVENTS.",
   detailed: "A scrolling feed of live alerts and performance spikes. Keep an eye on this for immediate algorithmic signals."
  },
  "publish-momentum": {
   short: "HEATMAP ANALYSIS OF OPTIMAL PUBLISH TIMES.",
   detailed: "Visualize when your audience is most active. Use this to time your uploads for maximum initial velocity."
  },
  "reach-funnel": {
   short: "VISUALIZE YOUR CTR CONVERSION AND REACH EFFICIENCY.",
   detailed: "Track how impressions turn into views and watch time. Use this to identify if your titles or thumbnails are leaking traffic."
  },
  "relative-retention-benchmark": {
   short: "BENCHMARK YOUR PERFORMANCE AGAINST PLATFORM AVERAGES.",
   detailed: "See how your video retention compares to similar channels. Use this to understand if you are beating the algorithm's expectations."
  },
  "ad-stack-intelligence": {
   short: "ADVANCED MONETIZATION AND CPM ANALYSIS.",
   detailed: "Deep dive into your ad performance and monetized playbacks. Use this to optimize your content for higher-paying demographics."
  },
  "audience-matrix": {
   short: "MULTI-DIMENSIONAL VIEW OF YOUR VIEWERSHIP.",
   detailed: "Analyze geo, device, and sharing data in a unified matrix. Use this to identify new international or mobile-first growth opportunities."
  },
  "bridge-efficiency": {
   short: "MEASURE THE IMPACT OF CROSS-VIDEO PROMOTION.",
   detailed: "Track how well your end screens and cards convert viewers. Use this to build a 'bridge' that keeps viewers on your channel."
  },
  "flight-check": {
   short: "PRE-PUBLISH CHECKLIST FOR PERFECT UPLOADS.",
   detailed: "Ensure every video has optimal SEO, links, and settings before going live. Use this as a final safety net for every release."
  },
  "data-edit": {
   short: "RAPID METADATA EDITOR FOR QUICK ADJUSTMENTS.",
   detailed: "A streamlined interface for updating titles and descriptions. Use this for quick tweaks when you notice a trending keyword."
  },
  "title-rewriter": {
   short: "AI-POWERED TITLE VARIATIONS AND CTR OPTIMIZATION.",
   detailed: "Generate dozens of title alternatives based on your video's core hook. Use this to test different angles before settling on a winner."
  },
  "retention-sim": {
   short: "SIMULATE VIEWERSHIP BEHAVIOR AND PREDICT DROPOFF.",
   detailed: "Analyze potential 'danger zones' in your video's pacing. Use this during the edit to cut out boring segments before you publish."
  },
  "upload-scheduler": {
   short: "7-DAY CONTENT PLANNER AND UPLOAD QUEUE.",
   detailed: "Map out your next week of content and schedule your drops. Use this to maintain a consistent rhythm without the stress."
  },
  "hashtag-analyzer": {
   short: "DEEP ANALYSIS OF HASHTAG REACH AND COMPETITION.",
   detailed: "See which hashtags are trending and which are oversaturated. Use this to pick the perfect set of 3 tags for every video."
  },
  "burnout-monitor": {
   short: "PACING TRACKER TO ENSURE CREATIVE LONGEVITY.",
   detailed: "Monitor your output vs your recovery time. Use this to avoid 'creator burnout' by identifying when you need a break."
  },
  "collab-matchmaker": {
   short: "FIND PEERS AND GENERATE COLLAB PITCHES.",
   detailed: "Discover creators with similar audiences and get AI-drafted reach-out scripts. Use this to grow your community through partnership."
  },
 };

 const description = WIDGET_DESCRIPTIONS[widget.id] || {
  short: "INTERACTIVE SOURCE PREVIEW RETAINED AS IDEA-BANK.",
  detailed: "View raw data streams and historical references before promoting components to the main dashboard."
 };

 return (
  <div
   className="subtoolbox open"
   style={{ "--widget-color": widget.headerColor } as any}
  >
   <div className="subtoolbox-header">
    <div className="left">
     <div className="icon-rail">
      {icon || <Layers size={22} />}
     </div>
     <span className="title">{formattedTitle}</span>
    </div>

    {headerContent && (
     <div className="header-extra" onClick={(e) => e.stopPropagation()} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
      {headerContent}
     </div>
    )}

    <div className="toggle" onClick={(e) => e.stopPropagation()}>
     {canEdit && editMode ?
      <div className="flex items-center gap-1.5 mr-2">
       <button
        onClick={onCycleSize}
        className="widget-control-btn w-5"
        title="Cycle width">
        <ChevronsLeftRight size={12} strokeWidth={3} />
       </button>
       <button
        onClick={onCycleHeight}
        className="widget-control-btn w-5"
        title="Cycle height">
        <ChevronsUpDown size={12} strokeWidth={3} />
       </button>
       <button
        onClick={onRemove}
        className="widget-control-btn w-5"
        title="Remove widget">
        <X size={12} strokeWidth={3} />
       </button>
       <div className="widget-control-btn w-5 cursor-grab active:cursor-grabbing" title="Drag to reorder">
        <GripVertical size={12} strokeWidth={3} />
       </div>
      </div>
     : null}
     <div className="flex items-center gap-1.5">
      {hasAI && (
       <>
        {typeof aiCost === "number" && (
         <span className="widget-ai-cost-chip">{aiCost}T</span>
        )}
        <button
         className="widget-header-btn ai-btn"
         title={aiDisabled && aiDisabledReason ? aiDisabledReason : "Regenerate with AI"}
         onClick={onRegenerate}
         disabled={aiDisabled}>
         <VTLottie
          animationUrl="https://assets3.lottiefiles.com/packages/lf20_m6cu8sh9.json"
          size={16}
         />
        </button>
       </>
      )}
       <button
        className={`widget-header-btn toggle-btn ${isSubtitleOpen ? 'open' : 'closed'}`}
        onClick={() => setIsSubtitleOpen(!isSubtitleOpen)}
        title="Toggle Info">
        <div className="icon">
         <Sparkles size={18} strokeWidth={3} />
        </div>
       </button>
     </div>
    </div>
   </div>

   <div className={`widget-subtitle ${isSubtitleOpen ? 'open' : ''}`}>
    <div className="widget-subtitle-content" style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
     <div style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "12px", lineHeight: 1.2 }}>
      {description.short}
     </div>
     <div style={{ fontWeight: 600, fontSize: "11px", opacity: 0.7, lineHeight: 1.3, textTransform: "none" }}>
      {description.detailed}
     </div>
    </div>
   </div>

   <div className="subtoolbox-content">
    <div className="subtoolbox-body">{children}</div>
   </div>
  </div>
 )
}
