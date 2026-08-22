import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, ".account");
const ACCOUNT_FILE = path.join(DATA_DIR, "account-store.json");

const DATABASE_URL = String(process.env.DATABASE_URL || "").trim();
const NODE_ENV = String(process.env.NODE_ENV || "development");
const SESSION_TTL_MS = Math.max(15 * 60 * 1000, Number(process.env.ACCOUNT_SESSION_TTL_MS || 30 * 24 * 60 * 60 * 1000));

export const withVerifiedPostgresSslMode = (connectionString) => {
  const value = String(connectionString || "").trim();
  if (!value || process.env.DATABASE_SSL === "false") return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") return value;
    parsed.searchParams.set("sslmode", "verify-full");
    return parsed.toString();
  } catch {
    return value;
  }
};

const emptyFileDb = () => ({
  users: {}, googleIdentities: {}, sessions: {}, oauthStates: {},
  onboarding: {}, subscriptions: {}, aiLedger: [], webhookEvents: {},
});

let fileWriteQueue = Promise.resolve();
let pool = null;
let initialized = false;

const schemaSql = `
CREATE TABLE IF NOT EXISTS viewtube_users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL, display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS viewtube_users_email_key ON viewtube_users (LOWER(email));
CREATE TABLE IF NOT EXISTS viewtube_google_identities (
  google_subject TEXT PRIMARY KEY,
  viewtube_user_id TEXT NOT NULL REFERENCES viewtube_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, access_token_ciphertext TEXT, refresh_token_ciphertext TEXT,
  token_expires_at TIMESTAMPTZ, scopes TEXT[] NOT NULL DEFAULT '{}',
  channel_id TEXT, channel_title TEXT, channel_handle TEXT, channel_thumbnail TEXT,
  content_owners JSONB NOT NULL DEFAULT '[]', active_content_owner_id TEXT,
  connection_status TEXT NOT NULL DEFAULT 'disconnected', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE viewtube_google_identities ADD COLUMN IF NOT EXISTS content_owners JSONB NOT NULL DEFAULT '[]';
ALTER TABLE viewtube_google_identities ADD COLUMN IF NOT EXISTS active_content_owner_id TEXT;
CREATE TABLE IF NOT EXISTS viewtube_sessions (
  token_hash TEXT PRIMARY KEY,
  viewtube_user_id TEXT NOT NULL REFERENCES viewtube_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS viewtube_oauth_states (
  state_hash TEXT PRIMARY KEY, code_verifier TEXT NOT NULL, nonce TEXT NOT NULL,
  intent TEXT NOT NULL, return_to TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS viewtube_onboarding (
  viewtube_user_id TEXT PRIMARY KEY REFERENCES viewtube_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', next_step TEXT,
  context JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS viewtube_subscriptions (
  viewtube_user_id TEXT PRIMARY KEY REFERENCES viewtube_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive', plan_id TEXT, stripe_customer_id TEXT,
  stripe_subscription_id TEXT, last_verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS viewtube_ai_credit_ledger (
  id TEXT PRIMARY KEY, viewtube_user_id TEXT NOT NULL REFERENCES viewtube_users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL, delta_credits BIGINT NOT NULL, idempotency_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS viewtube_ai_credit_idempotency_key
  ON viewtube_ai_credit_ledger(viewtube_user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE TABLE IF NOT EXISTS viewtube_webhook_events (
  event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'processing',
  last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const nowIso = () => new Date().toISOString();
const newUserId = () => `vtu_${crypto.randomUUID().replace(/-/g, "")}`;

const ensureFileDb = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(ACCOUNT_FILE); }
  catch { await fs.writeFile(ACCOUNT_FILE, JSON.stringify(emptyFileDb(), null, 2), "utf8"); }
};

const readFileDb = async () => {
  await ensureFileDb();
  try { return { ...emptyFileDb(), ...JSON.parse(await fs.readFile(ACCOUNT_FILE, "utf8")) }; }
  catch { return emptyFileDb(); }
};

const updateFileDb = async (mutator) => {
  const operation = fileWriteQueue.then(async () => {
    const db = await readFileDb();
    const result = await mutator(db);
    await fs.writeFile(ACCOUNT_FILE, JSON.stringify(db, null, 2), "utf8");
    return result;
  });
  fileWriteQueue = operation.catch(() => undefined);
  return operation;
};

export const initAccountStore = async () => {
  if (initialized) return;
  if (!DATABASE_URL) {
    if (NODE_ENV === "production") throw new Error("DATABASE_URL is required for production account storage.");
    await ensureFileDb();
    initialized = true;
    return;
  }
  const candidatePool = new Pool({
    connectionString: withVerifiedPostgresSslMode(DATABASE_URL),
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" },
    max: Math.max(2, Number(process.env.DATABASE_POOL_SIZE || 8)),
  });
  try {
    await candidatePool.query(schemaSql);
    pool = candidatePool;
    initialized = true;
  } catch (error) {
    await candidatePool.end().catch(() => undefined);
    throw error;
  }
};

const usePostgres = () => Boolean(pool);

export const saveOAuthState = async ({ state, codeVerifier, nonce, intent, returnTo, expiresAt }) => {
  await initAccountStore();
  const stateHash = sha256(state);
  if (usePostgres()) {
    await pool.query(
      `INSERT INTO viewtube_oauth_states(state_hash,code_verifier,nonce,intent,return_to,expires_at)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT (state_hash) DO UPDATE SET code_verifier=EXCLUDED.code_verifier,nonce=EXCLUDED.nonce,
       intent=EXCLUDED.intent,return_to=EXCLUDED.return_to,expires_at=EXCLUDED.expires_at`,
      [stateHash, codeVerifier, nonce, intent, returnTo, expiresAt],
    );
    return;
  }
  await updateFileDb((db) => { db.oauthStates[stateHash] = { codeVerifier, nonce, intent, returnTo, expiresAt, createdAt: nowIso() }; });
};

export const consumeOAuthState = async (state) => {
  await initAccountStore();
  const stateHash = sha256(state);
  if (usePostgres()) {
    const result = await pool.query(
      `DELETE FROM viewtube_oauth_states WHERE state_hash=$1 RETURNING code_verifier,nonce,intent,return_to,expires_at`,
      [stateHash],
    );
    if (!result.rowCount) return null;
    const row = result.rows[0];
    if (new Date(row.expires_at).getTime() <= Date.now()) return null;
    return { codeVerifier: row.code_verifier, nonce: row.nonce, intent: row.intent, returnTo: row.return_to };
  }
  return updateFileDb((db) => {
    const row = db.oauthStates[stateHash] || null;
    delete db.oauthStates[stateHash];
    if (!row || Date.parse(row.expiresAt) <= Date.now()) return null;
    return row;
  });
};

export const resolveGoogleAccount = async ({ googleSubject, email, displayName, intent }) => {
  await initAccountStore();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (usePostgres()) {
    const existing = await pool.query(
      `SELECT u.id FROM viewtube_google_identities g JOIN viewtube_users u ON u.id=g.viewtube_user_id WHERE g.google_subject=$1`,
      [googleSubject],
    );
    if (!existing.rowCount && intent === "log_in") return null;
    const userId = existing.rows[0]?.id || newUserId();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO viewtube_users(id,email,display_name) VALUES($1,$2,$3)
         ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email,display_name=EXCLUDED.display_name,updated_at=NOW()`,
        [userId, normalizedEmail, displayName || null],
      );
      await client.query(
        `INSERT INTO viewtube_google_identities(google_subject,viewtube_user_id,email) VALUES($1,$2,$3)
         ON CONFLICT (google_subject) DO UPDATE SET email=EXCLUDED.email,updated_at=NOW()`,
        [googleSubject, userId, normalizedEmail],
      );
      await client.query(`INSERT INTO viewtube_onboarding(viewtube_user_id) VALUES($1) ON CONFLICT DO NOTHING`, [userId]);
      await client.query(`INSERT INTO viewtube_subscriptions(viewtube_user_id) VALUES($1) ON CONFLICT DO NOTHING`, [userId]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
    return userId;
  }
  return updateFileDb((db) => {
    const existingIdentity = db.googleIdentities[googleSubject];
    if (!existingIdentity && intent === "log_in") return null;
    const userId = existingIdentity?.viewtubeUserId || newUserId();
    db.users[userId] = {
      ...(db.users[userId] || {}), id: userId, email: normalizedEmail,
      displayName: displayName || null, createdAt: db.users[userId]?.createdAt || nowIso(), updatedAt: nowIso(),
    };
    db.googleIdentities[googleSubject] = {
      ...(existingIdentity || {}), googleSubject, viewtubeUserId: userId, email: normalizedEmail,
      connectionStatus: existingIdentity?.connectionStatus || "disconnected",
      scopes: existingIdentity?.scopes || [], updatedAt: nowIso(),
    };
    db.onboarding[userId] ||= { status: "not_started", nextStep: null, context: {}, updatedAt: nowIso() };
    db.subscriptions[userId] ||= { status: "inactive", planId: null, updatedAt: nowIso() };
    return userId;
  });
};

export const saveGoogleConnection = async (userId, googleSubject, input) => {
  await initAccountStore();
  if (usePostgres()) {
    await pool.query(
      `UPDATE viewtube_google_identities SET access_token_ciphertext=$1,
       refresh_token_ciphertext=COALESCE($2,refresh_token_ciphertext),token_expires_at=$3,scopes=$4,
       channel_id=COALESCE($5,channel_id),channel_title=COALESCE($6,channel_title),
       channel_handle=COALESCE($7,channel_handle),channel_thumbnail=COALESCE($8,channel_thumbnail),
       content_owners=COALESCE($9,content_owners),
       active_content_owner_id=CASE WHEN $14 THEN $10 ELSE active_content_owner_id END,
       connection_status=$11,updated_at=NOW() WHERE google_subject=$12 AND viewtube_user_id=$13`,
      [input.accessTokenCiphertext || null, input.refreshTokenCiphertext || null, input.tokenExpiresAt || null,
       input.scopes || [], input.channelId || null, input.channelTitle || null, input.channelHandle || null,
       input.channelThumbnail || null, input.contentOwners ? JSON.stringify(input.contentOwners) : null,
       input.activeContentOwnerId ?? null, input.connectionStatus || "connected", googleSubject, userId,
       Object.prototype.hasOwnProperty.call(input, "activeContentOwnerId")],
    );
    return;
  }
  await updateFileDb((db) => {
    const identity = db.googleIdentities[googleSubject];
    if (!identity || identity.viewtubeUserId !== userId) throw new Error("Google identity mismatch.");
    db.googleIdentities[googleSubject] = {
      ...identity, ...input,
      refreshTokenCiphertext: input.refreshTokenCiphertext || identity.refreshTokenCiphertext || null,
      updatedAt: nowIso(),
    };
  });
};

export const selectGoogleContentOwner = async (userId, ownerId) => {
  await initAccountStore();
  const normalized = String(ownerId || "").trim();
  if (usePostgres()) {
    const result = await pool.query(
      `UPDATE viewtube_google_identities SET active_content_owner_id=$1,updated_at=NOW()
       WHERE viewtube_user_id=$2 AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(content_owners) owner WHERE owner->>'id'=$1
       ) RETURNING active_content_owner_id`,
      [normalized, userId],
    );
    return result.rowCount ? result.rows[0].active_content_owner_id : null;
  }
  return updateFileDb((db) => {
    const identity = Object.values(db.googleIdentities).find((item) => item.viewtubeUserId === userId);
    if (!identity || !(identity.contentOwners || []).some((owner) => owner.id === normalized)) return null;
    identity.activeContentOwnerId = normalized;
    identity.updatedAt = nowIso();
    return normalized;
  });
};

export const getGoogleCredentialRecord = async (userId) => {
  await initAccountStore();
  if (usePostgres()) {
    const result = await pool.query(
      `SELECT google_subject,access_token_ciphertext,refresh_token_ciphertext,token_expires_at,scopes,connection_status
       FROM viewtube_google_identities WHERE viewtube_user_id=$1 LIMIT 1`, [userId],
    );
    if (!result.rowCount) return null;
    const row = result.rows[0];
    return { googleSubject: row.google_subject, accessTokenCiphertext: row.access_token_ciphertext,
      refreshTokenCiphertext: row.refresh_token_ciphertext,
      tokenExpiresAt: row.token_expires_at ? new Date(row.token_expires_at).toISOString() : null,
      scopes: row.scopes || [], connectionStatus: row.connection_status || "disconnected" };
  }
  const db = await readFileDb();
  return Object.values(db.googleIdentities).find((item) => item.viewtubeUserId === userId) || null;
};

export const markGoogleConnectionExpired = async (userId) => {
  await initAccountStore();
  if (usePostgres()) {
    await pool.query(
      `UPDATE viewtube_google_identities SET access_token_ciphertext=NULL,refresh_token_ciphertext=NULL,
       token_expires_at=NULL,connection_status='expired',updated_at=NOW() WHERE viewtube_user_id=$1`, [userId],
    );
  } else {
    await updateFileDb((db) => {
      const entry = Object.values(db.googleIdentities).find((item) => item.viewtubeUserId === userId);
      if (!entry) return;
      entry.accessTokenCiphertext = null;
      entry.refreshTokenCiphertext = null;
      entry.tokenExpiresAt = null;
      entry.connectionStatus = "expired";
      entry.updatedAt = nowIso();
    });
  }
};

export const markGoogleConnectionRevoked = async (userId) => {
  await initAccountStore();
  if (usePostgres()) {
    await pool.query(
      `UPDATE viewtube_google_identities SET access_token_ciphertext=NULL,refresh_token_ciphertext=NULL,
       token_expires_at=NULL,connection_status='revoked',updated_at=NOW() WHERE viewtube_user_id=$1`, [userId],
    );
  } else {
    await updateFileDb((db) => {
      const entry = Object.values(db.googleIdentities).find((item) => item.viewtubeUserId === userId);
      if (!entry) return;
      entry.accessTokenCiphertext = null;
      entry.refreshTokenCiphertext = null;
      entry.tokenExpiresAt = null;
      entry.connectionStatus = "revoked";
      entry.updatedAt = nowIso();
    });
  }
};

export const createAccountSession = async (userId) => {
  await initAccountStore();
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  if (usePostgres()) {
    await pool.query(`INSERT INTO viewtube_sessions(token_hash,viewtube_user_id,expires_at) VALUES($1,$2,$3)`, [tokenHash, userId, expiresAt]);
  } else {
    await updateFileDb((db) => { db.sessions[tokenHash] = { viewtubeUserId: userId, createdAt: nowIso(), expiresAt, revokedAt: null }; });
  }
  return { token, expiresAt };
};

export const getSessionUserId = async (token) => {
  await initAccountStore();
  if (!token) return null;
  const tokenHash = sha256(token);
  if (usePostgres()) {
    const result = await pool.query(
      `SELECT viewtube_user_id FROM viewtube_sessions WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>NOW()`, [tokenHash],
    );
    return result.rows[0]?.viewtube_user_id || null;
  }
  const db = await readFileDb();
  const row = db.sessions[tokenHash];
  if (!row || row.revokedAt || Date.parse(row.expiresAt) <= Date.now()) return null;
  return row.viewtubeUserId;
};

export const revokeAccountSession = async (token) => {
  await initAccountStore();
  if (!token) return;
  const tokenHash = sha256(token);
  if (usePostgres()) await pool.query(`UPDATE viewtube_sessions SET revoked_at=NOW() WHERE token_hash=$1`, [tokenHash]);
  else await updateFileDb((db) => { if (db.sessions[tokenHash]) db.sessions[tokenHash].revokedAt = nowIso(); });
};

export const deleteAccountRecord = async (userId) => {
  await initAccountStore();
  if (usePostgres()) {
    const subscription = await pool.query(
      `SELECT status FROM viewtube_subscriptions WHERE viewtube_user_id=$1 LIMIT 1`,
      [userId],
    );
    if (["active", "trialing", "past_due"].includes(subscription.rows[0]?.status)) {
      return { deleted: false, reason: "active_billing" };
    }
    const result = await pool.query(`DELETE FROM viewtube_users WHERE id=$1`, [userId]);
    return { deleted: result.rowCount > 0, reason: result.rowCount ? null : "not_found" };
  }
  return updateFileDb((db) => {
    if (!db.users[userId]) return { deleted: false, reason: "not_found" };
    if (["active", "trialing", "past_due"].includes(db.subscriptions[userId]?.status)) {
      return { deleted: false, reason: "active_billing" };
    }
    delete db.users[userId];
    delete db.onboarding[userId];
    delete db.subscriptions[userId];
    for (const [subject, identity] of Object.entries(db.googleIdentities)) {
      if (identity.viewtubeUserId === userId) delete db.googleIdentities[subject];
    }
    for (const [tokenHash, session] of Object.entries(db.sessions)) {
      if (session.viewtubeUserId === userId) delete db.sessions[tokenHash];
    }
    db.aiLedger = db.aiLedger.filter((entry) => entry.viewtubeUserId !== userId);
    return { deleted: true, reason: null };
  });
};

export const updateOnboarding = async (userId, { status, nextStep, context = null }) => {
  await initAccountStore();
  if (usePostgres()) {
    await pool.query(
      `INSERT INTO viewtube_onboarding(viewtube_user_id,status,next_step,context) VALUES($1,$2,$3,$4::jsonb)
       ON CONFLICT (viewtube_user_id) DO UPDATE SET status=EXCLUDED.status,next_step=EXCLUDED.next_step,
       context=CASE WHEN $5 THEN viewtube_onboarding.context || EXCLUDED.context ELSE viewtube_onboarding.context END,updated_at=NOW()`,
      [userId, status, nextStep || null, JSON.stringify(context || {}), context !== null],
    );
  } else {
    await updateFileDb((db) => {
      const previous = db.onboarding[userId] || { context: {} };
      db.onboarding[userId] = { ...previous, status, nextStep: nextStep || null,
        context: context === null ? previous.context || {} : { ...(previous.context || {}), ...context }, updatedAt: nowIso() };
    });
  }
};

export const setServerSubscription = async (userId, input) => {
  await initAccountStore();
  if (usePostgres()) {
    await pool.query(
      `INSERT INTO viewtube_subscriptions(viewtube_user_id,status,plan_id,stripe_customer_id,stripe_subscription_id,last_verified_at)
       VALUES($1,$2,$3,$4,$5,NOW())
       ON CONFLICT (viewtube_user_id) DO UPDATE SET status=EXCLUDED.status,plan_id=EXCLUDED.plan_id,
       stripe_customer_id=COALESCE(EXCLUDED.stripe_customer_id,viewtube_subscriptions.stripe_customer_id),
       stripe_subscription_id=COALESCE(EXCLUDED.stripe_subscription_id,viewtube_subscriptions.stripe_subscription_id),
       last_verified_at=NOW(),updated_at=NOW()`,
      [userId, input.status, input.planId || null, input.stripeCustomerId || null, input.stripeSubscriptionId || null],
    );
  } else {
    await updateFileDb((db) => { db.subscriptions[userId] = { ...(db.subscriptions[userId] || {}), ...input, lastVerifiedAt: nowIso(), updatedAt: nowIso() }; });
  }
};

export const getServerSubscription = async (userId) => {
  await initAccountStore();
  if (usePostgres()) {
    const result = await pool.query(
      `SELECT status,plan_id,stripe_customer_id,stripe_subscription_id,last_verified_at
       FROM viewtube_subscriptions WHERE viewtube_user_id=$1 LIMIT 1`,
      [userId],
    );
    if (!result.rowCount) return null;
    const row = result.rows[0];
    return {
      status: row.status,
      planId: row.plan_id,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at).toISOString() : null,
    };
  }
  const db = await readFileDb();
  return db.subscriptions[userId] || null;
};

export const findServerSubscriptionByStripeCustomerId = async (stripeCustomerId) => {
  await initAccountStore();
  if (!stripeCustomerId) return null;
  if (usePostgres()) {
    const result = await pool.query(
      `SELECT viewtube_user_id,status,plan_id,stripe_customer_id,stripe_subscription_id,last_verified_at
       FROM viewtube_subscriptions WHERE stripe_customer_id=$1 LIMIT 1`,
      [stripeCustomerId],
    );
    if (!result.rowCount) return null;
    const row = result.rows[0];
    return {
      viewtubeUserId: row.viewtube_user_id,
      status: row.status,
      planId: row.plan_id,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at).toISOString() : null,
    };
  }
  const db = await readFileDb();
  const match = Object.entries(db.subscriptions).find(([, item]) => item.stripeCustomerId === stripeCustomerId);
  return match ? { viewtubeUserId: match[0], ...match[1] } : null;
};

export const claimWebhookEvent = async (eventId, eventType) => {
  await initAccountStore();
  if (usePostgres()) {
    const result = await pool.query(
      `INSERT INTO viewtube_webhook_events(event_id,event_type,status) VALUES($1,$2,'processing')
       ON CONFLICT (event_id) DO UPDATE SET event_type=EXCLUDED.event_type,status='processing',last_error=NULL,updated_at=NOW()
       WHERE viewtube_webhook_events.status='failed'
          OR (viewtube_webhook_events.status='processing' AND viewtube_webhook_events.updated_at < NOW() - INTERVAL '10 minutes')
       RETURNING event_id`,
      [eventId, eventType],
    );
    return result.rowCount > 0;
  }
  return updateFileDb((db) => {
    const previous = db.webhookEvents[eventId];
    const stale = previous?.status === "processing" && Date.parse(previous.updatedAt || "") < Date.now() - 10 * 60 * 1000;
    if (previous?.status === "processed" || (previous?.status === "processing" && !stale)) return false;
    db.webhookEvents[eventId] = { eventType, status: "processing", lastError: null,
      createdAt: previous?.createdAt || nowIso(), updatedAt: nowIso() };
    return true;
  });
};

export const completeWebhookEvent = async (eventId) => {
  await initAccountStore();
  if (usePostgres()) {
    await pool.query(`UPDATE viewtube_webhook_events SET status='processed',last_error=NULL,updated_at=NOW() WHERE event_id=$1`, [eventId]);
  } else {
    await updateFileDb((db) => {
      if (db.webhookEvents[eventId]) Object.assign(db.webhookEvents[eventId], { status: "processed", lastError: null, updatedAt: nowIso() });
    });
  }
};

export const failWebhookEvent = async (eventId, error) => {
  await initAccountStore();
  const message = String(error || "Webhook processing failed.").slice(0, 1000);
  if (usePostgres()) {
    await pool.query(`UPDATE viewtube_webhook_events SET status='failed',last_error=$2,updated_at=NOW() WHERE event_id=$1`, [eventId, message]);
  } else {
    await updateFileDb((db) => {
      if (db.webhookEvents[eventId]) Object.assign(db.webhookEvents[eventId], { status: "failed", lastError: message, updatedAt: nowIso() });
    });
  }
};

export const appendAiCreditLedgerEntry = async (userId, input) => {
  await initAccountStore();
  const entry = { id: input.id || `aic_${crypto.randomUUID().replace(/-/g, "")}`,
    viewtubeUserId: userId, entryType: input.entryType, deltaCredits: Math.trunc(Number(input.deltaCredits || 0)),
    idempotencyKey: input.idempotencyKey || null, metadata: input.metadata || {}, createdAt: nowIso() };
  if (usePostgres()) {
    const result = await pool.query(
      `INSERT INTO viewtube_ai_credit_ledger(id,viewtube_user_id,entry_type,delta_credits,idempotency_key,metadata)
       VALUES($1,$2,$3,$4,$5,$6::jsonb)
       ON CONFLICT (viewtube_user_id,idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING RETURNING id`,
      [entry.id, userId, entry.entryType, entry.deltaCredits, entry.idempotencyKey, JSON.stringify(entry.metadata)],
    );
    return { ...entry, inserted: result.rowCount > 0 };
  }
  return updateFileDb((db) => {
    if (entry.idempotencyKey && db.aiLedger.some((item) => item.viewtubeUserId === userId && item.idempotencyKey === entry.idempotencyKey)) return { ...entry, inserted: false };
    db.aiLedger.push(entry);
    return { ...entry, inserted: true };
  });
};

export const consumeAiCredits = async (userId, input) => {
  await initAccountStore();
  const credits = Math.max(1, Math.trunc(Number(input.credits || 0)));
  const idempotencyKey = String(input.idempotencyKey || "").slice(0, 160);
  if (!idempotencyKey) throw new Error("AI credit consumption requires an idempotency key.");
  if (usePostgres()) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [userId]);
      const existing = await client.query(
        `SELECT id FROM viewtube_ai_credit_ledger WHERE viewtube_user_id=$1 AND idempotency_key=$2 LIMIT 1`,
        [userId, idempotencyKey],
      );
      const account = await client.query(
        `SELECT s.plan_id,COALESCE(SUM(l.delta_credits),0) AS available
         FROM viewtube_subscriptions s LEFT JOIN viewtube_ai_credit_ledger l ON l.viewtube_user_id=s.viewtube_user_id
         WHERE s.viewtube_user_id=$1 GROUP BY s.plan_id`,
        [userId],
      );
      const unlimited = account.rows[0]?.plan_id === "executive";
      const available = Math.max(0, Number(account.rows[0]?.available || 0));
      if (existing.rowCount || unlimited) {
        await client.query("COMMIT");
        return { allowed: true, duplicate: existing.rowCount > 0, availableCredits: available, unlimited };
      }
      if (available < credits) {
        await client.query("ROLLBACK");
        return { allowed: false, duplicate: false, availableCredits: available, unlimited: false };
      }
      await client.query(
        `INSERT INTO viewtube_ai_credit_ledger(id,viewtube_user_id,entry_type,delta_credits,idempotency_key,metadata)
         VALUES($1,$2,'use',$3,$4,$5::jsonb)`,
        [`aic_${crypto.randomUUID().replace(/-/g, "")}`, userId, -credits, idempotencyKey, JSON.stringify(input.metadata || {})],
      );
      await client.query("COMMIT");
      return { allowed: true, duplicate: false, availableCredits: available - credits, unlimited: false };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  return updateFileDb((db) => {
    const existing = db.aiLedger.find((entry) => entry.viewtubeUserId === userId && entry.idempotencyKey === idempotencyKey);
    const unlimited = db.subscriptions[userId]?.planId === "executive";
    const available = Math.max(0, db.aiLedger.filter((entry) => entry.viewtubeUserId === userId)
      .reduce((sum, entry) => sum + Number(entry.deltaCredits || 0), 0));
    if (existing || unlimited) return { allowed: true, duplicate: Boolean(existing), availableCredits: available, unlimited };
    if (available < credits) return { allowed: false, duplicate: false, availableCredits: available, unlimited: false };
    db.aiLedger.push({
      id: `aic_${crypto.randomUUID().replace(/-/g, "")}`,
      viewtubeUserId: userId,
      entryType: "use",
      deltaCredits: -credits,
      idempotencyKey,
      metadata: input.metadata || {},
      createdAt: nowIso(),
    });
    return { allowed: true, duplicate: false, availableCredits: available - credits, unlimited: false };
  });
};

export const getAccountSnapshotData = async (userId) => {
  await initAccountStore();
  if (!userId) return null;
  if (usePostgres()) {
    const result = await pool.query(
      `SELECT u.id,u.email,u.display_name,g.scopes,g.channel_id,g.channel_title,g.channel_handle,g.channel_thumbnail,
       g.content_owners,g.active_content_owner_id,
       g.connection_status,g.token_expires_at,(g.refresh_token_ciphertext IS NOT NULL) AS has_refresh_token,
       o.status AS onboarding_status,o.next_step,o.context,
       s.status AS billing_status,s.plan_id,
       COALESCE((SELECT SUM(delta_credits) FROM viewtube_ai_credit_ledger l WHERE l.viewtube_user_id=u.id),0) AS available_credits
       FROM viewtube_users u LEFT JOIN viewtube_google_identities g ON g.viewtube_user_id=u.id
       LEFT JOIN viewtube_onboarding o ON o.viewtube_user_id=u.id LEFT JOIN viewtube_subscriptions s ON s.viewtube_user_id=u.id
       WHERE u.id=$1 LIMIT 1`, [userId],
    );
    if (!result.rowCount) return null;
    const row = result.rows[0];
    return { id: row.id, email: row.email, displayName: row.display_name, scopes: row.scopes || [],
      channelId: row.channel_id, channelTitle: row.channel_title, channelHandle: row.channel_handle,
      channelThumbnail: row.channel_thumbnail, connectionStatus: row.connection_status || "disconnected",
      contentOwners: Array.isArray(row.content_owners) ? row.content_owners : [], activeContentOwnerId: row.active_content_owner_id || null,
      tokenExpiresAt: row.token_expires_at ? new Date(row.token_expires_at).toISOString() : null,
      hasRefreshToken: Boolean(row.has_refresh_token),
      onboarding: { status: row.onboarding_status || "not_started", nextStep: row.next_step, context: row.context || {} },
      subscription: { status: row.billing_status || "inactive", planId: row.plan_id || null },
      availableCredits: Number(row.available_credits || 0) };
  }
  const db = await readFileDb();
  const user = db.users[userId];
  if (!user) return null;
  const identity = Object.values(db.googleIdentities).find((item) => item.viewtubeUserId === userId) || {};
  const credits = db.aiLedger.filter((item) => item.viewtubeUserId === userId).reduce((sum, item) => sum + Number(item.deltaCredits || 0), 0);
  return { ...user, ...identity, hasRefreshToken: Boolean(identity.refreshTokenCiphertext),
    onboarding: db.onboarding[userId] || { status: "not_started", nextStep: null, context: {} },
    subscription: db.subscriptions[userId] || { status: "inactive", planId: null }, availableCredits: credits };
};

export const accountStoreMode = () => (DATABASE_URL ? "postgres" : "development-file");
