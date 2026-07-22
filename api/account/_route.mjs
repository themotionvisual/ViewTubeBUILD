import { handleAccountRoute } from "../../server/account-auth.mjs";

const readBody = async (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => resolve(Buffer.concat(chunks)));
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

  const handled = await handleAccountRoute({
    req,
    res,
    method,
    pathname,
    parsedUrl,
    json,
    readBody,
  });

  if (!handled && !res.writableEnded) {
    json(res, 404, { error: `Not found: ${method} ${pathname}` });
  }
};
