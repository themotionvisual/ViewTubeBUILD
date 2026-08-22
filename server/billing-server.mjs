import http from "node:http";
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleCompressAnalysisRoute } from "./media-compression.mjs";
import { handleYouTubeAcquireRoute } from "./youtube-acquisition.mjs";
import { getReleaseMetadata } from "./release-metadata.mjs";
import { getAuthenticatedViewtubeUserId, handleAccountRoute } from "./account-auth.mjs";
import {
  appendAiCreditLedgerEntry,
  claimWebhookEvent,
  completeWebhookEvent,
  failWebhookEvent,
  findServerSubscriptionByStripeCustomerId,
  getServerSubscription,
  initAccountStore,
  setServerSubscription,
} from "./account-store.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, ".billing");
const ENTITLEMENTS_FILE = path.join(DATA_DIR, "entitlements.json");
const REFERRALS_FILE = path.join(DATA_DIR, "referrals.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

const PORT = Number(process.env.BILLING_PORT || 3000);
const BILLING_ORIGIN = process.env.BILLING_ORIGIN || "http://localhost:5173";
const STRIPE_API_BASE = process.env.STRIPE_API_BASE || "https://api.stripe.com/v1";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_TRIAL_HOURS = Number(process.env.STRIPE_TRIAL_HOURS || 48);
const ALLOW_LEGACY_BILLING_IDENTITY = process.env.ALLOW_LEGACY_BILLING_IDENTITY === "true";

const PRICE_MAP = {
  creator: process.env.STRIPE_PRICE_CREATOR || "",
  creator_plus: process.env.STRIPE_PRICE_CREATOR_PLUS || "",
  creator_pro: process.env.STRIPE_PRICE_CREATOR_PRO || "",
  executive: process.env.STRIPE_PRICE_EXECUTIVE || "",
};
const TOPUP_PRICE_MAP = {
  topup_5: process.env.STRIPE_PRICE_TOPUP_5 || "",
  topup_10: process.env.STRIPE_PRICE_TOPUP_10 || "",
  topup_25: process.env.STRIPE_PRICE_TOPUP_25 || "",
};
const PLAN_CREDITS = {
  basic: { monthly: 0, cap: 0, tier: "free" },
  creator: { monthly: 1000, cap: 2000, tier: "medium" },
  creator_plus: { monthly: 2000, cap: 4000, tier: "medium" },
  creator_pro: { monthly: 4000, cap: 8000, tier: "medium" },
  executive: { monthly: Number.POSITIVE_INFINITY, cap: Number.POSITIVE_INFINITY, tier: "large" },
};

const json = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": BILLING_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
};

const ensureDataFiles = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const target of [ENTITLEMENTS_FILE, REFERRALS_FILE, PROJECTS_FILE]) {
    try {
      await fs.access(target);
    } catch {
      await fs.writeFile(target, "{}", "utf8");
    }
  }
};

const readJson = async (file) => {
  await ensureDataFiles();
  const raw = await fs.readFile(file, "utf8");
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
};

const writeJson = async (file, payload) => {
  await ensureDataFiles();
  await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8");
};

const readBody = async (req, maxBytes = Number.POSITIVE_INFINITY) => {
  return new Promise((resolve, reject) => {
    const contentLength = Number(req.headers["content-length"] || 0);
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      reject(error);
      return;
    }
    const chunks = [];
    let size = 0;
    let rejected = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes && !rejected) {
        rejected = true;
        const error = new Error("Request body is too large.");
        error.statusCode = 413;
        reject(error);
        return;
      }
      if (!rejected) chunks.push(chunk);
    });
    req.on("error", reject);
    req.on("end", () => { if (!rejected) resolve(Buffer.concat(chunks)); });
  });
};

const parseJsonBody = async (req, res) => {
  const raw = await readBody(req);
  try {
    return JSON.parse(raw.toString("utf8") || "{}");
  } catch {
    json(res, 400, { error: "Invalid JSON body." });
    return null;
  }
};

const nowIso = () => new Date().toISOString();

const normalizeOwnerId = (value) => {
  const userId = String(value || "").trim().toLowerCase();
  return userId;
};

const readProjectsDb = async () => {
  const db = await readJson(PROJECTS_FILE);
  if (!db || typeof db !== "object") return { records: {} };
  if (!db.records || typeof db.records !== "object") return { records: {} };
  return { ...db, records: { ...db.records } };
};

const writeProjectsDb = async (db) => writeJson(PROJECTS_FILE, db);

const validateProjectPayload = (projectData) => {
  const errors = [];
  const warnings = [];
  const compositionMeta = projectData?.compositionMeta || {};
  const fps = Number(compositionMeta.fps);
  const width = Number(compositionMeta.compositionWidth ?? compositionMeta.width);
  const height = Number(compositionMeta.compositionHeight ?? compositionMeta.height);
  const durationInFrames = Number(compositionMeta.durationInFrames);
  const durationInSeconds = Number(compositionMeta.durationInSeconds);

  if (!projectData || typeof projectData !== "object") {
    errors.push("projectData is required.");
  }
  if (!Number.isFinite(fps) || fps <= 0) errors.push("compositionMeta.fps must be > 0.");
  if (!Number.isFinite(width) || width <= 0) errors.push("compositionMeta.width/compositionWidth must be > 0.");
  if (!Number.isFinite(height) || height <= 0) errors.push("compositionMeta.height/compositionHeight must be > 0.");
  if (!Number.isFinite(durationInFrames) || durationInFrames <= 0) errors.push("compositionMeta.durationInFrames must be > 0.");
  if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) warnings.push("compositionMeta.durationInSeconds should be > 0.");

  return { valid: errors.length === 0, errors, warnings };
};

const sanitizeSummary = (record) => ({
  projectId: record.projectId,
  ownerUserId: record.ownerUserId,
  name: record.name,
  status: record.status,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
  lastOpenedAt: record.lastOpenedAt || null,
  schemaVersion: record.schemaVersion,
  sourceEditor: record.sourceEditor,
  revision: record.revision || 1,
});

const createProjectRecord = ({
  ownerUserId,
  name,
  sourceEditor = "VT_E1",
  schemaVersion = "EditorProjectV3",
  editorVersion = "VT_E1",
  projectData,
  status = "draft",
}) => {
  const projectId = `proj_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const ts = nowIso();
  return {
    projectId,
    ownerUserId,
    name: String(name || "Untitled Project").slice(0, 120),
    status,
    createdAt: ts,
    updatedAt: ts,
    lastOpenedAt: ts,
    editorVersion,
    schemaVersion,
    sourceEditor,
    revision: 1,
    etag: crypto.createHash("sha1").update(`${projectId}:${ts}`).digest("hex"),
    projectData,
  };
};

const handleCreateProject = async (req, res, authenticatedUserId) => {
  const payload = await parseJsonBody(req, res);
  if (!payload) return;
  const ownerUserId = normalizeOwnerId(authenticatedUserId);
  if (!ownerUserId) return json(res, 401, { error: "Authentication required." });
  const projectData = payload.projectData;
  const validation = validateProjectPayload(projectData);
  if (!validation.valid) {
    return json(res, 400, { error: "PROJECT_VALIDATION_FAILED", validation });
  }
  const db = await readProjectsDb();
  const record = createProjectRecord({
    ownerUserId,
    name: payload.name,
    sourceEditor: payload.sourceEditor || "VT_E1",
    schemaVersion: payload.schemaVersion || "EditorProjectV3",
    editorVersion: payload.editorVersion || "VT_E1",
    projectData,
    status: payload.status || "draft",
  });
  db.records[record.projectId] = record;
  await writeProjectsDb(db);
  return json(res, 200, { project: record, validation });
};

const handleListProjects = async (req, res, userId) => {
  const ownerUserId = normalizeOwnerId(userId);
  const db = await readProjectsDb();
  const projects = Object.values(db.records || {})
    .filter((record) => normalizeOwnerId(record.ownerUserId) === ownerUserId)
    .sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0))
    .map(sanitizeSummary);
  return json(res, 200, { ownerUserId, projects });
};

const handleGetProject = async (req, res, projectId, userId) => {
  const ownerUserId = normalizeOwnerId(userId);
  const db = await readProjectsDb();
  const record = db.records?.[projectId];
  if (!record) return json(res, 404, { error: "PROJECT_NOT_FOUND" });
  if (normalizeOwnerId(record.ownerUserId) !== ownerUserId) return json(res, 403, { error: "PROJECT_FORBIDDEN" });
  record.lastOpenedAt = nowIso();
  db.records[projectId] = record;
  await writeProjectsDb(db);
  return json(res, 200, { project: record });
};

const handleUpdateProject = async (req, res, projectId, userId) => {
  const ownerUserId = normalizeOwnerId(userId);
  const payload = await parseJsonBody(req, res);
  if (!payload) return;
  const db = await readProjectsDb();
  const record = db.records?.[projectId];
  if (!record) return json(res, 404, { error: "PROJECT_NOT_FOUND" });
  if (normalizeOwnerId(record.ownerUserId) !== ownerUserId) return json(res, 403, { error: "PROJECT_FORBIDDEN" });

  const nextProjectData = payload.projectData || record.projectData;
  const validation = validateProjectPayload(nextProjectData);
  if (!validation.valid) {
    return json(res, 400, { error: "PROJECT_VALIDATION_FAILED", validation });
  }

  const ifMatch = String(req.headers["if-match"] || "").trim();
  if (ifMatch && String(record.etag || "") !== ifMatch) {
    return json(res, 409, {
      error: "PROJECT_CONFLICT",
      message: "Record revision differs from server copy.",
      server: sanitizeSummary(record),
    });
  }

  const updatedAt = nowIso();
  const revision = Number(record.revision || 1) + 1;
  const etag = crypto
    .createHash("sha1")
    .update(`${record.projectId}:${revision}:${updatedAt}`)
    .digest("hex");

  const next = {
    ...record,
    name: String(payload.name || record.name || "Untitled Project").slice(0, 120),
    status: payload.status || record.status || "saved",
    schemaVersion: payload.schemaVersion || record.schemaVersion || "EditorProjectV3",
    sourceEditor: payload.sourceEditor || record.sourceEditor || "VT_E1",
    editorVersion: payload.editorVersion || record.editorVersion || "VT_E1",
    updatedAt,
    revision,
    etag,
    projectData: nextProjectData,
  };

  db.records[projectId] = next;
  await writeProjectsDb(db);
  return json(res, 200, { project: next, validation });
};

const handleDuplicateProject = async (req, res, projectId, userId) => {
  const ownerUserId = normalizeOwnerId(userId);
  const payload = await parseJsonBody(req, res);
  if (!payload) return;
  const db = await readProjectsDb();
  const source = db.records?.[projectId];
  if (!source) return json(res, 404, { error: "PROJECT_NOT_FOUND" });
  if (normalizeOwnerId(source.ownerUserId) !== ownerUserId) return json(res, 403, { error: "PROJECT_FORBIDDEN" });

  const cloneData = JSON.parse(JSON.stringify(source.projectData || {}));
  const validation = validateProjectPayload(cloneData);
  if (!validation.valid) return json(res, 400, { error: "PROJECT_VALIDATION_FAILED", validation });

  const record = createProjectRecord({
    ownerUserId,
    name: payload.name || `${source.name || "Untitled Project"} (Copy)`,
    sourceEditor: source.sourceEditor || "VT_E1",
    schemaVersion: source.schemaVersion || "EditorProjectV3",
    editorVersion: source.editorVersion || "VT_E1",
    projectData: cloneData,
    status: "saved",
  });
  db.records[record.projectId] = record;
  await writeProjectsDb(db);
  return json(res, 200, { project: record, validation });
};

const normalizePlanId = (input) => {
  const planId = String(input || "creator_plus");
  if (Object.prototype.hasOwnProperty.call(PRICE_MAP, planId)) return planId;
  return "creator_plus";
};

const buildStripeFormBody = (entries) => {
  const form = new URLSearchParams();
  for (const [k, v] of entries) {
    if (v === undefined || v === null || v === "") continue;
    form.append(k, String(v));
  }
  return form.toString();
};

const createCheckoutSession = async ({
  planId,
  userId,
  successUrl,
  cancelUrl,
  referralCode,
  mode = "subscription",
  topupSku = "",
}) => {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  const normalizedPlan = normalizePlanId(planId);
  const isTopup = mode === "topup";
  const stripePrice = isTopup ? TOPUP_PRICE_MAP[topupSku] : PRICE_MAP[normalizedPlan];
  if (!stripePrice) {
    throw new Error(
      isTopup
        ? `Missing Stripe price env for top-up sku '${topupSku}'.`
        : `Missing Stripe price env for plan '${normalizedPlan}'.`,
    );
  }

  const shouldApplyTrial = !isTopup && normalizedPlan !== "starter" && STRIPE_TRIAL_HOURS > 0;
  // Stripe can reject an exact 48h boundary; keep trial_end safely beyond 2 days.
  const trialHours = Math.max(49, STRIPE_TRIAL_HOURS);
  const trialEndUnix = Math.floor(Date.now() / 1000) + trialHours * 60 * 60;

  const body = buildStripeFormBody([
    ["mode", isTopup ? "payment" : "subscription"],
    ["line_items[0][price]", stripePrice],
    ["line_items[0][quantity]", 1],
    ["success_url", successUrl],
    ["cancel_url", cancelUrl],
    ["allow_promotion_codes", true],
    ["automatic_tax[enabled]", true],
    ["subscription_data[trial_end]", shouldApplyTrial ? trialEndUnix : ""],
    ["subscription_data[metadata][userId]", isTopup ? "" : userId],
    ["subscription_data[metadata][planId]", isTopup ? "" : normalizedPlan],
    ["subscription_data[metadata][referralCode]", isTopup ? "" : referralCode || ""],
    ["client_reference_id", userId],
    ["metadata[mode]", isTopup ? "topup" : "subscription"],
    ["metadata[planId]", normalizedPlan],
    ["metadata[topupSku]", isTopup ? topupSku : ""],
    ["metadata[userId]", userId],
    ["metadata[referralCode]", referralCode || ""],
  ]);

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Stripe checkout session failed (${response.status}).`);
  }

  return {
    sessionId: data.id,
    checkoutUrl: data.url,
    provider: "stripe",
  };
};

const createBillingPortalSession = async ({ userId, returnUrl }) => {
  if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY.");
  const subscription = await getServerSubscription(userId);
  const customerId = subscription?.stripeCustomerId;
  if (!customerId) throw new Error("No Stripe customer is linked to this account.");
  const response = await fetch(`${STRIPE_API_BASE}/billing_portal/sessions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ customer: customerId, return_url: returnUrl }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Stripe portal session failed (${response.status}).`);
  return { portalUrl: data.url };
};

const parseStripeSignature = (headerValue) => {
  const parts = String(headerValue || "").split(",");
  const out = {};
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k && v) out[k.trim()] = v.trim();
  }
  return out;
};

const verifyStripeSignature = (rawBodyBuffer, signatureHeader) => {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  const { t, v1 } = parseStripeSignature(signatureHeader);
  if (!t || !v1) {
    return false;
  }

  const signedPayload = `${t}.${rawBodyBuffer.toString("utf8")}`;
  const expected = crypto
    .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(signedPayload, "utf8")
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const upsertEntitlementFromEvent = async (event) => {
  const object = event?.data?.object || {};
  const metadata = { ...(object.subscription_details?.metadata || {}), ...(object.metadata || {}) };
  const linkedSubscription = object.customer
    ? await findServerSubscriptionByStripeCustomerId(object.customer)
    : null;
  const userId = normalizeOwnerId(metadata.userId || object.client_reference_id || linkedSubscription?.viewtubeUserId);
  if (!userId) throw new Error("Stripe event is missing its ViewTube user id.");

  const entitlements = await readJson(ENTITLEMENTS_FILE);
  const current = entitlements[userId] || {
    userId,
    status: "inactive",
    planId: "starter",
    tier: "free",
    referralsConverted: 0,
    freeMonthsEarned: 0,
  };

  const resolveTier = (planId) => PLAN_CREDITS[planId]?.tier || "free";

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    if ((metadata.mode || "subscription") === "topup" && metadata.topupSku) {
      const topupCredits = metadata.topupSku === "topup_5" ? 8000 : metadata.topupSku === "topup_10" ? 18000 : 50000;
      entitlements[userId] = {
        ...current,
        creditBalance: Number(current.creditBalance || 0) + topupCredits,
        updatedAtIso: new Date().toISOString(),
      };
      await writeJson(ENTITLEMENTS_FILE, entitlements);
      await appendAiCreditLedgerEntry(userId, {
        entryType: "purchase",
        deltaCredits: topupCredits,
        idempotencyKey: event.id,
        metadata: { stripeEventType: event.type, topupSku: metadata.topupSku },
      });
      return;
    }
    const planId = normalizePlanId(metadata.planId || current.planId || "creator_plus");
    const planCredits = PLAN_CREDITS[planId] || PLAN_CREDITS.creator_plus;
    const prevBalance = Number(current.creditBalance || 0);
    const nextBalance = planCredits.monthly > 0 ? Math.min(planCredits.cap, prevBalance + planCredits.monthly) : 0;
    entitlements[userId] = {
      ...current,
      userId,
      status: "active",
      planId,
      tier: resolveTier(planId),
      creditBalance: nextBalance,
      monthlyCreditGrant: planCredits.monthly,
      rolloverCap: planCredits.cap,
      stripeCustomerId: object.customer || current.stripeCustomerId || null,
      stripeSubscriptionId: object.subscription || current.stripeSubscriptionId || null,
      updatedAtIso: new Date().toISOString(),
    };
    await setServerSubscription(userId, {
      status: "active",
      planId,
      stripeCustomerId: object.customer || current.stripeCustomerId || null,
      stripeSubscriptionId: object.subscription || current.stripeSubscriptionId || null,
    });
    if (planCredits.monthly > 0 && Number.isFinite(planCredits.monthly)) {
      await appendAiCreditLedgerEntry(userId, {
        entryType: "grant",
        deltaCredits: planCredits.monthly,
        idempotencyKey: event.id,
        metadata: { stripeEventType: event.type, planId },
      });
    }
  } else if (event.type === "invoice.payment_failed") {
    entitlements[userId] = {
      ...current,
      userId,
      status: "past_due",
      updatedAtIso: new Date().toISOString(),
    };
    await setServerSubscription(userId, {
      status: "past_due",
      planId: current.planId || "basic",
      stripeCustomerId: object.customer || current.stripeCustomerId || null,
      stripeSubscriptionId: object.subscription || current.stripeSubscriptionId || null,
    });
  } else if (event.type === "customer.subscription.deleted") {
    entitlements[userId] = {
      ...current,
      userId,
      status: "inactive",
      planId: "starter",
      tier: "free",
      creditBalance: 0,
      monthlyCreditGrant: 0,
      rolloverCap: 0,
      updatedAtIso: new Date().toISOString(),
    };
    await setServerSubscription(userId, {
      status: "inactive",
      planId: "basic",
      stripeCustomerId: object.customer || current.stripeCustomerId || null,
      stripeSubscriptionId: object.subscription || current.stripeSubscriptionId || null,
    });
  }

  await writeJson(ENTITLEMENTS_FILE, entitlements);

  if (event.type === "invoice.paid") {
    const referralCode = metadata.referralCode;
    if (referralCode) {
      const referrals = await readJson(REFERRALS_FILE);
      const currentRef = referrals[referralCode] || {
        referralCode,
        conversions: 0,
        freeMonthsEarned: 0,
      };
      referrals[referralCode] = {
        ...currentRef,
        conversions: Number(currentRef.conversions || 0) + 1,
        freeMonthsEarned: Number(currentRef.freeMonthsEarned || 0) + 1,
        updatedAtIso: new Date().toISOString(),
      };
      await writeJson(REFERRALS_FILE, referrals);
    }
  }
};

const handleWebhook = async (req, res) => {
  const bodyBuffer = await readBody(req);
  const signature = req.headers["stripe-signature"];

  if (!verifyStripeSignature(bodyBuffer, signature)) {
    return json(res, 400, { error: "Invalid Stripe signature." });
  }

  let event;
  try {
    event = JSON.parse(bodyBuffer.toString("utf8"));
  } catch {
    return json(res, 400, { error: "Invalid JSON payload." });
  }

  if (!event?.id) {
    return json(res, 400, { error: "Missing Stripe event id." });
  }

  if (!(await claimWebhookEvent(event.id, event.type || "unknown"))) {
    return json(res, 200, { received: true, duplicate: true });
  }

  try {
    await upsertEntitlementFromEvent(event);
    await completeWebhookEvent(event.id);
  } catch (error) {
    await failWebhookEvent(event.id, error instanceof Error ? error.message : String(error));
    throw error;
  }

  return json(res, 200, { received: true, eventType: event.type });
};

const handleCheckout = async (req, res) => {
  const requestOrigin = String(req.headers.origin || "").trim();
  if (requestOrigin && requestOrigin !== BILLING_ORIGIN) {
    return json(res, 403, { error: "Request origin is not allowed." });
  }
  const raw = await readBody(req);
  let payload;
  try {
    payload = JSON.parse(raw.toString("utf8") || "{}");
  } catch {
    return json(res, 400, { error: "Invalid JSON body." });
  }

  const { planId, successUrl, cancelUrl, referralCode, mode, topupSku } = payload || {};
  if (!planId || !successUrl || !cancelUrl) {
    return json(res, 400, { error: "Missing required fields: planId, successUrl, cancelUrl." });
  }

  const userId = await getAuthenticatedViewtubeUserId(req);
  if (!userId) return json(res, 401, { error: "Authentication required for billing." });

  const allowedOrigin = BILLING_ORIGIN === "*" ? String(process.env.ACCOUNT_PUBLIC_ORIGIN || "http://localhost:5173") : BILLING_ORIGIN;
  for (const candidate of [successUrl, cancelUrl]) {
    try {
      if (new URL(candidate).origin !== new URL(allowedOrigin).origin) {
        return json(res, 400, { error: "Checkout return URL is not allowed." });
      }
    } catch {
      return json(res, 400, { error: "Checkout return URL is invalid." });
    }
  }

  try {
    const session = await createCheckoutSession({
      planId,
      userId,
      successUrl,
      cancelUrl,
      referralCode,
      mode,
      topupSku,
    });
    return json(res, 200, session);
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
};

const handleGetEntitlement = async (req, res, userId) => {
  const entitlements = await readJson(ENTITLEMENTS_FILE);
  return json(res, 200, {
    userId,
    entitlement: entitlements[userId] || null,
  });
};

const handlePortalSession = async (req, res) => {
  const requestOrigin = String(req.headers.origin || "").trim();
  if (requestOrigin && requestOrigin !== BILLING_ORIGIN) return json(res, 403, { error: "Request origin is not allowed." });
  const userId = await getAuthenticatedViewtubeUserId(req);
  if (!userId) return json(res, 401, { error: "Authentication required for billing." });
  const payload = await parseJsonBody(req, res);
  if (!payload) return;
  try {
    if (new URL(payload.returnUrl).origin !== new URL(BILLING_ORIGIN).origin) return json(res, 400, { error: "Portal return URL is not allowed." });
    return json(res, 200, await createBillingPortalSession({ userId, returnUrl: payload.returnUrl }));
  } catch (error) {
    return json(res, 400, { error: error instanceof Error ? error.message : String(error) });
  }
};

const server = http.createServer(async (req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";
  
  console.log(`[billing] INCOMING: ${method} ${pathname}`);

  try {
    if (method === "OPTIONS") {
      console.log(`[billing] Matched: OPTIONS`);
      res.writeHead(204, {
        "Access-Control-Allow-Origin": BILLING_ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
        "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        "Access-Control-Allow-Credentials": "true",
      });
      return res.end();
    }

    if (await handleAccountRoute({ req, res, method, pathname, parsedUrl, json, readBody })) {
      return;
    }

    if (method === "GET" && pathname === "/api/release") {
      return json(res, 200, getReleaseMetadata());
    }

    if (method === "GET" && pathname === "/api/projects") {
      const userId = await getAuthenticatedViewtubeUserId(req);
      if (!userId) return json(res, 401, { error: "Authentication required." });
      return await handleListProjects(req, res, userId);
    }

    if (method === "POST" && pathname === "/api/projects") {
      const userId = await getAuthenticatedViewtubeUserId(req);
      if (!userId) return json(res, 401, { error: "Authentication required." });
      return await handleCreateProject(req, res, userId);
    }

    if (method === "POST" && pathname === "/api/media/compress-analysis") {
      return await handleCompressAnalysisRoute(req, res);
    }

    if (method === "POST" && pathname === "/api/youtube/acquire") {
      return await handleYouTubeAcquireRoute(req, res);
    }

    if (pathname.startsWith("/api/projects/")) {
      const parts = pathname.split("/").filter(Boolean);
      const projectId = parts[2];
      const suffix = parts[3] || "";
      const userId = await getAuthenticatedViewtubeUserId(req);
      if (!userId) return json(res, 401, { error: "Authentication required." });

      if (!projectId) return json(res, 400, { error: "PROJECT_ID_REQUIRED" });

      if (method === "GET" && !suffix) return await handleGetProject(req, res, projectId, userId);
      if (method === "PUT" && !suffix) return await handleUpdateProject(req, res, projectId, userId);
      if (method === "POST" && suffix === "duplicate") return await handleDuplicateProject(req, res, projectId, userId);
    }

    if (method === "POST" && pathname === "/billing/checkout-session") {
      console.log(`[billing] Matched: POST /billing/checkout-session`);
      return await handleCheckout(req, res);
    }

    if (method === "POST" && pathname === "/billing/webhook") {
      console.log(`[billing] Matched: POST /billing/webhook`);
      return await handleWebhook(req, res);
    }

    if (method === "POST" && pathname === "/billing/portal-session") {
      return await handlePortalSession(req, res);
    }

    if (method === "GET" && pathname === "/billing/entitlement") {
      const userId = await getAuthenticatedViewtubeUserId(req);
      if (!userId) return json(res, 401, { error: "Authentication required for billing." });
      return await handleGetEntitlement(req, res, userId);
    }

    if (ALLOW_LEGACY_BILLING_IDENTITY && method === "GET" && pathname.startsWith("/billing/entitlement/")) {
      const userId = normalizeOwnerId(decodeURIComponent(pathname.split("/").pop() || ""));
      if (!userId) return json(res, 400, { error: "User id is required." });
      return await handleGetEntitlement(req, res, userId);
    }

    if (method === "GET" && pathname === "/") {
      console.log(`[billing] Matched: GET /`);
      return json(res, 200, {
        ok: true,
        service: "viewtubeX-billing-server",
        hint: "Use /billing/checkout-session, /billing/webhook, or /billing/entitlement/:userId",
      });
    }

    console.log(`[billing] NO MATCH FOUND for ${method} ${pathname}`);
    return json(res, 404, { error: `Not found: ${method} ${pathname}` });
  } catch (error) {
    console.error(`[billing] INTERNAL ERROR:`, error);
    return json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, async () => {
  await initAccountStore();
  await ensureDataFiles();
  console.log(`[billing] listening on http://localhost:${PORT}`);
});
