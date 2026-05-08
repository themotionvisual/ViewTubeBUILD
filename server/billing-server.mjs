import http from "node:http";
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, ".billing");
const ENTITLEMENTS_FILE = path.join(DATA_DIR, "entitlements.json");
const IDEMPOTENCY_FILE = path.join(DATA_DIR, "idempotency.json");
const REFERRALS_FILE = path.join(DATA_DIR, "referrals.json");

const PORT = Number(process.env.BILLING_PORT || 3000);
const BILLING_ORIGIN = process.env.BILLING_ORIGIN || "*";
const STRIPE_API_BASE = process.env.STRIPE_API_BASE || "https://api.stripe.com/v1";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_TRIAL_HOURS = Number(process.env.STRIPE_TRIAL_HOURS || 48);

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
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
};

const ensureDataFiles = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const target of [ENTITLEMENTS_FILE, IDEMPOTENCY_FILE, REFERRALS_FILE]) {
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

const readBody = async (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
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
  const trialEndUnix = Math.floor(Date.now() / 1000) + Math.max(1, STRIPE_TRIAL_HOURS) * 60 * 60;

  const body = buildStripeFormBody([
    ["mode", isTopup ? "payment" : "subscription"],
    ["line_items[0][price]", stripePrice],
    ["line_items[0][quantity]", 1],
    ["success_url", successUrl],
    ["cancel_url", cancelUrl],
    ["allow_promotion_codes", true],
    ["automatic_tax[enabled]", true],
    ["subscription_data[trial_end]", shouldApplyTrial ? trialEndUnix : ""],
    ["client_reference_id", userId || "local-user"],
    ["metadata[mode]", isTopup ? "topup" : "subscription"],
    ["metadata[planId]", normalizedPlan],
    ["metadata[topupSku]", isTopup ? topupSku : ""],
    ["metadata[userId]", userId || "local-user"],
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
  const metadata = object.metadata || {};
  const userId = metadata.userId || object.client_reference_id || "local-user";

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
  } else if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
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

const markEventProcessed = async (eventId) => {
  const ledger = await readJson(IDEMPOTENCY_FILE);
  ledger[eventId] = { processedAtIso: new Date().toISOString() };
  await writeJson(IDEMPOTENCY_FILE, ledger);
};

const isEventProcessed = async (eventId) => {
  const ledger = await readJson(IDEMPOTENCY_FILE);
  return Boolean(ledger[eventId]);
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

  if (await isEventProcessed(event.id)) {
    return json(res, 200, { received: true, duplicate: true });
  }

  await upsertEntitlementFromEvent(event);
  await markEventProcessed(event.id);

  return json(res, 200, { received: true, eventType: event.type });
};

const handleCheckout = async (req, res) => {
  const raw = await readBody(req);
  let payload;
  try {
    payload = JSON.parse(raw.toString("utf8") || "{}");
  } catch {
    return json(res, 400, { error: "Invalid JSON body." });
  }

  const { planId, userId, successUrl, cancelUrl, referralCode, mode, topupSku } = payload || {};
  if (!planId || !successUrl || !cancelUrl) {
    return json(res, 400, { error: "Missing required fields: planId, successUrl, cancelUrl." });
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

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": BILLING_ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      });
      return res.end();
    }

    if (req.method === "POST" && req.url === "/billing/checkout-session") {
      return await handleCheckout(req, res);
    }

    if (req.method === "POST" && req.url === "/billing/webhook") {
      return await handleWebhook(req, res);
    }

    if (req.method === "GET" && req.url?.startsWith("/billing/entitlement/")) {
      const userId = decodeURIComponent(req.url.split("/").pop() || "");
      return await handleGetEntitlement(req, res, userId);
    }

    if (req.method === "GET" && req.url === "/") {
      return json(res, 200, {
        ok: true,
        service: "viewtubeX-billing-server",
        hint: "Use /billing/checkout-session, /billing/webhook, or /billing/entitlement/:userId",
      });
    }

    return json(res, 404, { error: "Not found." });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, async () => {
  await ensureDataFiles();
  console.log(`[billing] listening on http://localhost:${PORT}`);
});
