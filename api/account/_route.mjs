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
