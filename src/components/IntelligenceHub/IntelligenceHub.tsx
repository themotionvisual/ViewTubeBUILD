import React, { useEffect, useRef, useState } from 'react';
import { Brain, Zap, FileText, TrendingUp, Eye, Target, Loader2 } from 'lucide-react';
import type {
  OracleReport,
  AlgorithmDiagnosis,
  ReportPreflightResult,
  KeywordAnalysis,
  UltimateChannelReport,
  ReportSectionPayload,
  ReportSectionState,
  SectionGenerationEvent,
} from './types';
import { IntelligenceChart } from './IntelligenceChart';
import { emitSignal } from '../../services/brain';
import { generateUltimateChannelReport } from './ultimateReport';

const ULTIMATE_REPORT_STORAGE_KEY = "vt_ultimate_channel_report_v1";
const ULTIMATE_REPORT_CONTEXT_KEY = "vt_ultimate_tool_context_pack_v1";
const ULTIMATE_REPORT_EVENT = "vt_generate_ultimate_report";
const STREAM_SECTION_TITLES = [
  "Executive Summary + Channel Metrics",
  "Algorithm Diagnosis",
  "Strategy Engine Daily Command",
  "Sculpting Engine",
  "Channel Pulse + Audience DNA",
  "Comparative Data Analysis",
  "Keyword Matrix",
  "Engagement Matrix",
  "Retention Burnout Analysis",
  "Revenue & RPM Dynamics",
  "Risk Flags & Guardrails",
  "Execution Queue + Progress Delta",
];

type IntelligenceHubProps = {
  autoContext?: string;
  dataSources?: string[];
  mode?: "full" | "ultimate";
};

const IntelligenceHub: React.FC<IntelligenceHubProps> = ({
  autoContext = "",
  dataSources = [],
  mode = "full",
}) => {
  const triggerRef = useRef<() => Promise<void>>(async () => {});
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AlgorithmDiagnosis | null>(null);
  const [report, setReport] = useState<OracleReport | null>(null);
  const [keywordData, setKeywordData] = useState<KeywordAnalysis | null>(null);
  const [ultimateReport, setUltimateReport] = useState<UltimateChannelReport | null>(() => {
    try {
      const raw = localStorage.getItem(ULTIMATE_REPORT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UltimateChannelReport) : null;
    } catch {
      return null;
    }
  });
  const [nexusContext, setNexusContext] = useState('');
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [sectionStates, setSectionStates] = useState<ReportSectionState[]>([]);
  const [generationEvents, setGenerationEvents] = useState<SectionGenerationEvent[]>([]);
  const [sessionMeta, setSessionMeta] = useState<{
    generationId: string;
    startedAt: string;
    finishedAt?: string;
    overallStatus: "running" | "complete" | "degraded" | "failed";
    completedCount: number;
    failedCount: number;
    degradedCount: number;
    totalCount: number;
  } | null>(null);
  const [preflight, setPreflight] = useState<ReportPreflightResult | null>(null);
  const showFullSurface = mode === "full";
  const variantClasses: Record<string, { header: string; panel: string; chip: string }> = {
    executive: { header: "bg-[#CCFF00]", panel: "bg-[#F8FFE0]", chip: "bg-black text-[#CCFF00]" },
    forensic: { header: "bg-[#00CCFF]", panel: "bg-[#E8FAFF]", chip: "bg-black text-[#00CCFF]" },
    trend: { header: "bg-[#FF8DB1]", panel: "bg-[#FFEAF2]", chip: "bg-black text-[#FF8DB1]" },
    audience: { header: "bg-[#64E58B]", panel: "bg-[#E9FFF0]", chip: "bg-black text-[#64E58B]" },
    finance: { header: "bg-[#FFB158]", panel: "bg-[#FFF2DF]", chip: "bg-black text-[#FFB158]" },
    ops: { header: "bg-[#B79CFF]", panel: "bg-[#F0EAFF]", chip: "bg-black text-[#B79CFF]" },
  };

  const runOmniBrain = async () => {
    setLoading(true);
    setGenerationStatus("Generating report...");
    setGenerationEvents([]);
    setSessionMeta(null);
    setPreflight(null);
    setSectionStates(
      STREAM_SECTION_TITLES.map((title, idx) => ({
        id: String(idx + 1),
        order: idx + 1,
        title,
        status: "queued",
        summary: "",
        bullets: [],
        metrics: [],
        notes: [],
        sourceLabels: [],
        evidenceRefs: [],
        confidence: 0,
        qualityFlags: [],
        actions: [],
      })),
    );
    emitSignal('omni-brain', 'SYNC_DNA_RUN', { context: nexusContext || autoContext || "AUTO_CONTEXT" }).catch(console.error);
    try {
      const generationPromise = generateUltimateChannelReport({
        manualIntent: nexusContext,
        autoContext,
        dataSources,
        onSessionUpdate: (meta) => {
          setSessionMeta(meta);
        },
        onSectionUpdate: (section, event) => {
          setSectionStates((prev) => {
            const next = [...prev];
            const idx = next.findIndex((entry) => entry.id === section.id);
            if (idx >= 0) {
              next[idx] = section;
            } else {
              next.push(section);
              next.sort((a, b) => a.order - b.order);
            }
            return next;
          });
          setGenerationEvents((prev) => [event, ...prev].slice(0, 80));
        },
      });
      const softTimeoutId = setTimeout(() => {
        setGenerationStatus("Generation is taking longer than expected. Streaming will continue as sections complete.");
      }, 65000);
      const { report: unifiedReport, diagnosis: diagRes, oracle: oracleRes, keyword: kwRes } =
        await generationPromise;
      clearTimeout(softTimeoutId);
      setDiagnosis(diagRes);
      setReport(oracleRes);
      setKeywordData(kwRes);
      setUltimateReport(unifiedReport);
      setSectionStates((prev) => (unifiedReport.sectionStates && unifiedReport.sectionStates.length > 0 ? unifiedReport.sectionStates : prev));
      setGenerationEvents((prev) => (unifiedReport.generationEvents && unifiedReport.generationEvents.length > 0 ? unifiedReport.generationEvents : prev));
      setGenerationStatus(
        unifiedReport.meta.diagnostics.warningCount > 0
          ? "Report generated in degraded mode. Some upstream sources failed or timed out."
          : "Report generated successfully.",
      );
      setPreflight(unifiedReport.meta.diagnostics.preflight || null);
      localStorage.setItem(ULTIMATE_REPORT_STORAGE_KEY, JSON.stringify(unifiedReport));
      if (unifiedReport.toolContextPack) {
        localStorage.setItem(ULTIMATE_REPORT_CONTEXT_KEY, JSON.stringify(unifiedReport.toolContextPack));
      }
      emitSignal("ORACLE_REPORT", "ULTIMATE_REPORT_GENERATED", {
        generationId: unifiedReport.meta.generationId,
        analysisMode: unifiedReport.meta.analysisMode,
        promptPackVersion: unifiedReport.meta.promptPackVersion,
        contextMode: unifiedReport.meta.contextMode,
        actionPlan: unifiedReport.actionPlan.slice(0, 5),
        riskFlags: unifiedReport.riskFlags.slice(0, 5),
      }).catch(console.error);
      setActiveSectionIdx(0);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Ultimate report generation failed.";
      if (msg.startsWith("REPORT_PREFLIGHT_BLOCKED::")) {
        const raw = msg.replace("REPORT_PREFLIGHT_BLOCKED::", "");
        try {
          const parsed = JSON.parse(raw) as { message?: string; preflight?: ReportPreflightResult };
          setPreflight(parsed.preflight || null);
          setGenerationStatus(parsed.message || "Generation blocked: required sources missing.");
          setSectionStates((prev) =>
            prev.map((section) => ({
              ...section,
              status: "failed",
              qualityFlags: ["preflight_blocked"],
              summary: section.summary || "Blocked by preflight gate.",
            })),
          );
          setGenerationEvents((prev) => [
            {
              sectionId: "preflight",
              status: "failed",
              ts: new Date().toISOString(),
              note: "Preflight gate blocked generation due to missing required sources.",
            },
            ...prev,
          ]);
          return;
        } catch {
          setGenerationStatus("Generation blocked by preflight gate.");
          return;
        }
      }
      setGenerationStatus(msg);
    } finally {
      setLoading(false);
    }
  };
  triggerRef.current = runOmniBrain;

  useEffect(() => {
    const handleGenerateEvent = () => {
      triggerRef.current().catch((error) => {
        console.error("Ultimate report event trigger failed", error);
      });
    };
    window.addEventListener(ULTIMATE_REPORT_EVENT, handleGenerateEvent);
    return () => window.removeEventListener(ULTIMATE_REPORT_EVENT, handleGenerateEvent);
  }, []);

  const isGenerated = diagnosis && report && keywordData;
  const renderPayload = (payload?: ReportSectionPayload) => {
    if (!payload) return null;
    return (
      <div className="space-y-3">
        {payload.metrics && payload.metrics.length > 0 && (
          <div className="border-2 border-black rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-black text-white">
                <tr>
                  <th className="text-left p-2 font-black uppercase tracking-wide">Metric</th>
                  <th className="text-left p-2 font-black uppercase tracking-wide">Value</th>
                  <th className="text-left p-2 font-black uppercase tracking-wide">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {payload.metrics.map((metric, idx) => (
                  <tr key={`metric-${idx}`} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-2 border-t border-black/10 font-bold">{metric.label}</td>
                    <td className="p-2 border-t border-black/10 font-bold">{String(metric.value)}</td>
                    <td className="p-2 border-t border-black/10 font-bold">{metric.evidence || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {payload.bullets && payload.bullets.length > 0 && (
          <ul className="space-y-1">
            {payload.bullets.map((item, idx) => (
              <li key={`bullet-${idx}`} className="text-sm font-bold">{idx + 1}. {item}</li>
            ))}
          </ul>
        )}
        {payload.notes && payload.notes.length > 0 && (
          <div className="space-y-1">
            {payload.notes.map((note, idx) => (
              <p key={`note-${idx}`} className="text-xs font-black uppercase tracking-wide text-black/60">{note}</p>
            ))}
          </div>
        )}
      </div>
    );
  };
  const renderedBlocks =
    ultimateReport?.blocks ||
    sectionStates.map((section) => ({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      summary: section.summary,
      recommendations: section.actions,
      styleVariant: section.styleVariant || "forensic",
      payload: {
        bullets: section.bullets,
        metrics: section.metrics,
        notes: section.notes,
      } as ReportSectionPayload,
      chartSuggestion: section.chartSpec,
      tableSpec: section.tableSpec,
    }));
  const timelineStates: ReportSectionState[] =
    sectionStates.length > 0
      ? sectionStates
      : renderedBlocks.map((block, idx) => ({
          id: block.id,
          order: idx + 1,
          title: block.title,
          subtitle: block.subtitle,
          status: "complete",
          summary: block.summary,
          bullets: block.payload?.bullets || [],
          metrics: block.payload?.metrics || [],
          notes: block.payload?.notes || [],
          sourceLabels: [],
          evidenceRefs: [],
          confidence: 0,
          qualityFlags: [],
          actions: block.recommendations || [],
          chartSpec: block.chartSuggestion,
          tableSpec: block.tableSpec,
          styleVariant: block.styleVariant,
        }));
  const streamEvents =
    generationEvents.length > 0
      ? generationEvents
      : timelineStates.map((section) => ({
          sectionId: section.id,
          status: section.status,
          ts: ultimateReport?.meta?.generatedAt || new Date().toISOString(),
          note: `${section.title} restored from persisted report.`,
        }));

  return (
    <div className="animate-fade-in max-w-[1500px] mx-auto pb-24">
      {showFullSurface ? (
        <div className="border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12">
          <div className="bg-[#00CCFF] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain size={28} className="text-black" />
              <span className="text-3xl font-[1000] uppercase tracking-tight text-black">NEURAL NEXUS v2.0</span>
            </div>
            <span className="text-[10px] font-black opacity-50 tracking-widest uppercase">Strategy DNA Broadcast</span>
          </div>
          <div className="p-6 bg-black flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={nexusContext}
              onChange={(e) => setNexusContext(e.target.value)}
              placeholder="INPUT STRATEGIC INTENT OR PASTE CHANNEL METRICS..."
              className="flex-1 bg-transparent border-2 border-[#00CCFF] text-[#00CCFF] p-4 font-black text-sm uppercase tracking-widest outline-none placeholder:text-[#00CCFF]/30 rounded-xl"
              disabled={loading}
            />
            <button
              onClick={runOmniBrain}
              disabled={loading}
              className="bg-[#00CCFF] text-black font-[1000] text-xl uppercase px-12 py-4 rounded-xl border-2 border-[#00CCFF] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" size={24} /> CALIBRATING...</> : 'SYNC DNA'}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12">
          <div className="bg-[#CCFF00] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-black" />
              <span className="text-2xl font-[1000] uppercase tracking-tight text-black">Performance Ultimate Report Generator</span>
            </div>
            <span className="text-[10px] font-black opacity-60 tracking-widest uppercase">No Required Manual Input</span>
          </div>
          <div className="p-6 bg-black flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={nexusContext}
              onChange={(e) => setNexusContext(e.target.value)}
              placeholder="OPTIONAL: ADD EXTRA STRATEGIC CONTEXT"
              className="flex-1 bg-transparent border-2 border-[#CCFF00] text-[#CCFF00] p-4 font-black text-sm uppercase tracking-widest outline-none placeholder:text-[#CCFF00]/35 rounded-xl"
              disabled={loading}
            />
            <button
              onClick={runOmniBrain}
              disabled={loading}
              className="bg-[#CCFF00] text-black font-[1000] text-xl uppercase px-12 py-4 rounded-xl border-2 border-[#CCFF00] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" size={24} /> GENERATING...</> : 'GENERATE ULTIMATE REPORT'}
            </button>
          </div>
        </div>
      )}

      {(ultimateReport || sectionStates.length > 0) && (
        <div className="border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12">
          <div className="bg-[#CCFF00] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-black" />
              <span className="text-2xl font-[1000] uppercase tracking-tight text-black">Ultimate Channel Report · /performance</span>
            </div>
            <span className="text-[10px] font-black opacity-60 tracking-widest uppercase">
              {ultimateReport?.meta?.generatedAt ? new Date(ultimateReport.meta.generatedAt).toLocaleString() : "Generating..."}
            </span>
          </div>
          <div className="p-6 md:p-8 bg-[linear-gradient(180deg,#f5f5f5_0%,#ececec_100%)] space-y-6">
            {generationStatus ? (
              <div className="border-3 border-black rounded-2xl bg-[#FFF2A8] px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black">{generationStatus}</p>
              </div>
            ) : null}
            {preflight && !preflight.ok ? (
              <div className="border-3 border-black rounded-2xl bg-[#FFE3E8] px-4 py-3 space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black">Generation Blocked · Required Sources Missing</p>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/70">
                  Source window: {preflight.sourceWindow || "unknown"} · mode: {preflight.sourceMode || "unknown"}
                </p>
                <ul className="text-xs font-bold list-disc ml-5">
                  {preflight.blockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
                <ul className="text-xs font-bold list-disc ml-5">
                  {preflight.remediation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="border-2 border-black rounded-xl bg-white p-2 space-y-1">
                  {preflight.requiredSources.map((source) => (
                    <p key={source.key} className="text-[10px] font-bold">
                      {source.key}: {source.present ? "present" : "missing"} · {source.evidence || source.detail}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="border-3 border-black bg-white rounded-2xl p-4 md:p-6 shadow-[4px_4px_0px_0px_black] space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  "Brain Source: Connected",
                  "Master Data Tables: Synced",
                  "API Storage: Active",
                  "AI Journal: Included",
                  "User Profile: Included",
                ].map((chip) => (
                  <span key={chip} className="text-[10px] font-black uppercase tracking-wide px-2 py-1 border-2 border-black rounded-lg bg-[#CCFF00]">
                    {chip}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-[1000] uppercase mb-2">Executive Command Snapshot</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/45 mb-2">
                Mode: {ultimateReport?.meta?.analysisMode || "channel"} · Prompt Pack: {ultimateReport?.meta?.promptPackVersion || "ultimate_fusion_v1"}
                {sessionMeta ? ` · ${sessionMeta.completedCount}/${sessionMeta.totalCount} complete` : ""}
              </p>
              <p className="text-sm font-bold whitespace-pre-wrap">{ultimateReport?.executiveSummary || "Building executive summary from Brain, master tables, API, journal, and channel profile context..."}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <aside className="xl:col-span-3 border-3 border-black rounded-2xl bg-white shadow-[4px_4px_0px_0px_black] p-4">
                <h4 className="font-[1000] uppercase text-sm mb-3">Section Timeline</h4>
                <div className="space-y-2 max-h-[620px] overflow-auto pr-1">
                  {timelineStates.map((section) => (
                    <div key={`timeline-${section.id}`} className="border-2 border-black rounded-lg p-2 bg-[#f8f8f8]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase">{section.order}. {section.title}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                          section.status === "complete" ? "bg-[#64E58B]" :
                          section.status === "running" ? "bg-[#00CCFF]" :
                          section.status === "degraded" ? "bg-[#FFB158]" :
                          section.status === "failed" ? "bg-[#FF8DB1]" : "bg-white"
                        }`}>
                          {section.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="xl:col-span-6 grid grid-cols-1 gap-5">
                {renderedBlocks.map((block) => {
                  const sectionState = timelineStates.find((s) => s.id === block.id);
                  const isQueued = sectionState?.status === "queued";
                  return (
                    <section
                      key={block.id}
                      className={`border-3 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_black] ${variantClasses[block.styleVariant || "forensic"].panel}`}
                    >
                      <header
                        className={`px-4 py-3 border-b-3 border-black flex items-center justify-between ${variantClasses[block.styleVariant || "forensic"].header}`}
                      >
                        <div>
                          <h4 className="font-[1000] uppercase tracking-tight text-sm md:text-base">{block.id}. {sectionState?.title || block.title}</h4>
                          {block.subtitle ? (
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/50 mt-1">{block.subtitle}</p>
                          ) : null}
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border-2 border-black ${variantClasses[block.styleVariant || "forensic"].chip}`}>
                          {sectionState?.status || "queued"}
                        </span>
                      </header>
                      <div className="p-4 md:p-5 space-y-4">
                        {isQueued ? (
                          <div className="space-y-2">
                            <div className="h-3 bg-black/10 rounded animate-pulse" />
                            <div className="h-3 bg-black/10 rounded animate-pulse w-11/12" />
                            <div className="h-3 bg-black/10 rounded animate-pulse w-9/12" />
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{block.summary}</p>
                            {renderPayload(block.payload)}
                            {block.chartSuggestion && (
                              <div className="border-2 border-black rounded-xl bg-white p-4 overflow-x-auto min-h-[220px]">
                                <IntelligenceChart config={block.chartSuggestion} data={keywordData?.keywordMetrics || []} />
                              </div>
                            )}
                            {block.tableSpec && (
                              <div className="border-2 border-black rounded-xl overflow-auto max-h-[300px] bg-white">
                                <table className="w-full border-collapse text-xs">
                                  <thead className="bg-black text-white sticky top-0">
                                    <tr>
                                      {block.tableSpec.headers.map((header) => (
                                        <th key={header} className="text-left p-2 font-black uppercase tracking-wide border-r border-white/20">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {block.tableSpec.rows.map((row, rowIdx) => (
                                      <tr key={`${block.id}-row-${rowIdx}`} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        {row.map((cell, cellIdx) => (
                                          <td key={`${block.id}-${rowIdx}-${cellIdx}`} className="p-2 border-t border-black/10 border-r border-black/10 font-bold whitespace-nowrap">
                                            {String(cell)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            {block.recommendations.length > 0 && (
                              <ul className="space-y-1 border-2 border-black rounded-xl bg-white p-3">
                                {block.recommendations.map((item, idx) => (
                                  <li key={`${block.id}-rec-${idx}`} className="text-sm font-bold">
                                    {idx + 1}. {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>

              <aside className="xl:col-span-3 border-3 border-black rounded-2xl bg-white shadow-[4px_4px_0px_0px_black] p-4">
                <h4 className="font-[1000] uppercase text-sm mb-3">Generation Stream</h4>
                <div className="space-y-2 max-h-[620px] overflow-auto pr-1">
                  {streamEvents.length === 0 ? (
                    <p className="text-xs font-bold text-black/50">No section events yet.</p>
                  ) : (
                    streamEvents.map((event, idx) => (
                      <div key={`event-${idx}`} className="border-2 border-black rounded-lg p-2 bg-[#f8f8f8]">
                        <p className="text-[9px] font-black uppercase">{event.sectionId} · {event.status}</p>
                        <p className="text-[10px] font-bold">{event.note}</p>
                        <p className="text-[9px] font-black uppercase text-black/40">{new Date(event.ts).toLocaleTimeString()}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 border-t-2 border-dashed border-black pt-3 flex flex-wrap gap-2">
                  {["Download PDF", "Share Report", "Save to Brain"].map((action) => (
                    <button key={action} className="text-[10px] font-black uppercase px-2 py-1 border-2 border-black rounded bg-[#00CCFF]">
                      {action}
                    </button>
                  ))}
                </div>
              </aside>
            </div>
            {ultimateReport?.miniSpreadsheets && ultimateReport.miniSpreadsheets.length > 0 && (
              <section className="border-3 border-black rounded-2xl overflow-hidden bg-[#F6F6F6] shadow-[4px_4px_0px_0px_black]">
                <header className="px-4 py-3 border-b-3 border-black bg-[#FFB158]">
                  <h4 className="font-[1000] uppercase tracking-tight text-sm md:text-base">Comparative Data Mini Sheets</h4>
                </header>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ultimateReport.miniSpreadsheets.slice(0, 8).map((sheet, idx) => (
                    <div key={`sheet-${idx}`} className="border-2 border-black rounded-xl overflow-auto bg-white">
                      <div className="px-3 py-2 border-b-2 border-black bg-[#EFEFEF] text-xs font-black uppercase tracking-wide">
                        {sheet.title}
                      </div>
                      <table className="w-full border-collapse text-xs">
                        <thead className="bg-black text-white">
                          <tr>
                            {sheet.headers.map((header) => (
                              <th key={`${sheet.title}-${header}`} className="text-left p-2 font-black uppercase tracking-wide border-r border-white/20">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sheet.rows.map((row, rowIdx) => (
                            <tr key={`${sheet.title}-row-${rowIdx}`} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              {row.map((cell, cellIdx) => (
                                <td key={`${sheet.title}-${rowIdx}-${cellIdx}`} className="p-2 border-t border-black/10 border-r border-black/10 font-bold whitespace-nowrap">
                                  {String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* MASTER DOSSIER (Hidden until generated) */}
      {showFullSurface && isGenerated && !loading && (
        <div className="space-y-12 animate-fade-in">
          
          {/* HEADER: COMMAND BRIEF & GOVERNOR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white flex flex-col">
              <div className="bg-black text-white px-6 py-3 font-black uppercase text-sm flex items-center gap-2">
                <Zap size={16} className="text-[#FFDD00]" /> DAILY COMMAND BRIEF
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-4xl font-[1000] uppercase tracking-tight leading-none">
                    {diagnosis?.dailyBrief?.priority || "STRATEGY CALIBRATED"}
                  </h3>
                  <div className="space-y-3 mt-4">
                    {diagnosis?.dailyBrief?.steps?.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start p-3 bg-gray-50 border-2 border-black rounded-xl">
                        <span className="bg-black text-[#FFDD00] w-6 h-6 flex items-center justify-center rounded-full font-black text-xs flex-shrink-0">{i+1}</span>
                        <span className="font-bold text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#FFDD00] p-6 border-4 border-black rounded-3xl flex flex-col justify-center items-center text-center shadow-[4px_4px_0px_0px_black]">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Impact Potential</span>
                  <span className="text-5xl font-[1000]">{diagnosis?.dailyBrief?.impact || "0%"}</span>
                </div>
              </div>
            </div>

            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white flex flex-col">
              <div className="bg-[#FF3399] text-white px-6 py-3 font-black uppercase text-sm">THE GOVERNOR</div>
              <div className="p-6 space-y-4 flex-1">
                {[
                  { label: 'CTR Pivot Protocol', desc: 'Auto-swap thumbnails at 24h threshold', on: true },
                  { label: 'Retention Rescue', desc: 'Pin comments at major drop-off markers', on: false },
                  { label: 'Audience Seeding', desc: 'Cross-pollinate shorts viewers to long-form', on: true },
                ].map((g, i) => (
                  <div key={i} className="p-3 border-2 border-black rounded-xl bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-black text-xs uppercase">{g.label}</p>
                      <p className="text-[10px] font-bold opacity-50">{g.desc}</p>
                    </div>
                    <div className={`w-10 h-5 ${g.on ? 'bg-[#FF3399]' : 'bg-gray-300'} border-2 border-black rounded-full relative transition-colors`}>
                      <div className={`absolute ${g.on ? 'right-[2px]' : 'left-[2px]'} top-[2px] w-3 h-3 bg-black rounded-full transition-all`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 1: ALGORITHMIC FINGERPRINTING */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-[#00CCFF]">
              <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-white">CLUSTER CENTER</div>
              <div className="p-6 flex items-center justify-center h-full">
                <span className="text-4xl font-[1000] uppercase text-center text-black leading-none">{diagnosis?.clusterCenter || "UNKNOWN"}</span>
              </div>
            </div>
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
              <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-gray-100">NICHE AUTHORITY</div>
              <div className="p-6 flex items-center justify-center h-full">
                <span className="text-6xl font-[1000] text-[#00CCFF]">{diagnosis?.nicheAuthority || 0}%</span>
              </div>
            </div>
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-black">
              <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-white">TOPIC RESONANCE</div>
              <div className="p-6 flex items-end justify-between h-full gap-2">
                {[40, 70, 45, 90, 65, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#CCFF00] border-2 border-black rounded-t-md" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2: ORACLE 9-SECTION STRATEGY */}
          {report?.sections && report.sections.length > 0 && (
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] bg-white">
              <div className="bg-[#9D4EDD] text-white px-6 py-4 flex items-center gap-3 border-b-4 border-black">
                <Eye size={24} />
                <span className="text-2xl font-[1000] uppercase tracking-tight">ORACLE STRATEGY DOSSIER</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                {/* Navigation */}
                <div className="lg:col-span-3 border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-gray-50 flex flex-col">
                  {report.sections.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveSectionIdx(i)}
                      className={`text-left p-4 border-b-2 border-black font-black text-xs uppercase transition-colors flex items-center ${activeSectionIdx === i ? 'bg-[#9D4EDD] text-white' : 'hover:bg-gray-200 text-black'}`}
                    >
                      <span className="opacity-50 mr-3 text-[10px] w-4">{String(i+1).padStart(2,'0')}</span>
                      {s.title}
                    </button>
                  ))}
                </div>
                {/* Content */}
                <div className="lg:col-span-9 p-8 flex flex-col bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-3xl font-[1000] uppercase tracking-tight">{report.sections[activeSectionIdx]?.title}</h4>
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Section {activeSectionIdx + 1} of {report.sections.length}</span>
                  </div>
                  <div className="prose max-w-none text-sm font-bold whitespace-pre-wrap leading-relaxed mb-8">
                    {report.sections[activeSectionIdx]?.content}
                  </div>
                  {report.sections[activeSectionIdx]?.chartSuggestion && (
                    <div className="mt-auto border-4 border-dashed border-black rounded-3xl p-6 bg-gray-50">
                      <IntelligenceChart config={report.sections[activeSectionIdx].chartSuggestion!} data={[]} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ROW 3: MARKET INTELLIGENCE (Keyword Lab) */}
          {keywordData && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-1 flex-1 bg-black"></div>
                <h2 className="text-3xl font-[1000] uppercase tracking-widest">MARKET INTELLIGENCE</h2>
                <div className="h-1 flex-1 bg-black"></div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {keywordData.keywordMetrics?.length > 0 && (
                  <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
                    <div className="bg-[#FFB158] px-6 py-3 font-black uppercase text-sm border-b-4 border-black">OPPORTUNITY MATRIX</div>
                    <div className="p-6">
                      <IntelligenceChart config={{ type: 'scatter', title: 'Difficulty vs Volume', xAxisKey: 'volume', dataKeys: ['difficulty'] }} data={keywordData.keywordMetrics} />
                    </div>
                  </div>
                )}
                
                {keywordData.contentFormats?.length > 0 && (
                  <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
                    <div className="bg-[#CCFF00] px-6 py-3 font-black uppercase text-sm border-b-4 border-black">WINNING FORMATS</div>
                    <div className="p-6">
                      <IntelligenceChart config={{ type: 'pie', title: 'Format Distribution', xAxisKey: 'name', dataKeys: ['percentage'] }} data={keywordData.contentFormats} />
                    </div>
                  </div>
                )}

                {keywordData.searchIntent?.length > 0 && (
                  <div className="lg:col-span-2 border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
                    <div className="bg-black text-white px-6 py-3 font-black uppercase text-sm border-b-4 border-black flex items-center gap-2">
                      <Target size={16} /> SEARCH INTENT DECODER
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b-4 border-black">
                            <th className="text-left p-4 font-black text-xs uppercase">Query</th>
                            <th className="text-left p-4 font-black text-xs uppercase">Intent</th>
                            <th className="text-left p-4 font-black text-xs uppercase">Content Angle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {keywordData.searchIntent.map((si, i) => (
                            <tr key={i} className="border-b-2 border-gray-200 hover:bg-gray-50">
                              <td className="p-4 font-bold text-sm border-r-2 border-gray-200">{si.query}</td>
                              <td className="p-4 border-r-2 border-gray-200">
                                <span className="bg-black text-[#00CCFF] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{si.intent}</span>
                              </td>
                              <td className="p-4 text-sm font-bold opacity-80">{si.contentAngle}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default IntelligenceHub;
