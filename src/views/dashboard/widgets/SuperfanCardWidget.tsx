import React, { useEffect, useMemo, useState } from "react"
import { Brain, MessageCircle, MessagesSquare, Star, Users } from "lucide-react"
import {
  createViewTubeActionPacket,
  persistViewTubeActionPacket,
} from "../../../services/viewTubeToolChains"
import {
  normalizeCommunityCommentEvidence,
  rankCommunityAdvocates,
  type CommunityAdvocate,
  type CommunityCommentEvidence,
} from "../../../services/superfanIntelligence"
import { WidgetShell } from "../WidgetShell"
import { useVideoComments } from "../useVideoComments"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import {
  WidgetBadge,
  WidgetMetric,
  WidgetModuleFrame,
  WidgetModuleHeader,
  WidgetPreviewState,
  WidgetScrollArea,
  WidgetSizedButton,
} from "../WidgetPrimitives"
import "./SuperfanCardWidget.css"

const arrayOrEmpty = (value: unknown): unknown[] => Array.isArray(value) ? value : []

const collectBrainCommentEvidence = (
  brain: unknown,
  fallbackVideoId: string,
): CommunityCommentEvidence[] => {
  const source = (brain || {}) as any
  const pools: Array<{ items: unknown[]; source: string }> = [
    { items: arrayOrEmpty(source?.audienceEvidence?.comments), source: "audience-evidence" },
    { items: arrayOrEmpty(source?.evidencePack?.audienceEvidence?.comments), source: "evidence-pack" },
    { items: arrayOrEmpty(source?.onboardingEvidence?.audienceEvidence?.comments), source: "onboarding-evidence" },
    { items: arrayOrEmpty(source?.onboardingState?.evidencePack?.audienceEvidence?.comments), source: "onboarding-state" },
    { items: arrayOrEmpty(source?.onboarding?.evidencePacket?.audienceEvidence?.comments), source: "onboarding-packet" },
    { items: arrayOrEmpty(source?.comments), source: "brain-comments" },
    { items: arrayOrEmpty(source?.recentComments), source: "brain-recent-comments" },
    { items: arrayOrEmpty(source?.channelHub?.comments), source: "channel-hub-comments" },
  ]

  return pools.flatMap((pool) =>
    normalizeCommunityCommentEvidence(pool.items, {
      fallbackVideoId,
      source: pool.source,
    }))
}

const confidenceStatus = (confidence: CommunityAdvocate["confidence"]) =>
  confidence === "strong" ? "positive" : confidence === "medium" ? "warning" : "neutral"

export const SuperfanCardWidget: React.FC<
  CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }
> = ({ data, onNavigate, ...common }) => {
  const recentVideoId =
    data.recentUploads?.[0]?.videoId
    || data.canonicalRows?.[0]?.videoId
    || null
  const { comments: recentVideoComments, loading } = useVideoComments(recentVideoId)
  const [selectedAuthorKey, setSelectedAuthorKey] = useState<string | null>(null)

  const brainEvidence = useMemo(
    () => collectBrainCommentEvidence(data.brain, recentVideoId || ""),
    [data.brain, recentVideoId],
  )

  const recentEvidence = useMemo(
    () => normalizeCommunityCommentEvidence(
      recentVideoComments.map((comment) => ({
        ...comment,
        videoId: recentVideoId || "",
      })),
      { fallbackVideoId: recentVideoId || "", source: "recent-video" },
    ),
    [recentVideoComments, recentVideoId],
  )

  // Prefer broader evidence when it exists. The recent-video hook is a truthful
  // fallback, not a reason to inflate one video's activity into channel loyalty.
  const evidence = brainEvidence.length ? brainEvidence : recentEvidence

  const excludedAuthors = useMemo(() => [
    data.authState?.channelName,
    data.authState?.channelHandle,
    data.channelIdentity?.name,
    data.channelTitle,
  ].filter((value): value is string => Boolean(value)), [
    data.authState?.channelHandle,
    data.authState?.channelName,
    data.channelIdentity?.name,
    data.channelTitle,
  ])

  const advocates = useMemo(
    () => rankCommunityAdvocates(evidence, {
      excludedAuthors,
      limit: common.instance.size === "quarter" ? 5 : 10,
    }),
    [common.instance.size, evidence, excludedAuthors],
  )

  useEffect(() => {
    setSelectedAuthorKey((current) =>
      current && advocates.some((advocate) => advocate.authorKey === current)
        ? current
        : advocates[0]?.authorKey || null)
  }, [advocates])

  const selected =
    advocates.find((advocate) => advocate.authorKey === selectedAuthorKey)
    || advocates[0]
    || null

  const evidenceVideoCount = useMemo(
    () => new Set(evidence.map((comment) => comment.videoId).filter(Boolean)).size,
    [evidence],
  )

  const repeatedAdvocates = advocates.filter((advocate) => advocate.commentCount > 1).length
  const multiVideoAdvocates = advocates.filter((advocate) => advocate.videoCount > 1).length
  const scopeLabel = brainEvidence.length
    ? evidenceVideoCount > 1 ? "MULTI-VIDEO EVIDENCE" : "CHANNEL EVIDENCE · 1 VIDEO"
    : recentVideoId ? "RECENT VIDEO ONLY" : "NO COMMENT EVIDENCE"

  const sendHandoff = (target: "comment-responder" | "ai-brain") => {
    if (!selected) return
    const packet = createViewTubeActionPacket({
      sourceToolId: "superfan-card",
      sourceKind: "widget",
      payloadKind: "comment",
      title: `Community advocate · ${selected.author}`,
      summary: `Evidence-backed audience advocate with ${selected.commentCount} comments across ${selected.videoCount || 1} observed video${selected.videoCount === 1 ? "" : "s"}.`,
      payload: {
        author: selected.author,
        score: selected.score,
        confidence: selected.confidence,
        signals: selected.signals,
        commentIds: selected.commentIds,
        videoIds: selected.videoIds,
        comments: selected.evidence.slice(0, 6).map((comment) => ({
          id: comment.id,
          videoId: comment.videoId,
          text: comment.text,
          likeCount: comment.likeCount,
          replyCount: comment.replyCount,
          publishedAt: comment.publishedAt,
        })),
        evidenceScope: scopeLabel,
      },
      channelId: data.authState?.channelId || null,
      videoId: selected.videoIds[0] || recentVideoId || null,
      evidence: selected.commentIds.map((id) => `comment:${id}`),
      provenance: ["superfan-card", "comment-evidence", "community-advocate-ranking-v1"],
      suggestedTargets: [target],
    })
    persistViewTubeActionPacket(packet)

    if (target === "comment-responder") {
      onNavigate?.(`/studio?handoff=${encodeURIComponent(packet.id)}#comment-responder`)
    } else {
      onNavigate?.(`/ai-brain?handoff=${encodeURIComponent(packet.id)}`)
    }
  }

  return (
    <WidgetShell {...common} icon={<Star size={22} />}>
      <div className="superfan-card-widget">
        <div className="superfan-card-widget__summary">
          <WidgetMetric label="COMMENT EVIDENCE" value={evidence.length} />
          <WidgetMetric label="ADVOCATES" value={advocates.length} />
          <WidgetMetric label="REPEAT" value={repeatedAdvocates} />
          <WidgetMetric label="MULTI-VIDEO" value={multiVideoAdvocates} />
          <WidgetBadge
            height={18}
            status={brainEvidence.length && evidenceVideoCount > 1 ? "positive" : evidence.length ? "warning" : "neutral"}
          >
            {scopeLabel}
          </WidgetBadge>
        </div>

        {!advocates.length && loading ? (
          <WidgetModuleFrame
            className="superfan-card-widget__loading"
            header={<WidgetModuleHeader icon={<MessagesSquare />} title="SCANNING COMMENTS" subtitle="Building observable audience evidence" />}
          >
            <span>Loading recent comment evidence without inferring unsupported loyalty or subscriber status.</span>
          </WidgetModuleFrame>
        ) : !advocates.length ? (
          <WidgetPreviewState
            compact
            className="superfan-card-widget__preview"
            previewLabel="NO AUDIENCE EVIDENCE"
            previewReason="No real commenter evidence is available yet. This widget will not invent fan identities or loyalty claims."
            recoveryAction="OPEN COMMENTS"
            onRecover={() => onNavigate?.("/studio#comment-responder")}
            illustration={<Users aria-hidden="true" />}
          >
            <span>Connect or sync comment data to rank community advocates from observed participation.</span>
          </WidgetPreviewState>
        ) : (
          <div className="superfan-card-widget__workspace">
            <WidgetScrollArea
              ariaLabel="Community advocate ranking"
              className="superfan-card-widget__ranking"
            >
              <div className="superfan-card-widget__ranking-list">
                {advocates.map((advocate, index) => (
                  <button
                    key={advocate.authorKey}
                    type="button"
                    className="superfan-card-widget__advocate"
                    data-selected={advocate.authorKey === selected?.authorKey ? "true" : "false"}
                    aria-pressed={advocate.authorKey === selected?.authorKey}
                    onClick={() => setSelectedAuthorKey(advocate.authorKey)}
                  >
                    <span className="superfan-card-widget__rank">{index + 1}</span>
                    <span className="superfan-card-widget__avatar" aria-hidden="true">
                      {advocate.author.replace(/^@+/, "").charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="superfan-card-widget__advocate-copy">
                      <strong>{advocate.author}</strong>
                      <small>{advocate.commentCount} comments · {advocate.videoCount || 1} observed video{advocate.videoCount === 1 ? "" : "s"}</small>
                    </span>
                    <WidgetBadge height={18} status={confidenceStatus(advocate.confidence)}>
                      {advocate.confidence.toUpperCase()}
                    </WidgetBadge>
                  </button>
                ))}
              </div>
            </WidgetScrollArea>

            {selected ? (
              <WidgetModuleFrame
                className="superfan-card-widget__inspector"
                header={
                  <WidgetModuleHeader
                    icon={<MessageCircle />}
                    title={selected.author}
                    subtitle={`EVIDENCE SCORE ${selected.score.toFixed(1)} · ${selected.confidence.toUpperCase()} CONFIDENCE`}
                    controls={
                      <WidgetBadge height={18} status={confidenceStatus(selected.confidence)}>
                        {selected.commentCount} COMMENT{selected.commentCount === 1 ? "" : "S"}
                      </WidgetBadge>
                    }
                  />
                }
              >
                <div className="superfan-card-widget__signals">
                  {selected.signals.map((signal) => (
                    <WidgetBadge key={signal} height={18}>{signal}</WidgetBadge>
                  ))}
                </div>

                <div className="superfan-card-widget__evidence-note">
                  <strong>LATEST OBSERVED COMMENT</strong>
                  <p>{selected.evidence[0]?.text || "Comment text unavailable."}</p>
                  <span>
                    {selected.lastCommentAt
                      ? new Date(selected.lastCommentAt).toLocaleDateString()
                      : "DATE UNKNOWN"}
                    {selected.videoIds[0] ? ` · VIDEO ${selected.videoIds[0]}` : ""}
                  </span>
                </div>

                <div className="superfan-card-widget__actions">
                  <WidgetSizedButton
                    height={32}
                    tone="primary"
                    textFit="adaptive"
                    onClick={() => sendHandoff("comment-responder")}
                  >
                    <MessagesSquare aria-hidden="true" /> COMMENT RESPONDER
                  </WidgetSizedButton>
                  <WidgetSizedButton
                    height={32}
                    tone="default"
                    textFit="adaptive"
                    onClick={() => sendHandoff("ai-brain")}
                  >
                    <Brain aria-hidden="true" /> ASK BRAIN
                  </WidgetSizedButton>
                </div>
              </WidgetModuleFrame>
            ) : null}
          </div>
        )}
      </div>
    </WidgetShell>
  )
}
