import { getAuthenticatedViewtubeUserId } from "./account-auth.mjs";
import { consumeAiCredits, getAccountSnapshotData } from "./account-store.mjs";

export const LAYERED_REPORT_PROMPT_VERSION = "evidence-bound-channel-report-v2";
export const LAYERED_REPORT_SCHEMA_VERSION = "layered-channel-report-v2";

const SECTION_IDS = [
  "executive-summary",
  "algorithm-diagnosis",
  "strategy-engine",
  "sculpting-engine",
  "channel-pulse",
  "comparative-analysis",
  "keyword-matrix",
  "engagement-matrix",
  "retention-burnout",
  "revenue-dynamics",
  "risk-guardrails",
  "execution-queue",
];

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    executiveSummary: { type: "string" },
    executiveLayer: {
      type: "object",
      properties: {
        health: { type: "string", enum: ["strong", "mixed", "at-risk", "insufficient-evidence"] },
        strongestSignal: { type: "string" },
        criticalGap: { type: "string" },
        nextActions: { type: "array", items: { type: "string" } },
      },
      required: ["health", "strongestSignal", "criticalGap", "nextActions"],
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", enum: SECTION_IDS },
          title: { type: "string" },
          summary: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          actions: { type: "array", items: { type: "string" } },
          claims: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                statement: { type: "string" },
                classification: { type: "string", enum: ["fact", "observation", "inference", "hypothesis", "recommendation"] },
                evidenceIds: { type: "array", items: { type: "string" } },
                confidence: { type: "number" },
                uncertainty: { type: "string" },
              },
              required: ["id", "statement", "classification", "evidenceIds", "confidence"],
            },
          },
        },
        required: ["id", "title", "summary", "bullets", "actions", "claims"],
      },
    },
  },
  required: ["executiveSummary", "executiveLayer", "sections"],
};

const plain = (value, maximum = 256) => String(value || "").trim().slice(0, maximum);

const validateRequest = (payload) => {
  if (!payload || typeof payload !== "object") return "A JSON request body is required.";
  if (plain(payload.promptVersion) !== LAYERED_REPORT_PROMPT_VERSION) return "Unsupported prompt version.";
  if (plain(payload.schemaVersion) !== LAYERED_REPORT_SCHEMA_VERSION) return "Unsupported report schema version.";
  if (!plain(payload.channelId, 128) || !plain(payload.snapshotId, 256)) return "channelId and snapshotId are required.";
  if (payload.evidence?.version !== "channel-report-evidence-v2") return "Resolved evidence pack v2 is required.";
  if (payload.evidence.channelId !== payload.channelId || payload.evidence.snapshotId !== payload.snapshotId) return "Evidence identity does not match the request.";
  if (!Array.isArray(payload.evidence.datasets) || !Array.isArray(payload.evidence.facts)) return "Evidence manifest and facts are required.";
  if (payload.evidence.datasets.length !== 34) return "The complete 34-dataset manifest is required.";
  return "";
};

const promptFor = (payload) => {
  const repair = payload.repair && typeof payload.repair === "object";
  return [
    "You are ViewTube Brain's evidence-bound YouTube channel analyst.",
    "Return the requested structured report and nothing else.",
    "NON-NEGOTIABLE RULES:",
    "- Use only the supplied facts and evidence IDs for channel-specific or numeric claims.",
    "- Never invent benchmarks, keyword volume, competition, causal claims, forecasts, expected impact, or missing values.",
    "- Missing data must be described as missing, not zero.",
    "- FACT and OBSERVATION claims require at least one supplied evidence ID.",
    "- INFERENCE, HYPOTHESIS, and RECOMMENDATION must name uncertainty and remain non-numeric unless a supplied fact supports the number.",
    "- Keep Shorts and long-form findings separate whenever format evidence exists.",
    `- Return exactly one section for each ID in this order: ${SECTION_IDS.join(", ")}.`,
    "- The executive layer must state channel health, strongest supported signal, critical gap, and practical next actions.",
    payload.creatorIntent ? `CREATOR INTENT:\n${plain(payload.creatorIntent, 2_000)}` : "",
    payload.brainContext ? `ADVISORY BRAIN CONTEXT (not numeric evidence):\n${plain(payload.brainContext, 6_000)}` : "",
    `RESOLVED EVIDENCE PACK:\n${JSON.stringify({
      ...payload.evidence,
      evidenceIndex: Object.fromEntries(Object.entries(payload.evidence.evidenceIndex || {}).filter(([, entry]) => entry?.kind === "aggregate")),
    })}`,
    repair ? `REPAIR ERRORS:\n${JSON.stringify(payload.repair.errors || [])}` : "",
    repair ? `PREVIOUS OUTPUT TO REPAIR:\n${JSON.stringify(payload.repair.previousOutput || {})}` : "",
  ].filter(Boolean).join("\n\n");
};

const callGemini = async (payload) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "";
  if (!apiKey) {
    const error = new Error("Managed Gemini configuration is unavailable.");
    error.statusCode = 503;
    error.code = "AI_NOT_CONFIGURED";
    throw error;
  }
  const model = process.env.VIEWTUBE_GEMINI_REPORT_MODEL || "gemini-3.1-pro-preview";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: promptFor(payload) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
        temperature: 0.2,
        maxOutputTokens: 24_000,
      },
    }),
    signal: AbortSignal.timeout(55_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.error?.message || "Gemini report generation failed.");
    error.statusCode = response.status === 429 ? 429 : 502;
    error.code = response.status === 429 ? "AI_RATE_LIMITED" : "AI_UPSTREAM_UNAVAILABLE";
    throw error;
  }
  const text = body?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || "";
  if (!text) {
    const error = new Error("Gemini returned an empty report.");
    error.statusCode = 502;
    error.code = "AI_EMPTY_RESPONSE";
    throw error;
  }
  try {
    return { report: JSON.parse(text), model };
  } catch {
    const error = new Error("Gemini returned malformed structured output.");
    error.statusCode = 502;
    error.code = "AI_MALFORMED_OUTPUT";
    throw error;
  }
};

export const handleIntelligenceReportRoute = async ({ req, res, method, pathname, json, readBody }) => {
  if (method !== "POST" || pathname !== "/api/intelligence/channel-report") return false;
  const userId = await getAuthenticatedViewtubeUserId(req);
  if (!userId) return json(res, 401, { error: "Authentication required.", code: "AUTH_REQUIRED" }), true;
  const raw = await readBody(req, 2_500_000);
  let payload;
  try { payload = JSON.parse(raw.toString("utf8") || "{}"); }
  catch { return json(res, 400, { error: "Request body must be valid JSON.", code: "INVALID_JSON" }), true; }
  const issue = validateRequest(payload);
  if (issue) return json(res, 400, { error: issue, code: "INVALID_REPORT_REQUEST" }), true;

  const account = await getAccountSnapshotData(userId);
  const connectedChannelId = plain(account?.channelId, 128);
  if (connectedChannelId && connectedChannelId !== payload.channelId) {
    return json(res, 409, { error: "The report channel does not match the connected account.", code: "CHANNEL_SCOPE_MISMATCH" }), true;
  }

  const idempotencyKey = `intelligence-report:${plain(payload.generationId, 128)}:${payload.repair ? "repair" : "generate"}`;
  const credit = await consumeAiCredits(userId, {
    credits: 1,
    idempotencyKey,
    metadata: {
      operation: payload.repair ? "intelligence_report_repair" : "intelligence_report_generate",
      schemaVersion: payload.schemaVersion,
      promptVersion: payload.promptVersion,
    },
  });
  if (!credit.allowed) return json(res, 409, { error: "Insufficient AI credits.", code: "AI_CREDITS_EXHAUSTED" }), true;

  const startedAt = Date.now();
  try {
    const result = await callGemini(payload);
    return json(res, 200, {
      report: result.report,
      provider: "gemini",
      model: result.model,
      promptVersion: payload.promptVersion,
      schemaVersion: payload.schemaVersion,
      latencyMs: Date.now() - startedAt,
    }), true;
  } catch (error) {
    return json(res, Number(error?.statusCode) || 500, {
      error: error instanceof Error ? error.message : "Report generation failed.",
      code: error?.code || "AI_GENERATION_FAILED",
    }), true;
  }
};

