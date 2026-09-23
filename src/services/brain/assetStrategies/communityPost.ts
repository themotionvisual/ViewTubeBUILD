/**
 * Community posts — the first asset type through the governed path.
 *
 * Chosen as the vertical slice because it exercises every contract while risking least:
 * posts are short (style fidelity is measurable on them), frequent (outcome data arrives in
 * days rather than months), and low-stakes enough to review before publishing.
 *
 * Replaces `gemini.generateCommunityPosts`, which interpolated a schedule and an arbitrary
 * `channelData` string into a template, asked for markdown, and returned it unchecked.
 * Markdown is the specific thing that broke the loop downstream: an unparseable blob cannot
 * be scored, sent to a destination tool, or joined to the engagement it later earned.
 */

import { Type, type Schema } from "@google/genai"
import type { AssetGeneratorStrategy, AssetRequest, RubricFinding } from "../AssetGenerator"

export type CommunityPostKind = "text" | "poll" | "image_poll" | "question" | "video_teaser"

export interface CommunityPost {
 /** 1-based day within the requested window. */
 day: number
 kind: CommunityPostKind
 body: string
 /** Present for poll kinds. */
 pollOptions?: string[]
 /** What this post is meant to achieve, so a creator can judge it. */
 intent: string
}

export interface CommunityPostPlan {
 posts: CommunityPost[]
 /** Stated evidence gaps, surfaced to the creator rather than hidden. */
 notes: string[]
}

const schema: Schema = {
 type: Type.OBJECT,
 properties: {
  posts: {
   type: Type.ARRAY,
   items: {
    type: Type.OBJECT,
    properties: {
     day: { type: Type.NUMBER, description: "1-based day within the requested window." },
     kind: {
      type: Type.STRING,
      description: "One of: text, poll, image_poll, question, video_teaser.",
     },
     body: { type: Type.STRING, description: "The post copy, in the creator's voice." },
     pollOptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Two to four options. Only for poll or image_poll.",
     },
     intent: {
      type: Type.STRING,
      description: "What this post is for, in one short clause.",
     },
    },
    required: ["day", "kind", "body", "intent"],
   },
  },
  notes: {
   type: Type.ARRAY,
   items: { type: Type.STRING },
   description: "Anything you could not ground in the supplied evidence.",
  },
 },
 required: ["posts", "notes"],
}

const VALID_KINDS: CommunityPostKind[] = ["text", "poll", "image_poll", "question", "video_teaser"]

/** Default window when the caller does not specify one. */
export const DEFAULT_POST_DAYS = 7

const requestedDays = (request: AssetRequest): number => {
 const raw = Number(request.inputs?.days)
 return Number.isFinite(raw) && raw > 0 ? Math.min(30, Math.floor(raw)) : DEFAULT_POST_DAYS
}

export const communityPostStrategy: AssetGeneratorStrategy<CommunityPostPlan> = {
 assetType: "community_post",
 promptVersion: "community-post-v1",
 evidenceClasses: [
  "channel_profile",
  "top_videos",
  "recent_community_engagement",
  "upcoming_publishing_schedule",
 ],
 schema,

 buildTaskInstruction: (request, evidence) => {
  const days = requestedDays(request)
  const schedule = typeof request.inputs?.schedule === "string" ? request.inputs.schedule : ""
  return [
   `Write ${days} community posts, one per day, numbered 1 to ${days}.`,
   "Vary the kinds across the window: mix text posts, polls, audience questions and teasers. Do not send the same kind every day.",
   "Each post must stand on its own — a viewer scrolling past should get something without extra context.",
   "Tie posts to this channel's actual topics and upcoming content. Generic engagement bait is a failure.",
   schedule ? `Upcoming plans to build toward:\n${schedule}` : "",
   evidence.missing.length
    ? "Where the evidence is thin, write posts that do not depend on the missing data, and record the gap in notes."
    : "",
   "Poll options must be genuine alternatives a viewer would have an opinion about, not one obvious answer plus filler.",
  ].filter(Boolean).join("\n")
 },

 // Grade the post copy only. Intents and notes are internal rationale, not creator voice,
 // and including them would dilute the style measurement.
 toGradeableText: (output) => (output.posts || []).map((post) => post.body).join("\n\n"),

 rubric: (output, request) => {
  const findings: RubricFinding[] = []
  const posts = output.posts || []
  const days = requestedDays(request)

  if (posts.length !== days) {
   findings.push({
    rule: "post_count",
    detail: `Return exactly ${days} posts, one per day. Received ${posts.length}.`,
    severity: "blocking",
   })
  }

  const invalidKinds = posts.filter((post) => !VALID_KINDS.includes(post.kind))
  if (invalidKinds.length) {
   findings.push({
    rule: "post_kind",
    detail: `Use only these kinds: ${VALID_KINDS.join(", ")}.`,
    severity: "blocking",
   })
  }

  const emptyBodies = posts.filter((post) => !post.body?.trim())
  if (emptyBodies.length) {
   findings.push({
    rule: "post_body",
    detail: "Every post needs body copy.",
    severity: "blocking",
   })
  }

  for (const post of posts) {
   const isPoll = post.kind === "poll" || post.kind === "image_poll"
   const optionCount = post.pollOptions?.filter((option) => option.trim()).length || 0
   if (isPoll && (optionCount < 2 || optionCount > 4)) {
    findings.push({
     rule: "poll_options",
     detail: `Day ${post.day} is a ${post.kind} and needs two to four real options.`,
     severity: "blocking",
    })
   }
   if (!isPoll && optionCount > 0) {
    findings.push({
     rule: "poll_options",
     detail: `Day ${post.day} is a ${post.kind} and should not carry poll options.`,
     severity: "warning",
    })
   }
  }

  // A window of one repeated kind is the most common low-effort failure, and it reads as
  // obviously automated in a creator's community tab.
  const distinctKinds = new Set(posts.map((post) => post.kind))
  if (posts.length >= 4 && distinctKinds.size < 2) {
   findings.push({
    rule: "kind_variety",
    detail: "Vary the post kinds across the window instead of repeating one.",
    severity: "blocking",
   })
  }

  const duplicateBodies = posts.length - new Set(posts.map((post) => post.body?.trim())).size
  if (duplicateBodies > 0) {
   findings.push({
    rule: "duplicate_body",
    detail: "Each post must be distinct.",
    severity: "blocking",
   })
  }

  const missingIntent = posts.filter((post) => !post.intent?.trim())
  if (missingIntent.length) {
   findings.push({
    rule: "post_intent",
    detail: "State what each post is for.",
    severity: "warning",
   })
  }

  return findings
 },
}

/**
 * One post at a time — the shape the live widget actually uses.
 *
 * The plan strategy above covers "give me next week"; this covers the far more common
 * "write me this post", which previously went through `refineCommunityPost` and returned an
 * unchecked string. Same contracts, single output.
 */
export interface CommunitySinglePost {
 body: string
 pollOptions?: string[]
 intent: string
}

const singleSchema: Schema = {
 type: Type.OBJECT,
 properties: {
  body: { type: Type.STRING, description: "The post copy, in the creator's voice." },
  pollOptions: {
   type: Type.ARRAY,
   items: { type: Type.STRING },
   description: "Two to four options. Only when the post is a poll.",
  },
  intent: { type: Type.STRING, description: "What this post is for, in one short clause." },
 },
 required: ["body", "intent"],
}

export const communitySinglePostStrategy: AssetGeneratorStrategy<CommunitySinglePost> = {
 assetType: "community_post",
 promptVersion: "community-single-post-v1",
 evidenceClasses: ["channel_profile", "top_videos"],
 schema: singleSchema,

 buildTaskInstruction: (request) => {
  const postType = typeof request.inputs?.postType === "string" ? request.inputs.postType : "text"
  const mediaContext = typeof request.inputs?.mediaContext === "string" ? request.inputs.mediaContext : ""
  const isPoll = postType === "poll" || postType === "image_poll"
  return [
   `Write one ${postType} community post.`,
   "It must stand on its own and be specific to this channel's topics.",
   isPoll
    ? "Include two to four poll options that are genuine alternatives, not one obvious answer plus filler."
    : "Do not include poll options.",
   mediaContext,
   "Return the post itself. No preamble, no explanation, no surrounding quotes.",
  ].filter(Boolean).join("\n")
 },

 toGradeableText: (output) => output.body || "",

 rubric: (output, request) => {
  const findings: RubricFinding[] = []
  const postType = typeof request.inputs?.postType === "string" ? request.inputs.postType : "text"
  const isPoll = postType === "poll" || postType === "image_poll"
  const optionCount = output.pollOptions?.filter((option) => option.trim()).length || 0

  if (!output.body?.trim()) {
   findings.push({ rule: "post_body", detail: "The post needs body copy.", severity: "blocking" })
  }
  if (isPoll && (optionCount < 2 || optionCount > 4)) {
   findings.push({
    rule: "poll_options",
    detail: "A poll needs two to four real options.",
    severity: "blocking",
   })
  }
  if (!isPoll && optionCount > 0) {
   findings.push({
    rule: "poll_options",
    detail: "This is not a poll and should not carry poll options.",
    severity: "warning",
   })
  }
  // A model asked for "just the post" often still wraps it in quotes or a lead-in.
  if (/^(here'?s|here is|sure[,!]|certainly)/i.test(output.body?.trim() || "")) {
   findings.push({
    rule: "no_preamble",
    detail: "Remove the lead-in and return only the post copy.",
    severity: "blocking",
   })
  }
  return findings
 },
}
