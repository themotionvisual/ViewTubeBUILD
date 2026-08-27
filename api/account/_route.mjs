import { handleAccountRoute } from "../../server/account-auth.mjs";

const readBody = async (req, maxBytes = Number.POSITIVE_INFINITY) =>
  new Promise((resolve, reject) => {
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

const json = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
};

// Vercel can serve the same production function behind a custom domain while
// ACCOUNT_PUBLIC_ORIGIN still reflects a deployment/project origin. Preserve
// CSRF protection by accepting only a browser Origin that exactly matches the
// request Host, then canonicalize that already-verified same-origin request to
// the account server's configured public origin before its allow-list check.
// This fixes viewtube.live + www.viewtube.live without trusting preview hosts or
// arbitrary cross-origin callers.
const canonicalizeVerifiedSameOrigin = (req) => {
  const origin = String(req.headers.origin || "").trim();
  const directHost = String(req.headers.host || "").trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
  if (!origin || (!directHost && !forwardedHost)) return;

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host.toLowerCase();
    const candidateHosts = [directHost, forwardedHost]
      .map((value) => value.toLowerCase())
      .filter(Boolean);
    if (!candidateHosts.includes(originHost)) return;

    const configuredOrigin = String(process.env.ACCOUNT_PUBLIC_ORIGIN || "").trim().replace(/\/$/, "");
    if (configuredOrigin) req.headers.origin = configuredOrigin;
  } catch {
    // Leave malformed/cross-origin values untouched so account-auth rejects them.
  }
};

export const routeAccountRequest = async (req, res) => {
  const method = String(req.method || "GET").toUpperCase();
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
      "Cache-Control": "no-store",
    });
    res.end();
    return;
  }

  canonicalizeVerifiedSameOrigin(req);

  let handled;
  try {
    handled = await handleAccountRoute({ req, res, method, pathname, parsedUrl, json, readBody });
  } catch (error) {
    return json(res, Number(error?.statusCode) || 500, { error: error instanceof Error ? error.message : "Account request failed." });
  }

  if (!handled && !res.writableEnded) {
    json(res, 404, { error: `Not found: ${method} ${pathname}` });
  }
};
